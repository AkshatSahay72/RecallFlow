import jwt 
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from google_auth_oauthlib.flow import Flow

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.models.google_auth import UserGoogleAuth
from app.core.config import settings

import os
# Allow HTTP traffic locally for Google OAuth callback validation
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"


router = APIRouter()

def get_client_config():
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Client ID and Secret are not configured in settings."
        )
    return {
        "web": {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "project_id": "recallflow",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
        }
    }
    

SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/tasks"
]
from typing import Optional
from sqlalchemy import select
from app.schemas.token import TokenPayload
@router.get("/google/login")
async def login_google(
    token: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Step 1: Redirect user to Google's consent screen.
    Accepts JWT token in the query parameter to support browser-based redirections.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required as a query parameter."
        )
    # 1. Decode token to find current user
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials"
        )
    statement = select(User).where(User.email == token_data.sub)
    current_user = db.execute(statement).scalar_one_or_none()
    if not current_user or not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive."
        )
    # 2. Generate authorization URL first to generate the verifier
    flow = Flow.from_client_config(get_client_config(), scopes=SCOPES)
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    authorization_url, state = flow.authorization_url(
        access_type="offline",
        prompt="consent"
    )

    # 3. Create the OAuth state token containing both user_id and code_verifier
    state_payload = {
        "user_id": current_user.id,
        "code_verifier": flow.code_verifier,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
    }
    state_token = jwt.encode(state_payload, settings.JWT_SECRET_KEY, algorithm=settings.ALGORITHM)

    # 4. Re-generate URL using the signed token as state
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        state=state_token
    )
    return RedirectResponse(authorization_url)

@router.get("/google/callback")
async def callback_google(
    request: Request,
    code: str,
    state: str,
    db: Session = Depends(get_db)
):
    """
    Step 2: Google redirects here with authorization code and state token.
    We decode the state, exchange the code for credentials, and save them.
    """
    # 1. Decode state token and retrieve user_id and code_verifier
    try:
        payload = jwt.decode(state, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("user_id")
        code_verifier = payload.get("code_verifier")
        if not user_id or not code_verifier:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state payload.")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OAuth state expired.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state token.")
    # 2. Exchange authorization code for tokens
    flow = Flow.from_client_config(get_client_config(), scopes=SCOPES)
    flow.redirect_uri = settings.GOOGLE_REDIRECT_URI
    flow.code_verifier = code_verifier
    
    try:
        # Fetch tokens using the full request URL containing the code
        flow.fetch_token(authorization_response=str(request.url))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to fetch token: {str(e)}")
    credentials = flow.credentials
    # Calculate token expiration timestamp
    expiry_time = credentials.expiry.replace(tzinfo=None) if credentials.expiry else datetime.utcnow() + timedelta(seconds=credentials.expires_in or 3600)
    # 3. Save or update credentials in db
    db_auth = db.query(UserGoogleAuth).filter(UserGoogleAuth.owner_id == user_id).first()
    
    if db_auth:
        db_auth.access_token = credentials.token
        # Refresh token is only sent on first login/consent prompt
        if credentials.refresh_token:
            db_auth.refresh_token = credentials.refresh_token
        db_auth.token_expiry = expiry_time
    else:
        db_auth = UserGoogleAuth(
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
            token_expiry=expiry_time,
            owner_id=user_id
        )
        db.add(db_auth)
    db.commit()
    return {"status": "success", "message": "Google Account linked successfully!"}
