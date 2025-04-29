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
    
    # print(f"PLAID_CLIENT_ID: {client_id}")
    # print(f"PLAID_SECRET: {secret}")
    # print(f"PLAID_ENV: {environment}")
    
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
    
    # Create API client with proper configurations
    api_client = plaid.ApiClient(configuration)
    
    # Fix SSL verification issue (development only)
    api_client.rest_client.pool_manager.connection_pool_kw['cert_reqs'] = 'CERT_NONE'
    
    # Fix header handling - ensure all default headers have string values
    default_headers = api_client.default_headers
    for key in list(default_headers.keys()):
        if default_headers[key] is None:
            default_headers.pop(key)
    
    return plaid_api.PlaidApi(api_client) 