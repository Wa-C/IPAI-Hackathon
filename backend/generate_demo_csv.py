"""
Generate demo data as CSV files for the data team.
No Supabase connection needed - produces the same data as seed_demo_data.py
but writes to local CSV files that can be reviewed, edited, and re-imported.

Usage:
    cd backend
    python generate_demo_csv.py                # Output to demo_data/ folder
    python generate_demo_csv.py -o my_folder   # Custom output folder

Output:
    demo_data/
    ├── 01_organizations.csv
    ├── 02_users.csv
    ├── 03_profiles.csv
    ├── 04_org_members.csv
    ├── 05_classes.csv
    ├── 06_class_enrolments.csv
    ├── 07_student_profiles.csv
    ├── 08_learning_preferences.csv
    ├── 09_lessons.csv
    ├── 10_differentiation_levels.csv
    ├── 11_tasks.csv
    ├── 12_materials.csv
    ├── 13_bias_scans.csv
    ├── 14_bias_issues.csv
    ├── 15_assessments.csv
    ├── 16_integrations.csv
    └── README.txt
"""

import csv
import json
import os
import random
import uuid
import argparse
from datetime import datetime, timedelta, timezone


# --------------- constants (same as seed_demo_data.py) ---------------

TEACHER_NAMES = [
    "Maria Schmidt", "Thomas Weber", "Anna Hofmann",
    "Klaus Becker", "Petra Richter",
]

STUDENT_NAMES = [
    "Max Muller", "Sophie Weber", "Liam Fischer", "Emma Becker", "Noah Schneider",
    "Mia Braun", "Leon Zimmermann", "Hannah Hartmann", "Paul Krause", "Lena Wolf",
    "Finn Schwarz", "Emilia Neumann", "Jonas Schroeder", "Clara Wagner", "Lukas Meyer",
    "Marie Koenig", "Ben Lang", "Sophia Friedrich", "Elias Schulz", "Amelie Peters",
    "Moritz Hoffmann", "Lea Baumann", "Felix Koch", "Johanna Richter", "Anton Werner",
    "Lara Schmitt", "Julian Klein", "Sarah Vogt", "Niklas Lehmann", "Nora Kraus",
    "David Roth", "Alina Seidel", "Tim Frank", "Ida Brandt", "Simon Berger",
    "Lina Pfeiffer", "Maximilian Lorenz", "Maja Engel", "Alexander Horn", "Eva Dietrich",
    "Oscar Ludwig", "Zoe Haas", "Philipp Kuhn", "Theresa Beck", "Robin Sommer",
    "Victoria Huber", "Theo Fuchs", "Greta Keller", "Jan Vogel", "Nele Scholz",
]

MODES = ["read", "play", "watch", "mixed"]
PERFORMANCE = ["on-track", "needs-support", "advanced"]

LESSON_TOPICS = [
    ("Introduction to Shakespeare", "English", "Romeo and Juliet - Act 1"),
    ("Photosynthesis Explained", "Science", "Plant Biology"),
    ("World War II: Key Events", "History", "Modern History"),
    ("Algebra Fundamentals", "Mathematics", "Solving Equations"),
    ("Creative Writing Workshop", "English", "Short Stories"),
    ("The Water Cycle", "Science", "Earth Systems"),
    ("Ancient Egypt", "History", "Early Civilizations"),
    ("Fractions Made Easy", "Mathematics", "Number Systems"),
    ("Poetry Analysis", "English", "Literary Techniques"),
    ("Chemical Reactions", "Science", "Chemistry Basics"),
    ("The Industrial Revolution", "History", "Economic History"),
    ("Geometry Shapes", "Mathematics", "Spatial Reasoning"),
    ("Persuasive Writing", "English", "Argumentation"),
    ("Ecosystems and Habitats", "Science", "Ecology"),
    ("German Reunification", "History", "Contemporary History"),
    ("Statistics and Probability", "Mathematics", "Data Analysis"),
    ("Narrative Writing", "English", "Storytelling"),
    ("Forces and Motion", "Science", "Physics"),
    ("The Roman Empire", "History", "Classical Civilizations"),
    ("Linear Equations", "Mathematics", "Algebra"),
]

BIAS_PHRASES = [
    ("The fireman rushed to save the day", "gender", "medium", "firefighter", "The term 'fireman' reinforces gender stereotypes."),
    ("The policeman directed traffic", "gender", "medium", "police officer", "The term 'policeman' implies only men do this job."),
    ("exotic foods from foreign lands", "culture", "low", "diverse foods from around the world", "Describing foods as 'exotic' can otherize cultures."),
    ("fell on deaf ears", "ableism", "high", "was ignored", "Uses deafness negatively."),
    ("children from good families", "socioeconomic", "medium", "children from supportive backgrounds", "Implies family worth tied to socioeconomic status."),
    ("mankind has achieved", "gender", "low", "humankind has achieved", "Gendered language excludes non-male identities."),
    ("the blind leading the blind", "ableism", "high", "the uninformed leading the uninformed", "Uses blindness as a negative metaphor."),
    ("primitive cultures", "culture", "high", "indigenous cultures", "Labels cultures as primitive, implying inferiority."),
    ("suffering from a disability", "ableism", "medium", "living with a disability", "Frames disability as suffering."),
    ("third world countries", "socioeconomic", "medium", "developing nations", "Outdated and demeaning classification."),
    ("boys will be boys", "gender", "medium", "children will be children", "Excuses behavior based on gender stereotypes."),
    ("low-income neighborhoods are dangerous", "socioeconomic", "high", "some neighborhoods face safety challenges", "Stereotypes low-income areas."),
]

ORG_DATA = [
    {"name": "Heinrich-Heine-Gymnasium Berlin", "code": "HHG-BLN"},
    {"name": "Grundschule am Park Hamburg", "code": "GSP-HH"},
    {"name": "Schiller-Realschule Munchen", "code": "SRS-MUC"},
]

CLASS_NAMES = [
    ("10a English", "10", "English"),
    ("9b Mathematics", "9", "Mathematics"),
    ("11c Science", "11", "Science"),
    ("10b History", "10", "History"),
    ("8a English", "8", "English"),
    ("9a Science", "9", "Science"),
    ("12a Mathematics", "12", "Mathematics"),
    ("7b Geography", "7", "Geography"),
    ("10c Art", "10", "Art"),
    ("11a Music", "11", "Music"),
]

MATERIAL_TITLES = [
    "Romeo and Juliet - Study Guide",
    "Photosynthesis Worksheet",
    "WWII Timeline Handout",
    "Algebra Practice Problems",
    "Creative Writing Prompts",
    "The Water Cycle Diagram",
    "Egyptian Hieroglyphics Activity",
    "Fraction Manipulatives Guide",
    "Poetry Anthology Excerpts",
    "Chemical Reactions Lab Sheet",
    "Industrial Revolution Source Pack",
    "Geometry Shapes Poster",
    "Persuasive Essay Template",
    "Ecosystem Food Web Activity",
    "German History Primary Sources",
]

INTEGRATION_DATA = [
    {"name": "Moodle LMS", "type": "lms", "status": "connected"},
    {"name": "Google Classroom", "type": "lms", "status": "pending"},
    {"name": "Khan Academy", "type": "content", "status": "connected"},
    {"name": "Matific", "type": "content", "status": "disconnected"},
    {"name": "PowerBI Analytics", "type": "analytics", "status": "connected"},
]


# --------------- helpers ---------------

def new_id():
    return str(uuid.uuid4())


def now_utc():
    return datetime.now(timezone.utc)


def random_past(days_back=90):
    return now_utc() - timedelta(days=random.randint(1, days_back), hours=random.randint(0, 23))


def random_future(days_ahead=14):
    return now_utc() + timedelta(days=random.randint(1, days_ahead), hours=random.randint(8, 16))


def iso(dt):
    return dt.isoformat()


def write_csv(filepath, rows, fieldnames):
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"  {os.path.basename(filepath):40s} {len(rows):>5} rows")


# --------------- generators ---------------

def generate_all(output_dir):
    random.seed(42)  # reproducible output so data team gets consistent results
    os.makedirs(output_dir, exist_ok=True)

    # ---- 1. Organizations ----
    orgs = []
    for org_info in ORG_DATA:
        orgs.append({
            "id": new_id(),
            "name": org_info["name"],
            "code": org_info["code"],
            "webhook_url": "",
            "allow_lms_integration": True,
            "allow_third_party_content": True,
            "enable_federated_learning": True,
            "send_anonymised_signals": True,
            "participate_in_model_improvement": True,
            "model_version": "v1.0.0",
            "created_at": iso(random_past(180)),
        })
    write_csv(
        os.path.join(output_dir, "01_organizations.csv"), orgs,
        ["id", "name", "code", "webhook_url", "allow_lms_integration",
         "allow_third_party_content", "enable_federated_learning",
         "send_anonymised_signals", "participate_in_model_improvement",
         "model_version", "created_at"],
    )

    # ---- 2. Users (auth.users equivalent) ----
    teachers = []
    for name in TEACHER_NAMES:
        email = f"{name.lower().replace(' ', '.')}@demo.edcopilot.local"
        teachers.append({"id": new_id(), "name": name, "email": email, "role": "teacher", "password": "demo123456"})

    students = []
    for name in STUDENT_NAMES:
        email = f"{name.lower().replace(' ', '.')}@demo.edcopilot.local"
        students.append({"id": new_id(), "name": name, "email": email, "role": "student", "password": "demo123456"})

    all_users = teachers + students
    write_csv(
        os.path.join(output_dir, "02_users.csv"), all_users,
        ["id", "name", "email", "role", "password"],
    )

    # ---- 3. Profiles ----
    profiles = []
    for u in all_users:
        profiles.append({
            "id": u["id"],
            "email": u["email"],
            "name": u["name"],
            "role": u["role"],
            "avatar_url": "",
            "language": "de",
            "timezone": "Europe/Berlin",
            "created_at": iso(random_past(180)),
        })
    write_csv(
        os.path.join(output_dir, "03_profiles.csv"), profiles,
        ["id", "email", "name", "role", "avatar_url", "language", "timezone", "created_at"],
    )

    # ---- 4. Org members ----
    org_members = []
    for i, t in enumerate(teachers):
        org = orgs[i % len(orgs)]
        org_members.append({
            "id": new_id(),
            "user_id": t["id"],
            "organization_id": org["id"],
            "role": "teacher",
            "created_at": iso(random_past(180)),
        })
    # First teacher also org_admin
    org_members.append({
        "id": new_id(),
        "user_id": teachers[0]["id"],
        "organization_id": orgs[0]["id"],
        "role": "org_admin",
        "created_at": iso(random_past(180)),
    })
    for i, s in enumerate(students):
        org = orgs[i % len(orgs)]
        s["_org_id"] = org["id"]
        org_members.append({
            "id": new_id(),
            "user_id": s["id"],
            "organization_id": org["id"],
            "role": "student",
            "created_at": iso(random_past(180)),
        })
    write_csv(
        os.path.join(output_dir, "04_org_members.csv"), org_members,
        ["id", "user_id", "organization_id", "role", "created_at"],
    )

    # ---- 5. Classes ----
    classes = []
    for i, (name, grade, subject) in enumerate(CLASS_NAMES):
        org = orgs[i % len(orgs)]
        teacher = teachers[i % len(teachers)]
        classes.append({
            "id": new_id(),
            "organization_id": org["id"],
            "teacher_id": teacher["id"],
            "name": name,
            "grade": grade,
            "subject": subject,
            "next_lesson_time": iso(random_future()),
            "student_count": 0,
            "archived": False,
            "created_at": iso(random_past(120)),
        })
    write_csv(
        os.path.join(output_dir, "05_classes.csv"), classes,
        ["id", "organization_id", "teacher_id", "name", "grade", "subject",
         "next_lesson_time", "student_count", "archived", "created_at"],
    )

    # ---- 6 & 7. Class enrolments + Student profiles ----
    enrolments = []
    student_profiles = []
    for i, s in enumerate(students):
        org_id = s["_org_id"]
        org_classes = [c for c in classes if c["organization_id"] == org_id]
        if not org_classes:
            org_classes = classes
        cls = random.choice(org_classes)
        s["_class_id"] = cls["id"]

        enrolments.append({
            "id": new_id(),
            "class_id": cls["id"],
            "user_id": s["id"],
            "role": "student",
            "created_at": iso(random_past(120)),
        })

        perf = random.choice(PERFORMANCE)
        student_profiles.append({
            "id": s["id"],
            "organization_id": org_id,
            "class_id": cls["id"],
            "name": s["name"],
            "email": s["email"],
            "performance_status": perf,
            "last_activity_date": iso(random_past(14)),
            "created_at": iso(random_past(120)),
        })

    # Update class student counts
    for cls in classes:
        cls["student_count"] = sum(1 for e in enrolments if e["class_id"] == cls["id"])

    write_csv(
        os.path.join(output_dir, "06_class_enrolments.csv"), enrolments,
        ["id", "class_id", "user_id", "role", "created_at"],
    )
    write_csv(
        os.path.join(output_dir, "07_student_profiles.csv"), student_profiles,
        ["id", "organization_id", "class_id", "name", "email",
         "performance_status", "last_activity_date", "created_at"],
    )

    # ---- 8. Learning preferences ----
    learning_prefs = []
    for s in students:
        scores = {
            "read": random.randint(30, 95),
            "play": random.randint(30, 95),
            "watch": random.randint(30, 95),
        }
        best = max(scores, key=scores.get)
        recommended = best if scores[best] > 60 else "mixed"
        learning_prefs.append({
            "id": new_id(),
            "student_id": s["id"],
            "recommended": recommended,
            "manual": "",
            "scores_read": scores["read"],
            "scores_play": scores["play"],
            "scores_watch": scores["watch"],
            "scores_json": json.dumps(scores),
            "updated_at": iso(random_past(30)),
        })
    write_csv(
        os.path.join(output_dir, "08_learning_preferences.csv"), learning_prefs,
        ["id", "student_id", "recommended", "manual",
         "scores_read", "scores_play", "scores_watch", "scores_json", "updated_at"],
    )

    # ---- 9, 10, 11. Lessons + Differentiation levels + Tasks ----
    lessons = []
    diff_levels = []
    tasks = []
    for i, (title, subject, topic) in enumerate(LESSON_TOPICS):
        cls = classes[i % len(classes)]
        teacher = teachers[i % len(teachers)]
        status = random.choice(["draft", "published", "published", "published"])
        grade_level = int(cls["grade"])
        lesson_id = new_id()
        created = random_past(30)

        lessons.append({
            "id": lesson_id,
            "class_id": cls["id"],
            "title": title,
            "subject": subject,
            "topic": topic,
            "learning_objective": f"Students will understand {topic.lower()} and apply key concepts.",
            "base_material": f"Base material for {title}...",
            "status": status,
            "grade_level": grade_level,
            "duration": random.choice([30, 35, 40, 45, 50]),
            "differentiated_content": True,
            "content_types": json.dumps(random.sample(["video", "text", "quiz", "game", "interactive"], k=random.randint(2, 4))),
            "bias_scan_status": random.choice(["clean", "clean", "issues-found", ""]),
            "created_by": teacher["id"],
            "created_at": iso(created),
        })

        if status == "published":
            for level_name, rationale_prefix in [
                ("struggling", "Visual and interactive approach for"),
                ("on-track", "Grade-level text-based activity for"),
                ("advanced", "Extended challenge activity for"),
            ]:
                dl_id = new_id()
                diff_levels.append({
                    "id": dl_id,
                    "lesson_id": lesson_id,
                    "level": level_name,
                    "rationale": f"{rationale_prefix} {topic}",
                    "created_at": iso(created),
                })

                num_tasks = random.randint(2, 3)
                for t_idx in range(num_tasks):
                    mode = random.choice(MODES)
                    tasks.append({
                        "id": new_id(),
                        "differentiation_level_id": dl_id,
                        "title": f"{level_name.replace('-', ' ').title()} Task {t_idx + 1}: {topic}",
                        "description": f"A {mode}-based activity for {level_name} learners on {topic}.",
                        "mode": mode,
                        "duration": random.choice([5, 10, 15, 20, 25, 30]),
                        "generated_by_ai": True,
                        "created_at": iso(created),
                    })

    write_csv(
        os.path.join(output_dir, "09_lessons.csv"), lessons,
        ["id", "class_id", "title", "subject", "topic", "learning_objective",
         "base_material", "status", "grade_level", "duration", "differentiated_content",
         "content_types", "bias_scan_status", "created_by", "created_at"],
    )
    write_csv(
        os.path.join(output_dir, "10_differentiation_levels.csv"), diff_levels,
        ["id", "lesson_id", "level", "rationale", "created_at"],
    )
    write_csv(
        os.path.join(output_dir, "11_tasks.csv"), tasks,
        ["id", "differentiation_level_id", "title", "description", "mode",
         "duration", "generated_by_ai", "created_at"],
    )

    # ---- 12. Materials ----
    materials = []
    for i, title in enumerate(MATERIAL_TITLES):
        cls = classes[i % len(classes)]
        teacher = teachers[i % len(teachers)]
        materials.append({
            "id": new_id(),
            "title": title,
            "content": f"Content for {title}. This is sample educational material used for demonstration purposes.",
            "class_id": cls["id"],
            "student_id": "",
            "created_by": teacher["id"],
            "assigned_at": iso(random_past(30)),
            "created_at": iso(random_past(30)),
        })
    write_csv(
        os.path.join(output_dir, "12_materials.csv"), materials,
        ["id", "title", "content", "class_id", "student_id", "created_by",
         "assigned_at", "created_at"],
    )

    # ---- 13 & 14. Bias scans + issues ----
    bias_scans = []
    bias_issues = []
    for mat in materials[:10]:
        phrases = random.sample(BIAS_PHRASES, k=random.randint(2, 4))
        issues_by_cat = {}
        for _, cat, _, _, _ in phrases:
            issues_by_cat[cat] = issues_by_cat.get(cat, 0) + 1

        scan_id = new_id()
        resolved_count = random.randint(0, len(phrases))
        bias_scans.append({
            "id": scan_id,
            "material_id": mat["id"],
            "scanned_at": iso(random_past(30)),
            "total_issues": len(phrases),
            "issues_by_category": json.dumps(issues_by_cat),
            "resolved_count": resolved_count,
            "created_by": "",
            "created_at": iso(random_past(30)),
        })

        pos = 0
        for idx, (phrase, cat, sev, suggestion, explanation) in enumerate(phrases):
            end = pos + len(phrase)
            bias_issues.append({
                "id": new_id(),
                "scan_id": scan_id,
                "category": cat,
                "severity": sev,
                "original_phrase": phrase,
                "explanation": explanation,
                "suggestion": suggestion,
                "position_start": pos,
                "position_end": end,
                "resolved": idx < resolved_count,
                "applied_suggestion": "",
                "created_at": iso(random_past(30)),
            })
            pos = end + 50

    write_csv(
        os.path.join(output_dir, "13_bias_scans.csv"), bias_scans,
        ["id", "material_id", "scanned_at", "total_issues", "issues_by_category",
         "resolved_count", "created_by", "created_at"],
    )
    write_csv(
        os.path.join(output_dir, "14_bias_issues.csv"), bias_issues,
        ["id", "scan_id", "category", "severity", "original_phrase", "explanation",
         "suggestion", "position_start", "position_end", "resolved",
         "applied_suggestion", "created_at"],
    )

    # ---- 15. Assessments ----
    assessments = []
    assessment_types = ["mini-test", "quiz", "homework", "project", "exam"]
    for s in students:
        num = random.randint(1, 3)
        for _ in range(num):
            max_score = random.choice([10, 20, 50, 100])
            score = round(random.uniform(max_score * 0.3, max_score), 1)
            assessments.append({
                "id": new_id(),
                "student_id": s["id"],
                "assessment_type": random.choice(assessment_types),
                "score": score,
                "max_score": max_score,
                "mode_used": random.choice(MODES),
                "metadata": "",
                "created_at": iso(random_past(60)),
            })
    write_csv(
        os.path.join(output_dir, "15_assessments.csv"), assessments,
        ["id", "student_id", "assessment_type", "score", "max_score",
         "mode_used", "metadata", "created_at"],
    )

    # ---- 16. Integrations ----
    integrations = []
    for org in orgs:
        for integ in INTEGRATION_DATA:
            integrations.append({
                "id": new_id(),
                "organization_id": org["id"],
                "name": integ["name"],
                "type": integ["type"],
                "status": integ["status"],
                "config": json.dumps({"version": "1.0", "auto_sync": True}),
                "created_at": iso(random_past(90)),
            })
    write_csv(
        os.path.join(output_dir, "16_integrations.csv"), integrations,
        ["id", "organization_id", "name", "type", "status", "config", "created_at"],
    )

    # ---- README ----
    readme = os.path.join(output_dir, "README.txt")
    with open(readme, "w", encoding="utf-8") as f:
        f.write("EdCopilot Demo Data - CSV Export\n")
        f.write("=" * 50 + "\n\n")
        f.write("These CSV files contain the same demo data that seed_demo_data.py\n")
        f.write("pushes to Supabase. You can:\n\n")
        f.write("  1. Open in Excel/Google Sheets to review\n")
        f.write("  2. Edit rows, add new ones, or remove unwanted data\n")
        f.write("  3. Import back to Supabase via the dashboard (Table Editor > Import)\n\n")
        f.write("File loading order (respects foreign keys):\n")
        f.write("  01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 08\n")
        f.write("  -> 09 -> 10 -> 11 -> 12 -> 13 -> 14 -> 15 -> 16\n\n")
        f.write("Column notes:\n")
        f.write("  - All 'id' columns are UUIDs\n")
        f.write("  - '*_json' columns contain JSON strings (for JSONB DB columns)\n")
        f.write("  - Empty strings = NULL in the database\n")
        f.write("  - learning_preferences has both flat scores_read/play/watch\n")
        f.write("    columns AND a scores_json column (the DB uses scores_json)\n\n")
        f.write(f"Generated: {now_utc().isoformat()}\n")
        f.write(f"Random seed: 42 (deterministic output)\n")

    # ---- Summary ----
    total_rows = (
        len(orgs) + len(all_users) + len(profiles) + len(org_members)
        + len(classes) + len(enrolments) + len(student_profiles)
        + len(learning_prefs) + len(lessons) + len(diff_levels) + len(tasks)
        + len(materials) + len(bias_scans) + len(bias_issues)
        + len(assessments) + len(integrations)
    )
    return total_rows


# --------------- main ---------------

def main():
    parser = argparse.ArgumentParser(description="Generate EdCopilot demo data as CSV files")
    parser.add_argument("-o", "--output", default="demo_data", help="Output directory (default: demo_data)")
    args = parser.parse_args()

    print("=" * 60)
    print("  EdCopilot Demo Data -> CSV Generator")
    print("=" * 60 + "\n")

    total = generate_all(args.output)

    print(f"\n{'=' * 60}")
    print(f"  DONE! {total} total rows across 16 CSV files")
    print(f"  Output: {os.path.abspath(args.output)}/")
    print(f"={'=' * 59}")


if __name__ == "__main__":
    main()
