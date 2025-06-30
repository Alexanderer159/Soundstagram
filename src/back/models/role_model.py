from sqlalchemy import String, Column, ForeignKey, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db

class Role(db.Model):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    users = relationship("User", secondary="user_roles", back_populates="roles")

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }

user_roles = Table(
    "user_roles",
    db.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("role_id", ForeignKey("roles.id"), primary_key=True)
)