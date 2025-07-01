import enum
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db
from back.models.genre_model import Genre, project_genres

class VisibilityEnum(enum.Enum):
    public = "public"
    private = "private"

class StatusEnum(enum.Enum):
    active = "active"
    archived = "archived"
    
class KeyEnum(enum.Enum):
    C_MAJOR = "C Major"
    G_MAJOR = "G Major"
    D_MAJOR = "D Major"
    A_MAJOR = "A Major"
    E_MAJOR = "E Major"
    B_MAJOR = "B Major"
    F_SHARP_MAJOR = "F# Major"
    C_SHARP_MAJOR = "C# Major"
    F_MAJOR = "F Major"
    B_FLAT_MAJOR = "Bb Major"
    E_FLAT_MAJOR = "Eb Major"
    A_FLAT_MAJOR = "Ab Major"
    D_FLAT_MAJOR = "Db Major"
    G_FLAT_MAJOR = "Gb Major"

    A_MINOR = "A Minor"
    E_MINOR = "E Minor"
    B_MINOR = "B Minor"
    F_SHARP_MINOR = "F# Minor"
    C_SHARP_MINOR = "C# Minor"
    G_SHARP_MINOR = "G# Minor"
    D_SHARP_MINOR = "D# Minor"
    A_SHARP_MINOR = "A# Minor"
    D_MINOR = "D Minor"
    G_MINOR = "G Minor"
    C_MINOR = "C Minor"
    F_MINOR = "F Minor"
    B_FLAT_MINOR = "Bb Minor"
    E_FLAT_MINOR = "Eb Minor"
    
class MeterEnum(enum.Enum):
    FOUR_FOUR = "4/4"
    THREE_FOUR = "3/4"
    SIX_EIGHT = "6/8"
    FIVE_FOUR = "5/4"
    SEVEN_EIGHT = "7/8"



class Project(db.Model):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    key: Mapped[KeyEnum] = mapped_column(SQLEnum(KeyEnum), nullable=True)
    meter: Mapped[MeterEnum] = mapped_column(SQLEnum(MeterEnum), nullable=True)
    bpm: Mapped[int] = mapped_column(nullable=True)
    tags: Mapped[str] = mapped_column(String(50), nullable=True)
    visibility: Mapped[VisibilityEnum] = mapped_column(SQLEnum(VisibilityEnum), default=VisibilityEnum.public, nullable=False)
    status: Mapped[StatusEnum] = mapped_column(SQLEnum(StatusEnum), default=StatusEnum.active, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    owner_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    owner: Mapped["User"] = relationship("User", back_populates="projects")
    
    tracks: Mapped[list["Track"]] = relationship("Track", back_populates="project")
    genres: Mapped[list["Genre"]] = relationship("Genre", secondary=project_genres, backref="projects")

    

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "tags": self.tags,
            "key": self.key.value if self.key else None,
            "meter": self.meter.value if self.meter else None,
            "bpm": self.bpm,
            "visibility": self.visibility.value,
            "status": self.status.value,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "owner_id": self.owner_id,
            "owner_username": self.owner.username if self.owner else None,
            "owner_pic": self.owner.profile_pic_url if self.owner else None,
            "genres": [g.serialize() for g in self.genres],
        }
