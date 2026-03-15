# EdCopilot Backend Setup

## Architecture

```
Frontend (Next.js)  -->  FastAPI Backend  -->  Supabase (Postgres + Auth + RLS)
                                          -->  ML Services (placeholders)
```

FastAPI is the API gateway, business logic and ML orchestration layer.
Supabase is the single source of truth for data and auth.

## 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and paste the contents of `supabase/schema.sql`
3. Run the SQL to create all tables, RLS policies, triggers, and functions
4. Go to **Settings > API** and copy:
   - `Project URL` -> `SUPABASE_URL`
   - `anon public` key -> `SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings > API > JWT Settings** and copy:
   - `JWT Secret` -> `SUPABASE_JWT_SECRET`
6. In **Authentication > Settings**, enable Email/Password sign-in

## 2. FastAPI Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
python run.py
```

The API will be available at **http://localhost:8000**
Swagger docs at **http://localhost:8000/docs**

## 3. Frontend Setup

```bash
# In the project root (not backend/)
npm install
```

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

```bash
npm run dev
```

Frontend at **http://localhost:3000**

## 4. Connecting Frontend to Backend

See `frontend-integration-examples.ts` for code patterns.

Key pattern: the frontend sends the Supabase access token in the `Authorization: Bearer <token>` header. FastAPI validates the JWT and checks org membership for every request.

## Backend Folder Structure

```
backend/
  app/
    main.py                      # FastAPI app entrypoint
    core/
      config.py                  # Settings from .env
      auth.py                    # JWT validation, role/org checks
    db/
      supabase_client.py         # Supabase client (anon + admin)
    models/                      # Pydantic request/response schemas
      users.py
      organizations.py
      classes.py
      lessons.py
      bias.py
      students.py
      analytics.py
    services/                    # Business logic & ML placeholders
      bias_scanner.py            # Bias detection (ML extension point)
      differentiation.py         # Task generation (ML extension point)
      recommendations.py         # Learning mode recommendation (ML extension point)
    api/v1/routes/               # FastAPI routers
      auth.py                    # GET/PATCH /me, /me/organizations
      organizations.py           # CRUD orgs, API keys, integrations
      classes.py                 # CRUD classes, enrolments
      lessons.py                 # CRUD lessons + differentiation
      materials.py               # Materials + bias issues per material
      bias.py                    # POST /bias/scan, PATCH /bias/issues/{id}
      students.py                # Students, preferences, assessments, recommendations
      analytics.py               # Learning modes distribution, bias overview
      integrations.py            # External API (uses API keys, not JWT)
  supabase/
    schema.sql                   # Full DB schema + RLS policies
  run.py                         # uvicorn entry point
  requirements.txt
  .env.example
```

## API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/me` | Current user profile |
| PATCH | `/api/v1/me` | Update profile |
| GET | `/api/v1/me/organizations` | User's org memberships |
| GET | `/api/v1/organizations` | List user's orgs |
| GET | `/api/v1/organizations/{id}` | Org detail |
| PATCH | `/api/v1/organizations/{id}` | Update org settings |
| POST | `/api/v1/organizations/{id}/api-keys` | Create API key |
| GET | `/api/v1/organizations/{id}/integrations` | List integrations |
| POST | `/api/v1/classes` | Create class |
| GET | `/api/v1/classes` | List classes |
| GET | `/api/v1/classes/{id}` | Class detail |
| PATCH | `/api/v1/classes/{id}` | Update class |
| DELETE | `/api/v1/classes/{id}` | Archive class |
| POST | `/api/v1/classes/{id}/enrol` | Enrol user |
| DELETE | `/api/v1/classes/{id}/enrol/{uid}` | Remove enrolment |
| POST | `/api/v1/lessons` | Create lesson + generate differentiation |
| GET | `/api/v1/lessons/by-class/{id}` | Lessons for a class |
| GET | `/api/v1/lessons/{id}` | Lesson detail with tasks |
| PATCH | `/api/v1/lessons/{id}` | Update lesson |
| POST | `/api/v1/materials` | Create material |
| GET | `/api/v1/materials/{id}` | Material detail |
| GET | `/api/v1/materials/{id}/bias-issues` | Bias issues for material |
| POST | `/api/v1/bias/scan` | Run bias scan |
| PATCH | `/api/v1/bias/issues/{id}` | Resolve bias issue |
| GET | `/api/v1/students` | List students |
| GET | `/api/v1/students/{id}` | Student detail |
| GET | `/api/v1/students/{id}/preferences` | Learning preferences |
| PATCH | `/api/v1/students/{id}/preferences` | Update preferences |
| POST | `/api/v1/students/{id}/assessments` | Record assessment |
| GET | `/api/v1/students/{id}/recommendation` | Learning mode recommendation |
| GET | `/api/v1/analytics/classes/{id}/learning-modes` | Mode distribution |
| GET | `/api/v1/analytics/organizations/{id}/bias-overview` | Bias overview |
| POST | `/api/v1/integrations/bias-scan` | External bias scan (API key) |
| POST | `/api/v1/integrations/generate-tasks` | External task generation (API key) |

## ML Extension Points

Three services have clear placeholders for real ML:

1. **`services/bias_scanner.py`** - Replace pattern matching with LLM call
2. **`services/differentiation.py`** - Replace templates with LLM-generated tasks
3. **`services/recommendations.py`** - Replace weighted average with trained model

## Federated Architecture

All per-student data stays under the organisation's scope in Supabase.
RLS ensures complete data isolation between organisations. The central
EdCopilot service only receives anonymised, aggregated signals (controlled
by the `send_anonymised_signals` and `participate_in_model_improvement`
flags on each organisation).
