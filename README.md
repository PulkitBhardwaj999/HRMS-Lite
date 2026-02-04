# HRMS Lite

HRMS Lite is a lightweight Human Resource Management System that allows an admin to manage employees and track daily attendance through a clean, professional UI.

## Application Workflow (No Authentication Required)

1. Open the app → Dashboard
2. Add employees
3. Mark daily attendance (Present/Absent)
4. View attendance records per employee

## Tech Stack

- Frontend: React (Vite), React Router, Axios
- Backend: Python, FastAPI, SQLAlchemy
- Database: SQLite (default) or PostgreSQL (via `DATABASE_URL`)

## Key Features

- **Employee Management**: Add, list, edit (optional), delete employees
- **Attendance Management**: Mark attendance (Present/Absent) and view per employee
- **Validations & errors**: Required fields, email validation, duplicates handled with `409`
- **UI states**: Loading, empty, and error states across screens

### Bonus Implemented

- Dashboard summary (employee count + present/absent today + recent logs)
- Attendance filter by date
- Present-days count per employee (in Attendance screen)

## API Endpoints

### Employees
- `GET /employees`
- `POST /employees`
- `GET /employees/{employee_id}`
- `PUT /employees/{employee_id}`
- `DELETE /employees/{employee_id}`

### Attendance
- `GET /attendance?employee_id=&date=`
- `GET /attendance/{employee_id}`
- `POST /attendance`
- `PUT /attendance/{attendance_id}`
- `DELETE /attendance/{attendance_id}`

### Dashboard
- `GET /dashboard/summary`

## Run Locally

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and calls the backend at `http://localhost:8000` by default.

To change the backend URL:

```bash
# copy `frontend/.env.example` -> `frontend/.env`
VITE_API_URL=http://localhost:8000
```

## Environment Variables

Backend (`backend/.env.example`):

```
DATABASE_URL=sqlite:///./hrms.db
```

Frontend (`frontend/.env.example`):

```
VITE_API_URL=http://localhost:8000
```

## Deployment (Suggested)

### Backend (Render / Railway)

- Root directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port 10000`

### Frontend (Vercel / Netlify)

- Root directory: `frontend`
- Env var: `VITE_API_URL=<your backend URL>`
- Build: `npm run build`

## Assumptions / Limitations

- Single admin user (no authentication required).
- SQLite is default; use PostgreSQL for production.
- Attendance is unique per employee per date (duplicates return `409 Conflict`).
