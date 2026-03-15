from pydantic import BaseModel


class LearningModesDistribution(BaseModel):
    readers: int = 0
    players: int = 0
    watchers: int = 0
    mixed: int = 0


class BiasCategoryStats(BaseModel):
    flagged: int = 0
    resolved: int = 0


class BiasOverview(BaseModel):
    gender: BiasCategoryStats = BiasCategoryStats()
    culture: BiasCategoryStats = BiasCategoryStats()
    socioeconomic: BiasCategoryStats = BiasCategoryStats()
    ableism: BiasCategoryStats = BiasCategoryStats()
    total_flagged: int = 0
    total_resolved: int = 0


class MlTaskOut(BaseModel):
    id: str
    task_type: str
    status: str  # pending | processing | completed | failed
    result: dict | None = None
    error: str | None = None
