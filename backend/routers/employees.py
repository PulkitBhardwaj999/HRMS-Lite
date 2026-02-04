from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from models.employee import Employee
from schemas.employee import EmployeeCreate, EmployeeOut, EmployeeUpdate


router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=list[EmployeeOut])
def list_employees(db: Session = Depends(get_db)):
    stmt = select(Employee).order_by(Employee.created_at.desc())
    return list(db.scalars(stmt))


@router.get("/{employee_id}", response_model=EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    existing_id = db.scalar(select(Employee).where(Employee.employee_id == payload.employee_id.strip()))
    if existing_id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Employee ID already exists")
    existing_email = db.scalar(select(Employee).where(Employee.email == payload.email.lower()))
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    employee = Employee(
        employee_id=payload.employee_id.strip(),
        full_name=payload.full_name.strip(),
        email=payload.email.lower(),
        department=payload.department.strip(),
        date_of_joining=payload.date_of_joining,
    )
    db.add(employee)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate employee") from exc
    db.refresh(employee)
    return employee


@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(
    employee_id: int, payload: EmployeeUpdate, db: Session = Depends(get_db)
):
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    existing_email = db.scalar(
        select(Employee).where(Employee.email == payload.email.lower(), Employee.id != employee_id)
    )
    if existing_email:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")

    employee.full_name = payload.full_name.strip()
    employee.email = payload.email.lower()
    employee.department = payload.department.strip()
    employee.date_of_joining = payload.date_of_joining

    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return None
