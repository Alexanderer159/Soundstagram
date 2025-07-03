from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, String, Enum as SQLEnum
import enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db

class CollaboratorStatus(enum.Enum):
    pending = "pending"
    approved = "approved"

class Collaborator(db.Model):
    __tablename__ = "collaborators"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[CollaboratorStatus] = mapped_column(SQLEnum(CollaboratorStatus), default=CollaboratorStatus.pending, nullable=False)
    project: Mapped["Project"] = relationship("Project", back_populates="collaborators")
    user: Mapped["User"] = relationship("User", back_populates="collaborations")

    def serialize(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "status": self.status.value,
            "user_id": self.user_id,
            "joined_at": self.joined_at.isoformat(),
        }
