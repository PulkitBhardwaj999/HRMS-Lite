from datetime import date

from pydantic import BaseModel


class RecentAttendance(BaseModel):
    employee_id: int
    employee_name: str
    date: date
    status: str


class DashboardSummary(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    recent_attendance: list[RecentAttendance]

