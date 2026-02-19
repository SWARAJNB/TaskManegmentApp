from sqlalchemy.orm import Session
import models, schemas
from auth import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email, 
        hashed_password=hashed_password, 
        full_name=user.full_name,
        mobile_number=user.mobile_number
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user_update.dict(exclude_unset=True)
        if 'password' in update_data:
            update_data['hashed_password'] = get_password_hash(update_data.pop('password'))
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    return db_user

def set_reset_token(db: Session, email: str, token: str):
    user = get_user_by_email(db, email)
    if user:
        user.reset_token = token
        db.commit()
        db.refresh(user)
    return user

def get_user_by_reset_token(db: Session, token: str):
    return db.query(models.User).filter(models.User.reset_token == token).first()

def reset_password(db: Session, token: str, new_password: str):
    # Deprecated for OTP flow but kept for compatibility if needed, 
    # though we are switching to email+otp verification in main.py routes.
    user = get_user_by_reset_token(db, token)
    if user:
        user.hashed_password = get_password_hash(new_password)
        user.reset_token = None
        db.commit()
        db.refresh(user)
    return user

def complete_password_reset(db: Session, user: models.User, new_password: str):
    user.hashed_password = get_password_hash(new_password)
    user.reset_token = None
    db.commit()
    db.refresh(user)
    return user

def get_tasks(db: Session, user_id: int, skip: int = 0, limit: int = 100, status: str = None, search: str = None):
    query = db.query(models.Task).filter(models.Task.owner_id == user_id)
    if status:
        query = query.filter(models.Task.status == status)
    if search:
        query = query.filter(models.Task.title.contains(search))
    return query.offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    db_task = models.Task(**task.dict(), owner_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def delete_task(db: Session, task_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskUpdate):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        update_data = task.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_task, key, value)
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
    return db_task

def create_comment(db: Session, comment: schemas.CommentCreate, task_id: int, user_id: int):
    db_comment = models.Comment(**comment.dict(), task_id=task_id, author_id=user_id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

def create_attachment(db: Session, attachment: dict, task_id: int):
    db_attachment = models.Attachment(**attachment, task_id=task_id)
    db.add(db_attachment)
    db.commit()
    db.refresh(db_attachment)
    return db_attachment

def get_task_stats(db: Session, user_id: int, period: str = "week"):
    total = db.query(models.Task).filter(models.Task.owner_id == user_id).count()
    completed = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.status == models.TaskStatus.DONE).count()
    pending = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.status != models.TaskStatus.DONE).count()
    high_priority = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.priority == models.TaskPriority.HIGH).count()
    
    from datetime import datetime, timedelta
    from sqlalchemy import func
    
    today = datetime.utcnow().date()

    # --- Priority breakdown ---
    low_count = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.priority == models.TaskPriority.LOW).count()
    medium_count = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.priority == models.TaskPriority.MEDIUM).count()
    priority_breakdown = [
        {"label": "Low", "value": low_count},
        {"label": "Medium", "value": medium_count},
        {"label": "High", "value": high_priority},
    ]

    # --- Status breakdown ---
    todo_count = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.status == models.TaskStatus.TODO).count()
    in_progress_count = db.query(models.Task).filter(models.Task.owner_id == user_id, models.Task.status == models.TaskStatus.IN_PROGRESS).count()
    status_breakdown = [
        {"label": "To Do", "value": todo_count},
        {"label": "In Progress", "value": in_progress_count},
        {"label": "Done", "value": completed},
    ]

    # --- Avg completion time ---
    avg_time_row = db.query(func.avg(models.Task.time_spent)).filter(
        models.Task.owner_id == user_id,
        models.Task.status == models.TaskStatus.DONE,
        models.Task.time_spent is not None,
        models.Task.time_spent > 0
    ).scalar()
    avg_completion_time = round(float(avg_time_row), 1) if avg_time_row else 0.0

    # --- Current streak (consecutive days with task activity) ---
    current_streak = 0
    check_date = today
    while True:
        day_count = db.query(models.Task).filter(
            models.Task.owner_id == user_id,
            func.date(models.Task.created_at) == str(check_date)
        ).count()
        if day_count > 0:
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break

    if period == "day":
        start_time = datetime.utcnow() - timedelta(hours=23)
        
        daily_counts = db.query(
            func.strftime('%H', models.Task.created_at).label('hour'),
            func.count(models.Task.id).label('count'),
            func.coalesce(func.sum(models.Task.time_spent), 0).label('hours')
        ).filter(
            models.Task.owner_id == user_id,
            models.Task.created_at >= start_time
        ).group_by(
            func.strftime('%H', models.Task.created_at)
        ).all()
        
        activity_map = {row.hour: {"count": row.count, "hours": round(float(row.hours), 1)} for row in daily_counts}
        daily_activity = []
        now = datetime.utcnow()
        for i in range(24):
            hour = (now - timedelta(hours=23-i))
            hour_str = hour.strftime("%H")
            entry = activity_map.get(hour_str, {"count": 0, "hours": 0.0})
            daily_activity.append({
                "date": f"{hour.strftime('%I%p').lstrip('0')}",
                "count": entry["count"],
                "hours": entry["hours"]
            })
    
    elif period == "month":
        num_days = 30
        start_date = today - timedelta(days=num_days-1)
        
        daily_counts = db.query(
            func.date(models.Task.created_at).label('date'),
            func.count(models.Task.id).label('count'),
            func.coalesce(func.sum(models.Task.time_spent), 0).label('hours')
        ).filter(
            models.Task.owner_id == user_id,
            models.Task.created_at >= start_date
        ).group_by(
            func.date(models.Task.created_at)
        ).all()
        
        activity_map = {str(day.date): {"count": day.count, "hours": round(float(day.hours), 1)} for day in daily_counts}
        daily_activity = []
        for i in range(num_days):
            date = start_date + timedelta(days=i)
            entry = activity_map.get(str(date), {"count": 0, "hours": 0.0})
            daily_activity.append({
                "date": date.strftime("%b %d"),
                "count": entry["count"],
                "hours": entry["hours"]
            })
    
    else:  # week (default)
        num_days = 7
        start_date = today - timedelta(days=num_days-1)
        
        daily_counts = db.query(
            func.date(models.Task.created_at).label('date'),
            func.count(models.Task.id).label('count'),
            func.coalesce(func.sum(models.Task.time_spent), 0).label('hours')
        ).filter(
            models.Task.owner_id == user_id,
            models.Task.created_at >= start_date
        ).group_by(
            func.date(models.Task.created_at)
        ).all()
        
        activity_map = {str(day.date): {"count": day.count, "hours": round(float(day.hours), 1)} for day in daily_counts}
        daily_activity = []
        for i in range(num_days):
            date = start_date + timedelta(days=i)
            entry = activity_map.get(str(date), {"count": 0, "hours": 0.0})
            daily_activity.append({
                "date": date.strftime("%a"),
                "count": entry["count"],
                "hours": entry["hours"]
            })

    return {
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": pending,
        "high_priority_tasks": high_priority,
        "completion_rate": (completed / total * 100) if total > 0 else 0,
        "daily_activity": daily_activity,
        "priority_breakdown": priority_breakdown,
        "status_breakdown": status_breakdown,
        "avg_completion_time": avg_completion_time,
        "current_streak": current_streak,
    }

