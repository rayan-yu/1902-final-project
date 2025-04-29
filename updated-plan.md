### Hour 1: Project Setup & Configuration
1. Configure Django settings
   - Add rest_framework, corsheaders to INSTALLED_APPS
   - Configure CORS to allow localhost:3000
   - Set up JWT authentication
2. Create basic models in finances app
3. Set up environment variables for Plaid credentials

### Hour 2: Plaid Integration Basics
1. Create plaid_client.py utility
2. Implement create_link_token view
3. Implement exchange_public_token view
4. Add URL routes

### Hour 3: User Authentication
1. Set up simple user model and serializer
2. Create login/register endpoints
3. Configure token authentication

### Hour 4: Transaction & Account APIs
1. Implement account fetching view
2. Create transaction retrieval endpoint with basic filtering
3. Add URL patterns

### Hour 5: React Frontend - Authentication
1. Create authentication context
2. Build simple login/signup forms
3. Set up protected routes

### Hour 6: React Frontend - Plaid Link
1. Create PlaidLink component for account connecting
2. Implement institution connection page
3. Add success/error handling

### Hour 7: React Frontend - Dashboard
1. Build simple accounts view
2. Create transaction list component
3. Add basic filtering

### Hour 8: Finalize & Polish
1. Connect all components together
2. Add basic error handling
3. Test end-to-end flow
4. Fix any critical bugs

## Essential Code Snippets

### Django Models
```python
# finances/models.py
from django.db import models
from django.contrib.auth.models import User

class PlaidItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item_id = models.CharField(max_length=255)
    access_token = models.CharField(max_length=255)
    institution_name = models.CharField(max_length=255, blank=True)

class Account(models.Model):
    plaid_item = models.ForeignKey(PlaidItem, on_delete=models.CASCADE, related_name='accounts')
    account_id = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    subtype = models.CharField(max_length=50, null=True, blank=True)
    current_balance = models.DecimalField(max_digits=12, decimal_places=2, null=True)

class Transaction(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transactions')
    transaction_id = models.CharField(max_length=255)
    date = models.DateField()
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100, null=True, blank=True)
```

### Plaid Integration Views
```python
# finances/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .plaid_client import get_plaid_client
from .models import PlaidItem, Account, Transaction
from .serializers import AccountSerializer, TransactionSerializer

class CreateLinkToken(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        client = get_plaid_client()
        
        try:
            response = client.link_token_create({
                'user': {
                    'client_user_id': str(request.user.id),
                },
                'client_name': 'Finance Tracker',
                'products': ['transactions'],
                'country_codes': ['US'],
                'language': 'en'
            })
            
            return Response({'link_token': response['link_token']})
        except Exception as e:
            return Response({'error': str(e)}, status=400)

class ExchangePublicToken(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        client = get_plaid_client()
        public_token = request.data.get('public_token')
        
        try:
            exchange_response = client.item_public_token_exchange({
                'public_token': public_token
            })
            
            access_token = exchange_response['access_token']
            item_id = exchange_response['item_id']
            
            # Get institution name
            item_response = client.item_get({
                'access_token': access_token
            })
            institution_id = item_response['item']['institution_id']
            
            institution_response = client.institutions_get_by_id({
                'institution_id': institution_id,
                'country_codes': ['US']
            })
            institution_name = institution_response['institution']['name']
            
            # Save to database
            plaid_item = PlaidItem.objects.create(
                user=request.user,
                access_token=access_token,
                item_id=item_id,
                institution_name=institution_name
            )
            
            # Fetch accounts
            self._fetch_accounts(client, plaid_item)
            
            return Response({'success': True})
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    def _fetch_accounts(self, client, plaid_item):
        try:
            accounts_response = client.accounts_get({
                'access_token': plaid_item.access_token
            })
            
            for account_data in accounts_response['accounts']:
                Account.objects.create(
                    plaid_item=plaid_item,
                    account_id=account_data['account_id'],
                    name=account_data['name'],
                    type=account_data['type'],
                    subtype=account_data.get('subtype'),
                    current_balance=account_data['balances']['current']
                )
            
            # Fetch initial transactions
            self._fetch_transactions(client, plaid_item)
        except Exception as e:
            print(f"Error fetching accounts: {e}")
```

### React App Structure
```jsx
// App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlaidConnect from './pages/PlaidConnect';
import { AuthContext } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('token') ? true : false
  );

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/connect" 
            element={
              <PrivateRoute>
                <PlaidConnect />
              </PrivateRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
```

### Plaid Link Component
```jsx
// components/PlaidLink.js
import { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const PlaidLinkButton = () => {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        setLoading(true);
        const response = await api.get('/link-token/');
        setLinkToken(response.data.link_token);
        setLoading(false);
      } catch (err) {
        setError('Failed to get link token');
        setLoading(false);
      }
    };
    
    getLinkToken();
  }, []);

  const onSuccess = async (public_token, metadata) => {
    try {
      await api.post('/exchange-token/', { public_token });
      navigate('/');
    } catch (err) {
      setError('Failed to connect account');
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <button 
      onClick={() => open()} 
      disabled={!ready || !linkToken}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    >
      Connect Your Bank Account
    </button>
  );
};

export default PlaidLinkButton;
```

## Final Tips for One-Night Implementation

1. **Focus on happy path** - Don't worry about edge cases initially
2. **Use Plaid Sandbox** - Don't attempt to set up production credentials tonight
3. **Minimal styling** - Use minimal CSS or a simple Tailwind setup
4. **Skip complex features** - No need for budgeting, forecasting, etc.
5. **Test as you go** - Test each component individually before integration
6. **Keep console open** - Monitor for errors and fix critical ones immediately
7. **Use sample data** - Plaid sandbox has test accounts you can use

With this focused approach, you should be able to get a working MVP in one night that demonstrates the core functionality of connecting bank accounts via Plaid and displaying transaction data.