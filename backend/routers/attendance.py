from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models.attendance import Attendance
from models.employee import Employee
from schemas.attendance import AttendanceCreate, AttendanceOut, AttendanceUpdate


router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("", response_model=list[AttendanceOut])
def list_attendance(
    employee_id: int | None = Query(default=None),
    day: date | None = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
):
    stmt = select(Attendance)
    if employee_id:
        stmt = stmt.where(Attendance.employee_id == employee_id)
    if day:
        stmt = stmt.where(Attendance.date == day)
    stmt = stmt.order_by(Attendance.date.desc())
    return list(db.scalars(stmt))


@router.get("/{employee_id}", response_model=list[AttendanceOut])
def list_attendance_for_employee(
    employee_id: int,
    day: date | None = Query(default=None, alias="date"),
    db: Session = Depends(get_db),
):
    if db.get(Employee, employee_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    stmt = select(Attendance).where(Attendance.employee_id == employee_id)
    if day:
        stmt = stmt.where(Attendance.date == day)
    stmt = stmt.order_by(Attendance.date.desc())
    return list(db.scalars(stmt))


@router.post("", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def create_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.get(Employee, payload.employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    record = Attendance(employee_id=payload.employee_id, date=payload.date, status=payload.status)
    db.add(record)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Attendance already marked for this date"
        ) from exc
    db.refresh(record)
    return record


@router.put("/{attendance_id}", response_model=AttendanceOut)
def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
):
    record = db.get(Attendance, attendance_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")

    record.date = payload.date
    record.status = payload.status

    db.add(record)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Attendance already marked for this date"
        ) from exc
    db.refresh(record)
    return record


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(attendance_id: int, db: Session = Depends(get_db)):
    record = db.get(Attendance, attendance_id)
    if record is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
    db.delete(record)
    db.commit()
    return None
