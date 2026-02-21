"""
migrate_to_postgres.py
======================
Migrates all data from the local SQLite database (task_management.db)
to a PostgreSQL database specified by POSTGRES_URL env variable.

Usage:
  1. Make sure PostgreSQL is running (e.g. via docker-compose up db)
  2. Run:
     set POSTGRES_URL=postgresql://taskflow:taskflow_pass@localhost:5432/taskflow_db
     python migrate_to_postgres.py

  This will:
  - Create all tables in PostgreSQL
  - Copy all users, tasks, comments, and attachments
  - Preserve original IDs so foreign keys stay correct
"""

import os
import sys
import sqlite3
from datetime import datetime

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# ── Setup ──────────────────────────────────────────────────────────
SQLITE_PATH = os.path.join(os.path.dirname(__file__), "task_management.db")
POSTGRES_URL = os.environ.get("POSTGRES_URL", "")

if not POSTGRES_URL:
    print("ERROR: Set the POSTGRES_URL environment variable first.")
    print("Example: set POSTGRES_URL=postgresql://taskflow:taskflow_pass@localhost:5432/taskflow_db")
    sys.exit(1)

# Fix Render-style postgres:// prefix
if POSTGRES_URL.startswith("postgres://"):
    POSTGRES_URL = POSTGRES_URL.replace("postgres://", "postgresql://", 1)

print(f"[MIGRATE] SQLite source : {SQLITE_PATH}")
print(f"[MIGRATE] PostgreSQL target: {POSTGRES_URL.split('@')[-1]}")  # hide password

# ── Connect to both databases ─────────────────────────────────────
sqlite_conn = sqlite3.connect(SQLITE_PATH)
sqlite_conn.row_factory = sqlite3.Row
sqlite_cur = sqlite_conn.cursor()

pg_engine = create_engine(POSTGRES_URL)

# Import models so Base.metadata knows about all tables
import models  # noqa: E402
from database import Base

# Create all tables in PostgreSQL
Base.metadata.create_all(bind=pg_engine)
PgSession = sessionmaker(bind=pg_engine)
pg = PgSession()

print("[MIGRATE] PostgreSQL tables created.")

# ── Helper to parse dates ─────────────────────────────────────────
def parse_dt(val):
    """Parse a datetime string from SQLite into a Python datetime."""
    if val is None:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(val, fmt)
        except (ValueError, TypeError):
            continue
    return None


# ── Migrate Users ─────────────────────────────────────────────────
print("\n[MIGRATE] Migrating users ...")
sqlite_cur.execute("SELECT * FROM users")
users = sqlite_cur.fetchall()
for u in users:
    pg.execute(
        text("""
            INSERT INTO users (id, email, hashed_password, full_name, is_active, reset_token, mobile_number, profile_image)
            VALUES (:id, :email, :hashed_password, :full_name, :is_active, :reset_token, :mobile_number, :profile_image)
            ON CONFLICT (id) DO NOTHING
        """),
        {
            "id": u["id"],
            "email": u["email"],
            "hashed_password": u["hashed_password"],
            "full_name": u["full_name"],
            "is_active": bool(u["is_active"]) if u["is_active"] is not None else True,
            "reset_token": u["reset_token"],
            "mobile_number": u["mobile_number"] if "mobile_number" in u.keys() else None,
            "profile_image": u["profile_image"] if "profile_image" in u.keys() else None,
        }
    )
pg.commit()
print(f"  [OK] {len(users)} users migrated")


# ── Migrate Tasks ─────────────────────────────────────────────────
print("[MIGRATE] Migrating tasks ...")
sqlite_cur.execute("SELECT * FROM tasks")
tasks = sqlite_cur.fetchall()
for t in tasks:
    pg.execute(
        text("""
            INSERT INTO tasks (id, title, description, status, priority, due_date, time_spent, created_at, owner_id)
            VALUES (:id, :title, :description, :status, :priority, :due_date, :time_spent, :created_at, :owner_id)
            ON CONFLICT (id) DO NOTHING
        """),
        {
            "id": t["id"],
            "title": t["title"],
            "description": t["description"],
            "status": t["status"],
            "priority": t["priority"],
            "due_date": parse_dt(t["due_date"]),
            "time_spent": float(t["time_spent"]) if t["time_spent"] else 0.0,
            "created_at": parse_dt(t["created_at"]),
            "owner_id": t["owner_id"],
        }
    )
pg.commit()
print(f"  [OK] {len(tasks)} tasks migrated")


# ── Migrate Comments ──────────────────────────────────────────────
print("[MIGRATE] Migrating comments ...")
sqlite_cur.execute("SELECT * FROM comments")
comments = sqlite_cur.fetchall()
for c in comments:
    pg.execute(
        text("""
            INSERT INTO comments (id, content, created_at, task_id, author_id)
            VALUES (:id, :content, :created_at, :task_id, :author_id)
            ON CONFLICT (id) DO NOTHING
        """),
        {
            "id": c["id"],
            "content": c["content"],
            "created_at": parse_dt(c["created_at"]),
            "task_id": c["task_id"],
            "author_id": c["author_id"],
        }
    )
pg.commit()
print(f"  [OK] {len(comments)} comments migrated")


# ── Migrate Attachments ───────────────────────────────────────────
print("[MIGRATE] Migrating attachments ...")
sqlite_cur.execute("SELECT * FROM attachments")
attachments = sqlite_cur.fetchall()
for a in attachments:
    pg.execute(
        text("""
            INSERT INTO attachments (id, filename, file_path, uploaded_at, task_id)
            VALUES (:id, :filename, :file_path, :uploaded_at, :task_id)
            ON CONFLICT (id) DO NOTHING
        """),
        {
            "id": a["id"],
            "filename": a["filename"],
            "file_path": a["file_path"],
            "uploaded_at": parse_dt(a["uploaded_at"]),
            "task_id": a["task_id"],
        }
    )
pg.commit()
print(f"  [OK] {len(attachments)} attachments migrated")


# ── Fix PostgreSQL sequences ─────────────────────────────────────
# After inserting with explicit IDs, PostgreSQL auto-increment sequences
# are out of sync. Fix them so new inserts get correct IDs.
print("\n[MIGRATE] Fixing PostgreSQL sequences ...")
for table in ["users", "tasks", "comments", "attachments"]:
    pg.execute(text(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), COALESCE(MAX(id), 0) + 1, false) FROM {table}"))
pg.commit()
print("  [OK] Sequences synced")


# ── Done ──────────────────────────────────────────────────────────
sqlite_conn.close()
pg.close()

print(f"""
{'='*50}
  MIGRATION COMPLETE!
  
  Users:       {len(users)}
  Tasks:       {len(tasks)}
  Comments:    {len(comments)}
  Attachments: {len(attachments)}
{'='*50}

All your existing login credentials, tasks, comments,
and attachments have been copied to PostgreSQL.

You can now set DATABASE_URL to your PostgreSQL URL
and start the app -- all data will be there!
""")
