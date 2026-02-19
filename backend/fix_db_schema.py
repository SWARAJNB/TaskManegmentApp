
import sqlite3

def fix_db():
    conn = sqlite3.connect('task_management.db')
    cursor = conn.cursor()
    
    try:
        # Check existing columns
        cursor.execute("PRAGMA table_info(users)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Existing columns: {columns}")
        
        # Add full_name if missing
        if 'full_name' not in columns:
            print("Adding 'full_name' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN full_name VARCHAR")
            print("Added 'full_name' column.")
        else:
            print("'full_name' column already exists.")

        # Add reset_token if missing
        if 'reset_token' not in columns:
            print("Adding 'reset_token' column...")
            cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR")
            print("Added 'reset_token' column.")
        else:
            print("'reset_token' column already exists.")
            
        conn.commit()
        print("Database schema update complete.")
        
    except Exception as e:
        print(f"Error updating schema: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_db()
