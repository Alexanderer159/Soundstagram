from datetime import datetime
from sqlalchemy import Integer, Text, ForeignKey, DateTime, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum
from back.extensions import db

class NotificationType(enum.Enum):
    message = "message"
    follow = "follow"
    like = "like"
    comment = "comment"
    track_pending = "track_pending"
    track_approved = "track_approved" 
    track_rejected = "track_rejected"


class Notification(db.Model):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    recipient_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    sender_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=True)
    notif_type: Mapped[NotificationType] = mapped_column(SQLEnum(NotificationType), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=True)
    track_id: Mapped[int] = mapped_column(ForeignKey("tracks.id"), nullable=True)
    is_read: Mapped[bool] = mapped_column(default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    recipient = relationship("User", foreign_keys=[recipient_id], back_populates="notifications_received")
    sender = relationship("User", foreign_keys=[sender_id])
    project: Mapped["Project"] = relationship("Project")
    track: Mapped["Track"] = relationship("Track")

    def serialize(self):
        return {
            "id": self.id,
            "recipient_id": self.recipient_id,
            "sender_id": self.sender_id,
            "notif_type": self.notif_type.value,
            "message": self.message,
            "project_id": self.project_id,
            "track_id": self.track_id,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat()
        }
