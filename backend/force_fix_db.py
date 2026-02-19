
import sqlite3
import os

DB_FILE = 'task_management.db'

def fix_db():
    print(f"Connecting to {DB_FILE}...")
    
    if not os.path.exists(DB_FILE):
        print(f"ERROR: {DB_FILE} not found!")
        return

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Check existing columns
        cursor.execute("PRAGMA table_info(users)")
        columns_info = cursor.fetchall()
        columns = [col[1] for col in columns_info]
        print(f"Current columns in 'users' table: {columns}")
        
        # Add reset_token if missing
        if 'reset_token' not in columns:
            print("Column 'reset_token' is MISSING. Adding it now...")
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR")
                print("SUCCESS: Added 'reset_token' column.")
            except Exception as e:
                print(f"FAILED to add column: {e}")
        else:
            print("Column 'reset_token' ALREADY EXISTS.")

        conn.commit()
        
        # Verify again
        cursor.execute("PRAGMA table_info(users)")
        columns_info = cursor.fetchall()
        final_columns = [col[1] for col in columns_info]
        print(f"Final columns in 'users' table: {final_columns}")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_db()
