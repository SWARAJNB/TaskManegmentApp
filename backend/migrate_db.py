
import sqlite3

def migrate():
    conn = sqlite3.connect('sql_app.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR")
        conn.commit()
        print("Successfully added reset_token column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("Column reset_token already exists")
        else:
            print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
