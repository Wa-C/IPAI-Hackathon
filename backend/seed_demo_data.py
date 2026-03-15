"""
Seed script: populate Supabase with demo data for EdCopilot.

Usage:
    cd backend
    python seed_demo_data.py          # Insert demo data
    python seed_demo_data.py --clean   # Delete all demo data first, then re-seed
"""

import os
import sys
import random
import uuid
import argparse
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

sb = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# --------------- constants ---------------

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

SUBJECTS = ["English", "Mathematics", "Science", "History", "Geography", "Art", "Music", "PE"]
GRADES = ["7", "8", "9", "10", "11", "12"]
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

INTEGRATION_DATA = [
    {"name": "Moodle LMS", "type": "lms", "status": "connected"},
    {"name": "Google Classroom", "type": "lms", "status": "pending"},
    {"name": "Khan Academy", "type": "content", "status": "connected"},
    {"name": "Matific", "type": "content", "status": "disconnected"},
    {"name": "PowerBI Analytics", "type": "analytics", "status": "connected"},
]


def now_utc():
    return datetime.now(timezone.utc)


def random_past(days_back=90):
    return now_utc() - timedelta(days=random.randint(1, days_back), hours=random.randint(0, 23))


def random_future(days_ahead=14):
    return now_utc() + timedelta(days=random.randint(1, days_ahead), hours=random.randint(8, 16))


# --------------- cleanup ---------------

def clean_all():
    """Delete all seeded data. Order matters due to FK constraints."""
    print("Cleaning existing data...")

    tables_ordered = [
        "bias_issues", "bias_scans", "assessments", "learning_preferences",
        "tasks", "differentiation_levels", "lessons", "materials",
        "class_enrolments", "student_profiles", "classes",
        "api_keys", "integrations", "org_members", "organizations",
    ]
    for t in tables_ordered:
        try:
            sb.table(t).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"  Cleared {t}")
        except Exception as e:
            print(f"  Warning clearing {t}: {e}")

    # Delete auth users (except real ones)
    print("  Deleting demo auth users...")
    try:
        users_resp = sb.auth.admin.list_users()
        for u in users_resp:
            if u.email and u.email.endswith("@demo.edcopilot.local"):
                sb.auth.admin.delete_user(u.id)
        print("  Deleted demo auth users")
    except Exception as e:
        print(f"  Warning deleting auth users: {e}")

    print("Cleanup done.\n")


# --------------- seed functions ---------------

def create_auth_users():
    """Create teacher + student auth users via admin API."""
    print("Creating auth users...")
    teachers = []
    students = []

    for name in TEACHER_NAMES:
        email = f"{name.lower().replace(' ', '.')}@demo.edcopilot.local"
        try:
            resp = sb.auth.admin.create_user({
                "email": email,
                "password": "demo123456",
                "email_confirm": True,
                "user_metadata": {"name": name, "role": "teacher"},
            })
            teachers.append({"id": resp.user.id, "name": name, "email": email})
            print(f"  Teacher: {name} ({resp.user.id})")
        except Exception as e:
            print(f"  Warning creating teacher {name}: {e}")

    for name in STUDENT_NAMES:
        email = f"{name.lower().replace(' ', '.')}@demo.edcopilot.local"
        try:
            resp = sb.auth.admin.create_user({
                "email": email,
                "password": "demo123456",
                "email_confirm": True,
                "user_metadata": {"name": name, "role": "student"},
            })
            students.append({"id": resp.user.id, "name": name, "email": email})
        except Exception as e:
            print(f"  Warning creating student {name}: {e}")

    print(f"  Created {len(teachers)} teachers, {len(students)} students\n")
    return teachers, students


def create_organizations():
    print("Creating organizations...")
    orgs = []
    for org in ORG_DATA:
        result = sb.table("organizations").insert(org).execute()
        orgs.append(result.data[0])
        print(f"  Org: {org['name']} ({result.data[0]['id']})")
    print()
    return orgs


def create_org_members(orgs, teachers, students):
    print("Creating org members...")
    # Distribute teachers across orgs
    for i, t in enumerate(teachers):
        org = orgs[i % len(orgs)]
        sb.table("org_members").insert({
            "user_id": t["id"],
            "organization_id": org["id"],
            "role": "teacher",
        }).execute()

    # First teacher is also org_admin of first org
    if teachers:
        try:
            sb.table("org_members").insert({
                "user_id": teachers[0]["id"],
                "organization_id": orgs[0]["id"],
                "role": "org_admin",
            }).execute()
        except Exception:
            pass  # unique constraint if already inserted

    # Distribute students across orgs
    for i, s in enumerate(students):
        org = orgs[i % len(orgs)]
        s["org_id"] = org["id"]
        sb.table("org_members").insert({
            "user_id": s["id"],
            "organization_id": org["id"],
            "role": "student",
        }).execute()

    print(f"  Linked all users to orgs\n")


def create_classes(orgs, teachers):
    print("Creating classes...")
    class_names = [
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

    classes = []
    for i, (name, grade, subject) in enumerate(class_names):
        org = orgs[i % len(orgs)]
        teacher = teachers[i % len(teachers)]
        row = sb.table("classes").insert({
            "name": name,
            "grade": grade,
            "subject": subject,
            "organization_id": org["id"],
            "teacher_id": teacher["id"],
            "next_lesson_time": random_future().isoformat(),
            "student_count": 0,
        }).execute()
        cls = row.data[0]
        cls["_org_id"] = org["id"]
        classes.append(cls)
        print(f"  Class: {name}")

    print()
    return classes


def create_enrolments_and_profiles(classes, students, orgs):
    print("Creating student profiles and enrolments...")
    # Distribute students to classes (each student in 1 class)
    for i, s in enumerate(students):
        org_id = s["org_id"]
        # Find classes in same org
        org_classes = [c for c in classes if c["_org_id"] == org_id]
        if not org_classes:
            org_classes = classes
        cls = random.choice(org_classes)

        # Enrolment
        try:
            sb.table("class_enrolments").insert({
                "class_id": cls["id"],
                "user_id": s["id"],
                "role": "student",
            }).execute()
        except Exception as e:
            print(f"  Warning enrolment for {s['name']}: {e}")

        # Student profile
        perf = random.choice(PERFORMANCE)
        try:
            sb.table("student_profiles").insert({
                "id": s["id"],
                "organization_id": org_id,
                "class_id": cls["id"],
                "name": s["name"],
                "email": s["email"],
                "performance_status": perf,
                "last_activity_date": random_past(14).isoformat(),
            }).execute()
        except Exception as e:
            print(f"  Warning profile for {s['name']}: {e}")

        s["class_id"] = cls["id"]

    print(f"  Created profiles and enrolments for {len(students)} students\n")


def create_learning_preferences(students):
    print("Creating learning preferences...")
    for s in students:
        scores = {
            "read": random.randint(30, 95),
            "play": random.randint(30, 95),
            "watch": random.randint(30, 95),
        }
        best = max(scores, key=scores.get)
        recommended = best if scores[best] > 60 else "mixed"

        try:
            sb.table("learning_preferences").insert({
                "student_id": s["id"],
                "recommended": recommended,
                "scores": scores,
            }).execute()
        except Exception as e:
            print(f"  Warning pref for {s['name']}: {e}")

    print(f"  Created {len(students)} learning preferences\n")


def create_lessons(classes, teachers):
    print("Creating lessons with differentiation...")
    lessons = []

    for i, (title, subject, topic) in enumerate(LESSON_TOPICS):
        cls = classes[i % len(classes)]
        teacher = teachers[i % len(teachers)]
        status = random.choice(["draft", "published", "published", "published"])
        grade_level = int(cls["grade"])

        row = sb.table("lessons").insert({
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
            "content_types": random.sample(["video", "text", "quiz", "game", "interactive"], k=random.randint(2, 4)),
            "bias_scan_status": random.choice(["clean", "clean", "issues-found", None]),
            "created_by": teacher["id"],
            "created_at": random_past(30).isoformat(),
        }).execute()
        lesson = row.data[0]

        # Create differentiation levels + tasks for published lessons
        if status == "published":
            for level_name, rationale_prefix in [
                ("struggling", "Visual and interactive approach for"),
                ("on-track", "Grade-level text-based activity for"),
                ("advanced", "Extended challenge activity for"),
            ]:
                dl_row = sb.table("differentiation_levels").insert({
                    "lesson_id": lesson["id"],
                    "level": level_name,
                    "rationale": f"{rationale_prefix} {topic}",
                }).execute()
                dl = dl_row.data[0]

                # 2-3 tasks per level
                num_tasks = random.randint(2, 3)
                for t_idx in range(num_tasks):
                    mode = random.choice(MODES)
                    sb.table("tasks").insert({
                        "differentiation_level_id": dl["id"],
                        "title": f"{level_name.replace('-', ' ').title()} Task {t_idx + 1}: {topic}",
                        "description": f"A {mode}-based activity for {level_name} learners on {topic}.",
                        "mode": mode,
                        "duration": random.choice([5, 10, 15, 20, 25, 30]),
                        "generated_by_ai": True,
                    }).execute()

        lessons.append(lesson)
        print(f"  Lesson: {title}")

    print(f"  Created {len(lessons)} lessons\n")
    return lessons


def create_materials(classes, teachers):
    print("Creating materials...")
    material_titles = [
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
    materials = []
    for i, title in enumerate(material_titles):
        cls = classes[i % len(classes)]
        teacher = teachers[i % len(teachers)]
        row = sb.table("materials").insert({
            "title": title,
            "content": f"Content for {title}. This is sample educational material used for demonstration purposes.",
            "class_id": cls["id"],
            "created_by": teacher["id"],
        }).execute()
        materials.append(row.data[0])
        print(f"  Material: {title}")

    print(f"  Created {len(materials)} materials\n")
    return materials


def create_bias_scans(materials):
    print("Creating bias scans and issues...")
    scan_count = 0
    issue_count = 0

    for mat in materials[:10]:
        # Pick 2-4 random bias phrases per scan
        phrases = random.sample(BIAS_PHRASES, k=random.randint(2, 4))
        issues_by_cat = {}
        for _, cat, _, _, _ in phrases:
            issues_by_cat[cat] = issues_by_cat.get(cat, 0) + 1

        resolved_count = random.randint(0, len(phrases))
        scan_row = sb.table("bias_scans").insert({
            "material_id": mat["id"],
            "scanned_at": random_past(30).isoformat(),
            "total_issues": len(phrases),
            "issues_by_category": issues_by_cat,
            "resolved_count": resolved_count,
        }).execute()
        scan = scan_row.data[0]
        scan_count += 1

        pos = 0
        for idx, (phrase, cat, sev, suggestion, explanation) in enumerate(phrases):
            end = pos + len(phrase)
            sb.table("bias_issues").insert({
                "scan_id": scan["id"],
                "category": cat,
                "severity": sev,
                "original_phrase": phrase,
                "explanation": explanation,
                "suggestion": suggestion,
                "position_start": pos,
                "position_end": end,
                "resolved": idx < resolved_count,
            }).execute()
            pos = end + 50
            issue_count += 1

    print(f"  Created {scan_count} scans with {issue_count} issues\n")


def create_assessments(students):
    print("Creating assessments...")
    assessment_types = ["mini-test", "quiz", "homework", "project", "exam"]
    count = 0

    for s in students:
        num = random.randint(1, 3)
        for _ in range(num):
            max_score = random.choice([10, 20, 50, 100])
            score = round(random.uniform(max_score * 0.3, max_score), 1)
            sb.table("assessments").insert({
                "student_id": s["id"],
                "assessment_type": random.choice(assessment_types),
                "score": score,
                "max_score": max_score,
                "mode_used": random.choice(MODES),
                "created_at": random_past(60).isoformat(),
            }).execute()
            count += 1

    print(f"  Created {count} assessments\n")


def create_integrations(orgs):
    print("Creating integrations...")
    for org in orgs:
        for integ in INTEGRATION_DATA:
            sb.table("integrations").insert({
                "organization_id": org["id"],
                "name": integ["name"],
                "type": integ["type"],
                "status": integ["status"],
                "config": {"version": "1.0", "auto_sync": True},
            }).execute()

    print(f"  Created {len(orgs) * len(INTEGRATION_DATA)} integrations\n")


# --------------- main ---------------

def main():
    parser = argparse.ArgumentParser(description="Seed EdCopilot demo data")
    parser.add_argument("--clean", action="store_true", help="Delete all demo data before seeding")
    args = parser.parse_args()

    print("=" * 60)
    print("  EdCopilot Demo Data Seeder")
    print("=" * 60 + "\n")

    if args.clean:
        clean_all()

    # 1. Auth users
    teachers, students = create_auth_users()
    if not teachers or not students:
        print("ERROR: Failed to create auth users. Check your Supabase credentials.")
        sys.exit(1)

    # 2. Organizations
    orgs = create_organizations()

    # 3. Org members
    create_org_members(orgs, teachers, students)

    # 4. Classes
    classes = create_classes(orgs, teachers)

    # 5. Enrolments + Student profiles
    create_enrolments_and_profiles(classes, students, orgs)

    # 6. Learning preferences
    create_learning_preferences(students)

    # 7. Lessons with differentiation
    lessons = create_lessons(classes, teachers)

    # 8. Materials
    materials = create_materials(classes, teachers)

    # 9. Bias scans
    create_bias_scans(materials)

    # 10. Assessments
    create_assessments(students)

    # 11. Integrations
    create_integrations(orgs)

    print("=" * 60)
    print("  SEED COMPLETE!")
    print(f"  Teachers:    {len(teachers)}")
    print(f"  Students:    {len(students)}")
    print(f"  Orgs:        {len(orgs)}")
    print(f"  Classes:     {len(classes)}")
    print(f"  Lessons:     {len(lessons)}")
    print(f"  Materials:   {len(materials)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
