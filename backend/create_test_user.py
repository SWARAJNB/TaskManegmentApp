from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models, database, auth
import sys

# Setup DB connection
SQLALCHEMY_DATABASE_URL = "sqlite:///./task_management.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_user():
    db = SessionLocal()
    email = "admin@example.com"
    password = "password123"
    full_name = "Admin User"

    try:
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            print(f"User already exists.")
            # Update password
            user.hashed_password = auth.get_password_hash(password)
            db.commit()
            print(f"Password reset to: {password}")
        else:
            hashed_password = auth.get_password_hash(password)
            db_user = models.User(email=email, hashed_password=hashed_password, full_name=full_name)
            db.add(db_user)
            db.commit()
            print(f"User created.")

        print(f"Credentials:\nEmail: {email}\nPassword: {password}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
