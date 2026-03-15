from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class OrganizationOut(BaseModel):
    id: UUID
    name: str
    code: str
    webhook_url: str | None = None
    allow_lms_integration: bool = True
    allow_third_party_content: bool = True
    enable_federated_learning: bool = True
    send_anonymised_signals: bool = True
    participate_in_model_improvement: bool = True
    model_version: str = "v1.0.0"
    created_at: datetime | None = None


class OrganizationUpdate(BaseModel):
    name: str | None = None
    webhook_url: str | None = None
    allow_lms_integration: bool | None = None
    allow_third_party_content: bool | None = None
    enable_federated_learning: bool | None = None
    send_anonymised_signals: bool | None = None
    participate_in_model_improvement: bool | None = None


class ApiKeyOut(BaseModel):
    id: UUID
    key_prefix: str
    created_at: datetime


class ApiKeyCreate(BaseModel):
    label: str = "default"


class IntegrationOut(BaseModel):
    id: UUID
    name: str
    type: str  # lms | content | analytics
    status: str  # connected | pending | disconnected
    config: dict | None = None
    created_at: datetime | None = None
