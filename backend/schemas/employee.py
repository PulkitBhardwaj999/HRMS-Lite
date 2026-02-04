from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)
    # HRMS Lite does not require this field; default to today for convenience.
    date_of_joining: date = Field(default_factory=date.today)


class EmployeeUpdate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    department: str = Field(..., min_length=1, max_length=100)
    date_of_joining: date


class EmployeeOut(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    department: str
    date_of_joining: date

    model_config = ConfigDict(from_attributes=True)
