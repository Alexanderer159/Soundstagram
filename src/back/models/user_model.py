from datetime import datetime
from sqlalchemy import String, Column, DateTime, ForeignKey, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship
from back.extensions import db



class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(nullable=False)
    bio: Mapped[str] = mapped_column(nullable=True)
    profile_pic_url: Mapped[str] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    spotify_playlist: Mapped[str] = mapped_column(nullable=True)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    uploaded_tracks: Mapped[list["Track"]] = relationship("Track", back_populates="uploader")
    roles = relationship("Role", secondary="user_roles", back_populates="users")
    instruments = relationship("Instrument", secondary="user_instruments", back_populates="users")
    collaborations: Mapped[list["Collaborator"]] = relationship("Collaborator", back_populates="user", cascade="all, delete-orphan")
    
    likes: Mapped[list["Like"]] = relationship("Like", back_populates="user", cascade="all, delete-orphan")
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    followed = relationship("Follow", foreign_keys="[Follow.follower_id]", backref="follower_user", cascade="all, delete-orphan")
                            
    conversations_sent = relationship("Conversation", foreign_keys="[Conversation.user1_id]")
    conversations_received = relationship("Conversation", foreign_keys="[Conversation.user2_id]")
    sent_messages = relationship("Message", foreign_keys="[Message.sender_id]")

    followers = relationship("Follow", foreign_keys="[Follow.followed_id]", backref="followed_user", cascade="all, delete-orphan"
)



    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "bio": self.bio,
            "profile_pic_url": self.profile_pic_url,
            "spotify_playlist": self.spotify_playlist,
            "roles": [role.serialize() for role in self.roles],
            "instruments": [instr.serialize() for instr in self.instruments],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }