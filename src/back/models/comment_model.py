from datetime import datetime
from sqlalchemy import Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db

class Comment(db.Model):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    author_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    project_id: Mapped[int] = mapped_column(ForeignKey('projects.id'), nullable=True)
    track_id: Mapped[int] = mapped_column(ForeignKey('tracks.id'), nullable=True)

    author: Mapped["User"] = relationship("User", back_populates="comments")
    project: Mapped["Project"] = relationship("Project", back_populates="comments")
    track: Mapped["Track"] = relationship("Track", back_populates="comments")

    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "author_id": self.author_id,
            "project_id": self.project_id,
            "track_id": self.track_id,
        }
