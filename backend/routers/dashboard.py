from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from database import get_db
from models.attendance import Attendance
from models.employee import Employee
from schemas.dashboard import DashboardSummary, RecentAttendance


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def summary(db: Session = Depends(get_db)):
    today = date.today()

    total_employees = db.scalar(select(func.count()).select_from(Employee)) or 0
    present_today = (
        db.scalar(
            select(func.count())
            .select_from(Attendance)
            .where(Attendance.date == today, Attendance.status == "Present")
        )
        or 0
    )
    absent_today = (
        db.scalar(
            select(func.count())
            .select_from(Attendance)
            .where(Attendance.date == today, Attendance.status == "Absent")
        )
        or 0
    )

    stmt = (
        select(Attendance, Employee)
        .join(Employee, Employee.id == Attendance.employee_id)
        .order_by(Attendance.date.desc(), Attendance.id.desc())
        .limit(5)
    )
    rows = db.execute(stmt).all()
    recent = [
        RecentAttendance(
            employee_id=employee.id,
            employee_name=employee.full_name,
            date=attendance.date,
            status=attendance.status,
        )
        for attendance, employee in rows
    ]

    return DashboardSummary(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        recent_attendance=recent,
    )
