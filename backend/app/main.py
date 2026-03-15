from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.routes import (
    auth,
    organizations,
    classes,
    lessons,
    materials,
    bias,
    students,
    analytics,
    integrations,
    dashboard,
    student_prefs,
    upload,
    chat,
)

app = FastAPI(
    title="EdCopilot API",
    description="Backend API for EdCopilot - AI-powered inclusive education platform",
    version="0.1.0",
)

# In dev mode, allow all origins so any frontend port works
if settings.auth_disabled:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount v1 routers
PREFIX = "/api/v1"
app.include_router(auth.router, prefix=PREFIX, tags=["Auth"])
app.include_router(organizations.router, prefix=PREFIX, tags=["Organisations"])
app.include_router(classes.router, prefix=PREFIX, tags=["Classes"])
app.include_router(lessons.router, prefix=PREFIX, tags=["Lessons"])
app.include_router(materials.router, prefix=PREFIX, tags=["Materials"])
app.include_router(bias.router, prefix=PREFIX, tags=["Bias Scanning"])
app.include_router(students.router, prefix=PREFIX, tags=["Students"])
app.include_router(analytics.router, prefix=PREFIX, tags=["Analytics"])
app.include_router(integrations.router, prefix=PREFIX, tags=["Integrations"])
app.include_router(dashboard.router, prefix=PREFIX, tags=["Dashboard"])
app.include_router(student_prefs.router, prefix=PREFIX, tags=["Student Preferences"])
app.include_router(upload.router, prefix=PREFIX, tags=["Upload"])
app.include_router(chat.router, prefix=PREFIX, tags=["Chatbot"])


@app.get("/health")
async def health():
    return {"status": "ok"}
