from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db
from sqlalchemy import JSON

class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    bio: Mapped[str] = mapped_column(nullable=True)
    profile_pic_url: Mapped[str] = mapped_column(nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean(), default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    roles: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=[])
    instruments: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=[])
    spotify_playlist: Mapped[str] = mapped_column(nullable=True)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    uploaded_tracks: Mapped[list["Track"]] = relationship("Track", back_populates="uploader")


    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "bio": self.bio,
            "profile_pic_url": self.profile_pic_url,
            "spotify_playlist": self.spotify_playlist,
            "roles": self.roles,
            "instruments": self.instruments,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }