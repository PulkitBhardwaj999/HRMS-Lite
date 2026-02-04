import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Loader from '../components/ui/Loader.jsx'
import { getDashboardSummary } from '../services/dashboard'

function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v8h-8" />
    </svg>
  )
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const stats = useMemo(() => {
    return [
      {
        label: 'Total Employees',
        value: summary?.total_employees ?? 0,
        hint: 'Active workforce',
      },
      {
        label: 'Present Today',
        value: summary?.present_today ?? 0,
        hint: 'Checked in',
      },
      {
        label: 'Absent Today',
        value: summary?.absent_today ?? 0,
        hint: 'Not available',
      },
    ]
  }, [summary])

  const loadSummary = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getDashboardSummary()
      setSummary(data)
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Home Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">High-level HR insights and recent activity.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button as={Link} to="/employees" variant="primary">
            Add Employee
          </Button>
          <Button as={Link} to="/attendance" variant="secondary">
            Mark Attendance
          </Button>
          <Button variant="ghost" onClick={loadSummary}>
            <IconRefresh className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading dashboard insights..." />
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((item) => (
              <Card key={item.label} className="p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</div>
                <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{item.value}</div>
                <div className="mt-1 text-sm text-slate-500">{item.hint}</div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Attendance Logs</h2>
                <p className="mt-1 text-xs text-slate-500">Latest attendance entries across employees.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={loadSummary}>
                <IconRefresh className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="p-5">
              {summary?.recent_attendance?.length ? (
                <div className="max-h-[520px] overflow-auto rounded-xl border border-slate-200">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Employee
                        </th>
                        <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {summary.recent_attendance.map((row, idx) => (
                        <tr key={`${row.employee_id}-${idx}`} className="bg-white transition hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">{row.employee_name}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{row.date}</td>
                          <td className="px-4 py-3">
                            <Badge variant={row.status === 'Present' ? 'success' : 'danger'}>{row.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No attendance yet" description="Mark attendance to see recent activity." />
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

