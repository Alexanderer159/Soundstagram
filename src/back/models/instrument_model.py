from sqlalchemy import String, Column, ForeignKey, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db

class Instrument(db.Model):
    __tablename__ = "instruments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    users = relationship("User", secondary="user_instruments", back_populates="instruments")
    tracks: Mapped[list["Track"]] = relationship("Track", back_populates="instrument")   

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name
        }

user_instruments = Table(
    "user_instruments",
    db.metadata,
    Column("user_id", ForeignKey("users.id"), primary_key=True),
    Column("instrument_id", ForeignKey("instruments.id"), primary_key=True)
)