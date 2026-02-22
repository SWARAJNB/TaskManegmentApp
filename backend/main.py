from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from fastapi.encoders import jsonable_encoder
import json


from fastapi.responses import StreamingResponse
import io
import csv

import models, schemas, crud, auth, database

models.Base.metadata.create_all(bind=database.engine)

# Auto-migration: add time_spent column if it doesn't exist (for existing databases)
# ONLY RUNS FOR SQLITE
def _run_migrations():
    if "sqlite" not in database.SQLALCHEMY_DATABASE_URL:
        print("[MIGRATION] Skipping SQLite-specific migrations for non-SQLite database.")
        return

    import sqlite3
    try:
        # Parse database path from URL "sqlite:///./task_management.db"
        db_path = database.SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [col[1] for col in cursor.fetchall()]
        if "time_spent" not in columns:
            cursor.execute("ALTER TABLE tasks ADD COLUMN time_spent REAL DEFAULT 0.0")
            conn.commit()
            print("[MIGRATION] Added 'time_spent' column to tasks table.")
        
        # Add profile_image to users if missing
        cursor.execute("PRAGMA table_info(users)")
        user_columns = [col[1] for col in cursor.fetchall()]
        if "profile_image" not in user_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN profile_image TEXT")
            conn.commit()
            print("[MIGRATION] Added 'profile_image' column to users table.")

        if "mobile_number" not in user_columns:
            cursor.execute("ALTER TABLE users ADD COLUMN mobile_number TEXT")
            conn.commit()
            print("[MIGRATION] Added 'mobile_number' column to users table.")
        
        conn.close()
    except Exception as e:
        print(f"[MIGRATION] Warning: {e}")

_run_migrations()

app = FastAPI(title="Task Management System")

# CORS configuration — reads from CORS_ORIGINS env var (comma-separated) with local dev defaults
import os as _os
_default_origins = (
    "http://localhost:5173,"
    "http://localhost:3000,"
    "https://taskmanagement-frontend-6p1k.onrender.com"
)
_cors_env = _os.environ.get("CORS_ORIGINS", _default_origins)
_cors_origins = [origin.strip() for origin in _cors_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

# Dependency
get_db = database.get_db

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/me/", response_model=schemas.User)
async def read_users_me(current_user: schemas.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/users/me/", response_model=schemas.User)
def update_user_me(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.update_user(db=db, user_id=current_user.id, user_update=user_update)

@app.get("/users/performance", response_model=schemas.TaskStats)
def get_performance(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.get_task_stats(db, user_id=current_user.id)

from fastapi import BackgroundTasks

@app.post("/tasks/", response_model=schemas.Task)
async def create_task(task: schemas.TaskCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    new_task = crud.create_task(db=db, task=task, user_id=current_user.id)
    
    # WebSocket Broadcast
    await notify_clients(json.dumps({"type": "TASK_CREATED", "task": jsonable_encoder(new_task)}))
    
    # Email Notification
    background_tasks.add_task(
        send_email_notification, 
        email=current_user.email, 
        subject="New Task Created", 
        message=f"You successfully created the task: '{new_task.title}'."
    )
    
    return new_task

@app.get("/tasks/", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, status: str = None, search: str = None, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    tasks = crud.get_tasks(db, user_id=current_user.id, skip=skip, limit=limit, status=status, search=search)
    return tasks

@app.get("/tasks/export")
def export_tasks(db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    tasks = crud.get_tasks(db, user_id=current_user.id, limit=1000) # Get all tasks for simplicity
    user_tasks = tasks # Tasks are already filtered by user_id
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Title', 'Status', 'Priority', 'Time Spent (hrs)', 'Due Date', 'Created At'])
    
    for task in user_tasks:
        writer.writerow([task.id, task.title, task.status, task.priority, task.time_spent or 0, task.due_date or '', task.created_at])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tasks_export.csv"}
    )

@app.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(task_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.delete("/tasks/{task_id}", response_model=schemas.Task)
async def delete_task(task_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    # Check ownership
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if db_task.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    crud.delete_task(db=db, task_id=task_id)
    await notify_clients(json.dumps({"type": "TASK_DELETED", "task_id": task_id}))
    return db_task

@app.put("/tasks/{task_id}", response_model=schemas.Task)
async def update_task(task_id: int, task: schemas.TaskUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if db_task.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to update this task")
    updated_task = crud.update_task(db=db, task_id=task_id, task=task)
    
    # WebSocket Broadcast
    await notify_clients(json.dumps({"type": "TASK_UPDATED", "task": jsonable_encoder(updated_task)}))
    
    # Email Notification (e.g. on status change)
    if task.status:
         background_tasks.add_task(
            send_email_notification, 
            email=current_user.email, 
            subject="Task Updated", 
            message=f"The task '{updated_task.title}' status is now '{updated_task.status}'."
        )

    return updated_task

@app.post("/tasks/{task_id}/comments/", response_model=schemas.Comment)
def create_comment(task_id: int, comment: schemas.CommentCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
     return crud.create_comment(db=db, comment=comment, task_id=task_id, user_id=current_user.id)

@app.put("/comments/{comment_id}", response_model=schemas.Comment)
def update_comment(comment_id: int, comment_update: schemas.CommentCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if db_comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")
    db_comment.content = comment_update.content
    db.commit()
    db.refresh(db_comment)
    return db_comment

@app.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    db_comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not db_comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if db_comment.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    db.delete(db_comment)
    db.commit()
    return {"detail": "Comment deleted"}

from fastapi import File, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import uuid

UPLOAD_DIR = "uploads"
AVATAR_DIR = os.path.join(UPLOAD_DIR, "avatars")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
if not os.path.exists(AVATAR_DIR):
    os.makedirs(AVATAR_DIR)

# Serve uploaded files as static
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Profile image upload
@app.post("/users/me/avatar", response_model=schemas.User)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(auth.get_current_user)
):
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, GIF, WEBP) are allowed")
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"avatar_{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(AVATAR_DIR, filename)
    
    # Delete old avatar if exists
    db_user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if db_user.profile_image:
        old_path = db_user.profile_image.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)
    
    # Save new file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user record
    image_url = f"/uploads/avatars/{filename}"
    db_user.profile_image = image_url
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/tasks/{task_id}/attachments/", response_model=schemas.Attachment)
async def upload_file(task_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    attachment_data = {"filename": file.filename, "file_path": file_path}
    return crud.create_attachment(db=db, attachment=attachment_data, task_id=task_id)

@app.get("/attachments/{attachment_id}")
def download_attachment(attachment_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    attachment = db.query(models.Attachment).filter(models.Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    task = crud.get_task(db, task_id=attachment.task_id)
    if task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this file")

    return FileResponse(attachment.file_path, filename=attachment.filename)

@app.delete("/attachments/{attachment_id}")
def delete_attachment(attachment_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    attachment = db.query(models.Attachment).filter(models.Attachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    task = crud.get_task(db, task_id=attachment.task_id)
    if task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")
    
    # Delete file from disk
    if os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)
    
    db.delete(attachment)
    db.commit()
    return {"detail": "Attachment deleted"}

@app.get("/tasks/analytics/", response_model=schemas.TaskStats)
def get_analytics(period: str = "week", db: Session = Depends(get_db), current_user: schemas.User = Depends(auth.get_current_user)):
    return crud.get_task_stats(db, user_id=current_user.id, period=period)



@app.post("/auth/forgot-password")
async def forgot_password(email_data: schemas.EmailSchema, db: Session = Depends(get_db)):
    # Check if user exists
    user = crud.get_user_by_email(db, email=email_data.email)
    if not user:
        # We return 404 here for simplicity
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate OTP (Fixed for demo or random)
    otp = "123456"
    crud.set_reset_token(db, email=email_data.email, token=otp)
    
    print(f"\n{'='*50}")
    print(f"EMAIL OTP FOR {email_data.email}: {otp}")
    print(f"{'='*50}\n")
    
    return {"message": "OTP sent to email", "dev_otp": otp}

@app.post("/auth/reset-password")
async def reset_password(reset_data: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=reset_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.reset_token != reset_data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    crud.complete_password_reset(db, user=user, new_password=reset_data.new_password)
    return {"message": "Password reset successfully"}


# OTP Schemas
class OTPRequest(BaseModel):
    mobile_number: str

class OTPVerify(BaseModel):
    mobile_number: str
    otp: str

@app.post("/auth/send-otp")
async def send_otp(otp_request: OTPRequest):
    # Simulate sending OTP
    import secrets
    # In a real app, generate a random 6-digit code: secrets.randbelow(900000) + 100000
    # For demo, we'll use a fixed '123456' or verify against the console output
    otp_code = "123456" 
    
    print(f"\n{'='*50}")
    print(f"OTP FOR {otp_request.mobile_number}: {otp_code}")
    print(f"{'='*50}\n")
    
    return {"message": "OTP sent successfully", "dev_otp": otp_code}

@app.post("/auth/verify-otp")
async def verify_otp(otp_data: OTPVerify):
    # In a real app, check against Redis/Database with expiration
    if otp_data.otp == "123456":
         return {"message": "OTP verified successfully"}
    
    raise HTTPException(status_code=400, detail="Invalid OTP")




from fastapi import WebSocket, WebSocketDisconnect

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # process client messages if needed
            # await manager.broadcast(f"Client #{client_id} says: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        # await manager.broadcast(f"Client #{client_id} left the chat")

# Trigger broadcast on task events (Helper)
async def notify_clients(message: str):
    await manager.broadcast(message)


# Email Simulation (Background Task)
def send_email_notification(email: str, subject: str, message: str):
    import time
    time.sleep(1) # Simulate network delay
    print(f"\n{'='*20} EMAIL NOTIFICATION {'='*20}")
    print(f"To: {email}")
    print(f"Subject: {subject}")
    print(f"Message: {message}")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
