import os
from flask_admin import Admin
from back.extensions import db
from .models.user_model import User
from .models.project_model import Project
from .models.track_model import Track
from .models.role_model import Role
from .models.instrument_model import Instrument
from .models.genre_model import Genre
from .models.collaborator_model import Collaborator
from .models.notification_model import Notification
from .models.follow_model import Follow
from .models.comment_model import Comment
from .models.chat_model import Chat
from .models.like_model import Like
from flask_admin.contrib.sqla import ModelView

def setup_admin(app):
    app.secret_key = os.environ.get('FLASK_APP_KEY', 'sample key')
    app.config['FLASK_ADMIN_SWATCH'] = 'cerulean'
    admin = Admin(app, name='Soundstagradmin', template_mode='bootstrap4')

    
    # Add your models here, for example this is how we add a the User model to the admin
    admin.add_view(ModelView(User, db.session))
    admin.add_view(ModelView(Project, db.session))
    admin.add_view(ModelView(Track, db.session))
    admin.add_view(ModelView(Role, db.session))
    admin.add_view(ModelView(Instrument, db.session))
    admin.add_view(ModelView(Genre, db.session))
    admin.add_view(ModelView(Collaborator, db.session))
    admin.add_view(ModelView(Notification, db.session))
    admin.add_view(ModelView(Follow, db.session))
    admin.add_view(ModelView(Comment, db.session))
    admin.add_view(ModelView(Chat, db.session))
    admin.add_view(ModelView(Like, db.session))
    # You can duplicate that line to add mew models
    # admin.add_view(ModelView(YourModelName, db.session))