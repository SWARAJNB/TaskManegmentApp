"""
Migration script to add the time_spent column to the tasks table.
Run this once before restarting the backend if you have existing data.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "taskmanager.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print("Database not found. It will be created on first run with the new schema.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if column already exists
    cursor.execute("PRAGMA table_info(tasks)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "time_spent" not in columns:
        print("Adding 'time_spent' column to tasks table...")
        cursor.execute("ALTER TABLE tasks ADD COLUMN time_spent REAL DEFAULT 0.0")
        conn.commit()
        print("Migration complete! 'time_spent' column added successfully.")
    else:
        print("Column 'time_spent' already exists. No migration needed.")
    
    conn.close()

if __name__ == "__main__":
    migrate()
