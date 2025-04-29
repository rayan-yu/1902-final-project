import plaid
from plaid.api import plaid_api
import os
from django.conf import settings

def get_plaid_client():
    """
    Create and return a Plaid API client instance.
    Uses environment variables for configuration.
    """
    client_id = settings.PLAID_CLIENT_ID
    secret = settings.PLAID_SECRET
    environment = settings.PLAID_ENV
    
    # Determine the Plaid environment
    if environment == 'sandbox':
        host = plaid.Environment.Sandbox
    elif environment == 'development':
        host = plaid.Environment.Development
    elif environment == 'production':
        host = plaid.Environment.Production
    else:
        # Default to Sandbox if not specified
        host = plaid.Environment.Sandbox
    
    # Configure the Plaid client
    configuration = plaid.Configuration(
        host=host,
        api_key={
            'clientId': client_id,
            'secret': secret,
        }
    )
    
    api_client = plaid.ApiClient(configuration)
    return plaid_api.PlaidApi(api_client) 