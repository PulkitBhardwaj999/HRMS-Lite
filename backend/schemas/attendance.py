from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


AttendanceStatus = Literal["Present", "Absent"]


class AttendanceCreate(BaseModel):
    employee_id: int = Field(..., gt=0)
    date: date
    status: AttendanceStatus


class AttendanceUpdate(BaseModel):
    date: date
    status: AttendanceStatus


class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    status: AttendanceStatus

    model_config = ConfigDict(from_attributes=True)

