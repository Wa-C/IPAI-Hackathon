"""
patch_models.py — Run this ONCE, then restart uvicorn.

It does two things:
1. Adds the columns to the SQLite database (if not already there)
2. Patches the SQLAlchemy model classes at import time so they recognise the columns

Usage:
    cd ai-tutor-3/backend
    python patch_models.py
"""

import os
import sys
import sqlite3

# ── Step 1: Find and patch the database ──────────────────────────────────────

def find_db():
    candidates = ["data/tutor.db", "tutor.db", "data/copa.db", "copa.db"]
    for p in candidates:
        if os.path.exists(p):
            return p
    return None

def patch_db():
    path = find_db()
    if not path:
        print("ERROR: Could not find database file. Run from backend/ directory.")
        sys.exit(1)

    print(f"Database: {path}")
    conn = sqlite3.connect(path)
    cur = conn.cursor()

    def col_exists(table, col):
        cur.execute(f"PRAGMA table_info({table})")
        return any(r[1] == col for r in cur.fetchall())

    changes = [
        ("courses",           "exercise_prompt", "TEXT"),
        ("tutoring_sessions", "tasks_state",     "TEXT"),
    ]
    for table, col, typ in changes:
        if col_exists(table, col):
            print(f"  ✓  {table}.{col} — already exists")
        else:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {typ}")
            print(f"  +  {table}.{col} ({typ}) — added")

    conn.commit()
    conn.close()

# ── Step 2: Patch the SQLAlchemy model file ───────────────────────────────────

def patch_model_file():
    """
    Find database.py and inject the missing Column definitions
    into the Course and TutoringSession classes if they're absent.
    """
    candidates = [
        "app/models/database.py",
        "models/database.py",
        "app/database.py",
    ]
    db_file = None
    for p in candidates:
        if os.path.exists(p):
            db_file = p
            break

    if not db_file:
        print("\nERROR: Could not find database.py")
        print("Please manually add these lines to your Course and TutoringSession models:")
        print("  Course:           exercise_prompt = Column(Text, nullable=True)")
        print("  TutoringSession:  tasks_state = Column(Text, nullable=True)")
        return

    with open(db_file, "r") as f:
        content = f.read()

    original = content
    changed = False

    # Check and patch Course model
    if "exercise_prompt" not in content:
        # Find a good insertion point inside the Course class
        # Insert after the last Column in Course — look for is_current or vocabulary
        for anchor in ["is_current", "vocabulary", "concepts", "chunk_count"]:
            pattern = f"{anchor} = Column"
            if pattern in content:
                # Find the end of that line
                idx = content.index(pattern)
                end_of_line = content.index("\n", idx)
                indent = "    "  # standard 4-space indent
                injection = f"\n{indent}exercise_prompt = Column(Text, nullable=True)"
                content = content[:end_of_line] + injection + content[end_of_line:]
                print(f"  +  Added exercise_prompt to Course model (after {anchor})")
                changed = True
                break
        else:
            print("  !  Could not auto-patch Course model — add manually:")
            print("     exercise_prompt = Column(Text, nullable=True)")

    else:
        print("  ✓  Course.exercise_prompt already in model")

    # Check and patch TutoringSession model
    if "tasks_state" not in content:
        for anchor in ["red_flags", "summary", "exercises_correct", "exercises_given", "duration_minutes"]:
            pattern = f"{anchor} = Column"
            if pattern in content:
                idx = content.index(pattern)
                end_of_line = content.index("\n", idx)
                indent = "    "
                injection = f"\n{indent}tasks_state = Column(Text, nullable=True)"
                content = content[:end_of_line] + injection + content[end_of_line:]
                print(f"  +  Added tasks_state to TutoringSession model (after {anchor})")
                changed = True
                break
        else:
            print("  !  Could not auto-patch TutoringSession model — add manually:")
            print("     tasks_state = Column(Text, nullable=True)")
    else:
        print("  ✓  TutoringSession.tasks_state already in model")

    # Ensure Text is imported
    if "Text" not in content and changed:
        if "from sqlalchemy import" in content:
            content = content.replace(
                "from sqlalchemy import",
                "from sqlalchemy import Text,\n    "
            )
            # Clean up double import if needed
        print("  +  Added Text to sqlalchemy imports")

    if changed:
        # Backup original
        with open(db_file + ".bak", "w") as f:
            f.write(original)
        with open(db_file, "w") as f:
            f.write(content)
        print(f"\n  Saved patched {db_file}  (backup: {db_file}.bak)")
    else:
        print(f"  No changes needed to {db_file}")

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=== Step 1: Database columns ===")
    patch_db()
    print("\n=== Step 2: SQLAlchemy model ===")
    patch_model_file()
    print("\n✅ Done — restart uvicorn now.")