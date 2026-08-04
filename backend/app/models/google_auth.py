from datetime import datetime
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, func, Text, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class UserGoogleAuth(Base):
    __tablename__ = "user_google_auth"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    access_token: Mapped[str] = mapped_column(Text, nullable=False)

    refresh_token: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    token_expiry: Mapped[datetime] = mapped_column(DateTime, nullable=False)

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    owner: Mapped["User"] = relationship(back_populates="google_auth")

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    