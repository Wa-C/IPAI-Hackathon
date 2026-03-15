from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class TimestampMixin(BaseModel):
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PaginationParams(BaseModel):
    offset: int = 0
    limit: int = 50
