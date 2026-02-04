import { Navigate, Route, Routes } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer.jsx'
import Attendance from '../pages/Attendance.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Employees from '../pages/Employees.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/landing" element={<Navigate to="/dashboard" replace />} />
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />

      <Route element={<PageContainer />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

