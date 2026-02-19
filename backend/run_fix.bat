@echo off
python debug_and_fix_db.py > db_fix_output.txt 2>&1
echo Done >> db_fix_output.txt
