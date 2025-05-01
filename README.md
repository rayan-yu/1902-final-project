# Personal Finance Tracker

## Set up

Clone repo
Set up below

.env
- make a plaid dev account
- set plaid id, plaid secret, plaid env in .env

cd backend and create venv
- activate your venv
- pip install -r requirements.txt
- python manage.py runserver
- everything is locally hosted

cd frontend and install needed components
- npm install
- npm start

Linking accounts
- click link accounts on dashboard
- select continue as guest
- in sandbox mode, you can choose any institutions from here: https://plaid.com/docs/sandbox/institutions/
- search up the test institution you want, use user: user_good, pass: pass_good
- login and add those accounts
- note this app is only implemented for checking accounts
- cards tab is a placeholder for now
- some frontend buttons are also just placeholders

## Project Overview
I'm proposing a web application that leverages the Plaid API to create an organized, user-friendly financial dashboard. Instead of manually processing PDF bank statements, the application will directly connect to users' bank accounts through Plaid to automatically retrieve and categorize transactions, and provide visualizations of spending patterns and cash flow. This approach will enable real-time tracking of daily, weekly, and monthly spending across multiple financial institutions.

## Technical Overview
The core functionality will involve connecting to financial institutions via the Plaid API, securely storing access tokens, and regularly syncing transaction data. 

### Backend
I'll build the backend using Django. The application will include RESTful APIs for data retrieval and manipulation, along with webhook endpoints to receive real-time transaction updates from Plaid.

### Frontend
The user interface will be developed using React. The application will use Plaid Link, a drop-in module, to securely connect user bank accounts.

## Packages
- **django**: Web framework for backend development
- **djangorestframework**: For building RESTful APIs
- **plaid-python**: Python client for Plaid API integration
- **python-dotenv**: For environment variable management
- **psycopg2**: For PostgreSQL database connectivity
- **celery**: For scheduling recurring tasks (like transaction updates)
- **react**: For frontend development
- **react-plaid-link**: Official Plaid Link React component
- **chart.js/react-chartjs-2**: For data visualization
- **axios**: For API communication
- **tailwindcss**: For UI styling

## Plaid API Integration Components
1. **Authentication**: Using Plaid Link to securely connect bank accounts
2. **Transaction Syncing**: Retrieving historical and new transactions
3. **Balance Monitoring**: Tracking account balances in real-time
4. **Webhooks**: Receiving notifications about new transactions
5. **Categorization**: Utilizing Plaid's built-in transaction categorization

## Likely Challenges
The most challenging aspects will likely be:
1. **Plaid API Authentication Flow**: Implementing the complete OAuth flow with proper security
2. **Webhook Integration**: Processing real-time updates reliably
3. **Handling Different Account Types**: Managing variations between checking, savings, credit cards, etc.
4. **Category Customization**: Extending Plaid's built-in categories to match user preferences
5. **Production Access**: Navigating Plaid's approval process for production access

## End Goals
The completed application will allow users to:
1. Securely connect multiple bank accounts via Plaid
2. View comprehensive financial dashboards
3. Track spending by category with minimal manual intervention
4. Analyze income and expenses over time
5. Receive insights about spending patterns
6. Monitor real-time financial activity through automatic updates
7. Set budgets and receive notifications when approaching limits

This tool will transform financial tracking from a manual, monthly review process into an automated, data-driven approach to financial decision making, with minimal setup effort required from users.

## Development Phases
1. **Initial Development**: Build with Plaid Sandbox environment using test data
2. **Personal Testing**: Move to Development environment to test with personal accounts
3. **Refinement**: Add features like budgeting, insights, and custom categories
4. **Production Preparation**: Apply for Plaid Production access (if planning to release publicly)

By focusing exclusively on the Plaid API integration rather than PDF parsing, this approach will deliver a more robust, real-time financial tracking solution with significantly less development complexity.