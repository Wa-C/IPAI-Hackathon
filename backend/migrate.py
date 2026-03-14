"""
Run this once to add the two new columns to your existing database.
Usage: python migrate.py  (run from the backend/ directory)
"""

import sqlite3
import os

# Auto-find the database — checks common locations
def find_db():
    candidates = [
        "data/tutor.db",
        "tutor.db",
        "data/copa.db",
        "copa.db",
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return None

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def run():
    db_path = find_db()
    if not db_path:
        print("Could not find database. Looked for: data/tutor.db, tutor.db, data/copa.db, copa.db")
        print("Run this script from the backend/ directory.")
        return

    print(f"Found database: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    migrations = [
        ("courses",           "exercise_prompt", "TEXT"),
        ("tutoring_sessions", "tasks_state",     "TEXT"),
    ]

    for table, column, col_type in migrations:
        if column_exists(cur, table, column):
            print(f"  ✓  {table}.{column} already exists — skipped")
        else:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
            print(f"  +  {table}.{column} ({col_type}) — added")

    conn.commit()
    conn.close()
    print("\nDone. No data was changed, only columns added.")

if __name__ == "__main__":
    run()