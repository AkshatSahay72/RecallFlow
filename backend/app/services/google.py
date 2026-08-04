from datetime import tzinfo
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from google.oauth2.credentials import Credentials 
from google.auth.transport.requests import Request as GoogleRequest
from googleapiclient.discovery import build

from app.core.config import settings
from app.models.google_auth import UserGoogleAuth

def get_google_credentials(
    db: Session,
    user_id: int
) -> Optional[Credentials]:
    """
    Retrieves Google OAuth credentials for a user, automatically refreshing the access token if it has expired.
    Return None if the user hasn't linked their Google account.
    """

    db_auth = db.query(UserGoogleAuth).filter(UserGoogleAuth.owner_id == user_id).first()
    if not db_auth:
        return None

    creds = Credentials(
        token=db_auth.access_token,
        refresh_token=db_auth.refresh_token,
        token_url="htpps://oauth2.googleapis.com/token",
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        expiry=db_auth.token_expiry
    )

    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(GoogleRequest())

            db_auth.access_token=creds.token
            db_auth.token_expiry=creds.token_expiry.replace(tzinfo=None) if creds.expiry else db_auth.token_expiry

            if creds.refresh_token:
                db_auth.refresh_token = creds.refresh_token
            db.commit()
            db.refresh(db_auth)
        except Exception as e:
            print(f"Error refreshing Google Credentials for user {user_id}: {str(e)}")
            return None
    return creds

def get_google_services(service_name: str, version: str, db: Session, user_id: int):
    """
    Builds and returns a Google API service client (e.g. 'calendar', 'tasks').
    Return None if the user has not linked their Google account.
    """
    creds = get_google_credentials(db, user_id)
    if not creds:
        return None 
    return build(service_name, version, credentials=creds)