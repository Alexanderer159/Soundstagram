from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db
import enum

class TrackStatus(enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
class Track(db.Model):
    __tablename__ = "tracks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey('projects.id'), nullable=False)
    uploader_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)

    track_name: Mapped[str] = mapped_column(String(120), nullable=False)
    file_url: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    duration: Mapped[int] = mapped_column(nullable=True)
    status: Mapped[TrackStatus] = mapped_column(SQLEnum(TrackStatus), default=TrackStatus.pending, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    instrument_id: Mapped[int] = mapped_column(ForeignKey('instruments.id'), nullable=True)
    instrument: Mapped["Instrument"] = relationship("Instrument", back_populates="tracks")

    project: Mapped["Project"] = relationship("Project", back_populates="tracks")
    uploader: Mapped["User"] = relationship("User", back_populates="uploaded_tracks")
    likes: Mapped[list["Like"]] = relationship("Like", back_populates="track", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="track", cascade="all, delete-orphan")


    def serialize(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "uploader_id": self.uploader_id,
            "track_name": self.track_name,
            "file_url": self.file_url,
            "description": self.description,
            "duration": self.duration,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "instrument_id": self.instrument_id,
        }
