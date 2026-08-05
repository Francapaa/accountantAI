"""Demo endpoint proving the JWT verification middleware works end to end."""

from fastapi import APIRouter, Depends

from app.api.auth import CurrentUser, get_current_user

router = APIRouter()


@router.get("/api/me", response_model=CurrentUser)
def me(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """Returns the authenticated user, decoded from the verified Supabase JWT."""
    return user