
import sqlite3
import os
import sys

DB_FILE = 'task_management.db'
LOG_FILE = 'db_fix_log.txt'

def log(msg):
    with open(LOG_FILE, 'a') as f:
        f.write(msg + '\n')
    print(msg)

def fix_db():
    # Clear log file
    with open(LOG_FILE, 'w') as f:
        f.write("Starting DB Fix...\n")

    log(f"Current Working Directory: {os.getcwd()}")
    
    if not os.path.exists(DB_FILE):
        log(f"ERROR: {DB_FILE} not found in current directory!")
        log(f"Files in current dir: {os.listdir('.')}")
        return

    log(f"Found {DB_FILE}. Connecting...")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        # Check existing columns
        cursor.execute("PRAGMA table_info(users)")
        columns_info = cursor.fetchall()
        columns = [col[1] for col in columns_info]
        log(f"Current columns in 'users' table: {columns}")
        
        # Add reset_token if missing
        if 'reset_token' not in columns:
            log("Column 'reset_token' is MISSING. Adding it now...")
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR")
                conn.commit()
                log("SUCCESS: Added 'reset_token' column.")
            except Exception as e:
                log(f"FAILED to add column: {e}")
        else:
            log("Column 'reset_token' ALREADY EXISTS.")

        # Verify again
        cursor.execute("PRAGMA table_info(users)")
        columns_info = cursor.fetchall()
        final_columns = [col[1] for col in columns_info]
        log(f"Final columns in 'users' table: {final_columns}")
        
        if 'reset_token' in final_columns:
            log("\nVERIFICATION PASSED: Database is ready.")
        else:
            log("\nVERIFICATION FAILED: Column still missing.")
            
    except Exception as e:
        log(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    fix_db()
