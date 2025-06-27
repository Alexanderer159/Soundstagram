import enum
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db

# Enums reales usando enum.Enum de Python
class VisibilityEnum(enum.Enum):
    public = "public"
    private = "private"

class StatusEnum(enum.Enum):
    active = "active"
    archived = "archived"

class Project(db.Model):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    genre: Mapped[str] = mapped_column(String(50), nullable=True)
    tags: Mapped[str] = mapped_column(String(50), nullable=True)
    visibility: Mapped[VisibilityEnum] = mapped_column(SQLEnum(VisibilityEnum), default=VisibilityEnum.public, nullable=False)
    status: Mapped[StatusEnum] = mapped_column(SQLEnum(StatusEnum), default=StatusEnum.active, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    owner: Mapped["User"] = relationship("User", back_populates="projects")

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "genre": self.genre,
            "tags": self.tags,
            "visibility": self.visibility.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "owner_id": self.owner_id,
            "owner_username": self.owner.username if self.owner else None,
            "owner_pic": self.owner.profile_pic_url if self.owner else None
        }
