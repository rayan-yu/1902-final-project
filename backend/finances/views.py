from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import PlaidItem, Account, Transaction
from .serializers import AccountSerializer, TransactionSerializer
from .plaid_client import get_plaid_client
import datetime
import plaid
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import logging
import traceback

# Create logger
logger = logging.getLogger(__name__)

# Create your views here.

class CreateLinkToken(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Create a link_token for Plaid Link's initialization
        """
        client = get_plaid_client()
        
        try:
            # Create a link_token
            link_token_request = {
                'user': {
                    'client_user_id': str(request.user.id),
                },
                'products': ['transactions'],
                'client_name': 'Finance Tracker',
                'country_codes': ['US'],
                'language': 'en'
            }
            
            logger.info(f"Creating link token with request: {link_token_request}")
            response = client.link_token_create(link_token_request)
            logger.info("Link token created successfully")
            return Response({'link_token': response['link_token']})
        except plaid.ApiException as e:
            logger.error(f"Plaid API Exception: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class ExchangePublicToken(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Exchange a public token for an access token and store it
        """
        client = get_plaid_client()
        public_token = request.data.get('public_token')
        
        if not public_token:
            return Response({'error': 'Missing public_token'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Exchange public token for access token
            exchange_request = {
                'public_token': public_token
            }
            exchange_response = client.item_public_token_exchange(exchange_request)
            
            access_token = exchange_response['access_token']
            item_id = exchange_response['item_id']
            
            # Get institution information
            item_request = {
                'access_token': access_token
            }
            item_response = client.item_get(item_request)
            institution_id = item_response['item']['institution_id']
            
            institution_request = {
                'institution_id': institution_id,
                'country_codes': ['US']
            }
            institution_response = client.institutions_get_by_id(institution_request)
            institution_name = institution_response['institution']['name']
            
            # Save to database
            plaid_item = PlaidItem.objects.create(
                user=request.user,
                access_token=access_token,
                item_id=item_id,
                institution_name=institution_name
            )
            
            # Fetch accounts and transactions
            self._fetch_accounts(client, plaid_item)
            
            return Response({'success': True, 'institution_name': institution_name})
        except plaid.ApiException as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _fetch_accounts(self, client, plaid_item):
        """Fetch accounts for the Plaid Item"""
        try:
            accounts_request = {
                'access_token': plaid_item.access_token
            }
            accounts_response = client.accounts_get(accounts_request)
            
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
        except plaid.ApiException as e:
            # Log the error but don't fail the whole request
            print(f"Error fetching accounts: {e}")
    
    def _fetch_transactions(self, client, plaid_item):
        """Fetch transactions for the Plaid Item"""
        try:
            # Get transactions for the last 30 days
            end_date = datetime.datetime.now().date()
            start_date = end_date - datetime.timedelta(days=30)
            
            transactions_request = {
                'access_token': plaid_item.access_token,
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d')
            }
            
            # Use transactions_get method to fetch transactions
            transactions_response = client.transactions_get(transactions_request)
            accounts = {account.account_id: account for account in Account.objects.filter(plaid_item=plaid_item)}
            
            # Save transactions to database
            for transaction in transactions_response['transactions']:
                account = accounts.get(transaction['account_id'])
                if account:
                    Transaction.objects.create(
                        account=account,
                        transaction_id=transaction['transaction_id'],
                        amount=transaction['amount'],
                        date=transaction['date'],
                        name=transaction['name'],
                        category=transaction['category'][0] if transaction.get('category') else 'Uncategorized',
                        pending=transaction['pending']
                    )
        except plaid.ApiException as e:
            # Log the error but don't fail the whole request
            print(f"Error fetching transactions: {e}")

class AccountsList(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all accounts for the authenticated user"""
        plaid_items = PlaidItem.objects.filter(user=request.user)
        accounts = Account.objects.filter(plaid_item__in=plaid_items)
        serializer = AccountSerializer(accounts, many=True)
        return Response(serializer.data)

class TransactionsList(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get transactions for the authenticated user with optional filtering"""
        # Get query parameters for filtering
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        account_id = request.query_params.get('account_id')
        category = request.query_params.get('category')
        
        # Build query
        plaid_items = PlaidItem.objects.filter(user=request.user)
        accounts = Account.objects.filter(plaid_item__in=plaid_items)
        
        if account_id:
            accounts = accounts.filter(id=account_id)
            
        transactions_query = Transaction.objects.filter(account__in=accounts)
        
        if start_date:
            transactions_query = transactions_query.filter(date__gte=start_date)
        if end_date:
            transactions_query = transactions_query.filter(date__lte=end_date)
        if category:
            transactions_query = transactions_query.filter(category=category)
        
        serializer = TransactionSerializer(transactions_query, many=True)
        return Response(serializer.data)

class UnlinkAccount(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, account_id):
        """
        Unlink an account from the user's profile
        """
        # Get the account
        account = get_object_or_404(Account, id=account_id)
        
        # Check that the account belongs to the current user
        if account.plaid_item.user != request.user:
            return Response(
                {"error": "You do not have permission to unlink this account"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get all accounts associated with this item
        associated_accounts = Account.objects.filter(plaid_item=account.plaid_item)
        
        # If this is the only account for this item, remove the item too
        if associated_accounts.count() == 1:
            # Get the item to remove
            plaid_item = account.plaid_item
            
            # Remove all transactions first (due to foreign key constraints)
            Transaction.objects.filter(account=account).delete()
            
            # Remove the account
            account.delete()
            
            # Remove the item
            plaid_item.delete()
            
            return Response(
                {"status": "success", "message": "Account and associated item have been unlinked"}, 
                status=status.HTTP_200_OK
            )
        else:
            # Remove all transactions first (due to foreign key constraints)
            Transaction.objects.filter(account=account).delete()
            
            # Remove just this account
            account.delete()
            
            return Response(
                {"status": "success", "message": "Account has been unlinked"}, 
                status=status.HTTP_200_OK
            )

class UnlinkAllAccounts(APIView):
    permission_classes = [IsAuthenticated]
    
    def delete(self, request):
        """
        Unlink all accounts for the authenticated user
        """
        try:
            # Get all PlaidItems for the user
            plaid_items = PlaidItem.objects.filter(user=request.user)
            
            if not plaid_items.exists():
                return Response(
                    {"status": "success", "message": "No accounts to unlink"}, 
                    status=status.HTTP_200_OK
                )
            
            # Delete all accounts (and their transactions due to cascading)
            accounts_count = Account.objects.filter(plaid_item__in=plaid_items).count()
            Transaction.objects.filter(account__plaid_item__in=plaid_items).delete()
            Account.objects.filter(plaid_item__in=plaid_items).delete()
            
            # Delete all PlaidItems
            plaid_items.delete()
            
            return Response(
                {"status": "success", "message": f"Successfully unlinked {accounts_count} accounts"},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Error unlinking all accounts: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": "Failed to unlink accounts"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
