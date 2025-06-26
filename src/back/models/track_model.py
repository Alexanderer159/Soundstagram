from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from back.models.user_model import User, Project

db = SQLAlchemy()

class Track(db.Model):
    __tablename__ = "track"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    track_name: Mapped[str] = mapped_column(String(100), nullable=False)
    instrument: Mapped[str] = mapped_column(Text, nullable=True)
    file_url: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.timezone.utc, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.timezone.utc, onupdate=datetime.timezone.utc, nullable=False)

    project_id: Mapped[int] = mapped_column(ForeignKey('projects.id'), nullable=False)
    project: Mapped["Project"] = relationship("Project", backref="track")
    uploader_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    uploader: Mapped["User"] = relationship("User", backref="track")

    def serialize(self):
        return {
            "id": self.id,
            "track_name": self.track_name,
            "instrument": self.instrument,
            "file_url": self.file_url,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "project_id": self.project_id,
            "uploader_id": self.uploader_id
        }
