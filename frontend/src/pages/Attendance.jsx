import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Loader from '../components/ui/Loader.jsx'
import { createAttendance, deleteAttendance, listAttendance, updateAttendance } from '../services/attendance'
import { listEmployees } from '../services/employees'

const todayISO = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  employee_id: '',
  date: todayISO(),
  status: 'Present',
}

function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M20 4v8h-8" />
    </svg>
  )
}

function IconEdit(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

const inputBase =
  'mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70'

function inputClass(hasError) {
  return `${inputBase} ${hasError ? 'border-rose-300' : 'border-slate-200'}`
}

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [employeesLoading, setEmployeesLoading] = useState(true)
  const [employeesError, setEmployeesError] = useState('')

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState(initialForm)
  const [filterDate, setFilterDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const employeeSelectRef = useRef(null)
  const dateInputRef = useRef(null)

  const selectedEmployee = useMemo(() => {
    const id = Number(form.employee_id)
    if (!id) return null
    return employees.find((e) => e.id === id) || null
  }, [employees, form.employee_id])

  const visibleRecords = useMemo(() => {
    if (!filterDate) return records
    return records.filter((r) => r.date === filterDate)
  }, [filterDate, records])

  const presentCount = useMemo(() => records.filter((r) => r.status === 'Present').length, [records])
  const absentCount = useMemo(() => records.filter((r) => r.status === 'Absent').length, [records])

  const canSubmit = useMemo(() => Boolean(form.employee_id && form.date && form.status), [form])

  const fieldErrors = useMemo(() => {
    if (!submitAttempted) return {}
    return {
      employee_id: !form.employee_id ? 'Employee is required.' : '',
      date: !form.date ? 'Date is required.' : '',
    }
  }, [form, submitAttempted])

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true)
    setEmployeesError('')
    try {
      const data = await listEmployees()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      setEmployeesError(err?.response?.data?.detail || err?.message || 'Failed to load employees')
    } finally {
      setEmployeesLoading(false)
    }
  }, [])

  const loadAttendance = useCallback(async () => {
    if (!form.employee_id) {
      setRecords([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await listAttendance({
        employeeId: Number(form.employee_id),
      })
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [form.employee_id])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  useEffect(() => {
    loadAttendance()
  }, [loadAttendance])

  function resetForm() {
    setForm((prev) => ({
      ...initialForm,
      employee_id: prev.employee_id,
      date: todayISO(),
    }))
    setEditingId(null)
    setSubmitAttempted(false)
    setFormError('')
    setTimeout(() => employeeSelectRef.current?.focus(), 0)
  }

  function onEdit(record) {
    setEditingId(record.id)
    setForm({
      employee_id: String(record.employee_id),
      date: record.date,
      status: record.status,
    })
    setSubmitAttempted(false)
    setFormError('')
    setSuccess('')
    setTimeout(() => dateInputRef.current?.focus(), 0)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitAttempted(true)
    setFormError('')
    setSuccess('')

    if (!form.employee_id || !form.date) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateAttendance(editingId, { date: form.date, status: form.status })
        setSuccess('Attendance updated.')
      } else {
        await createAttendance({
          employee_id: Number(form.employee_id),
          date: form.date,
          status: form.status,
        })
        setSuccess('Attendance marked.')
      }
      resetForm()
      await loadAttendance()
    } catch (err) {
      setFormError(err?.response?.data?.detail || err?.message || 'Unable to save attendance')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this attendance record?')) return
    try {
      await deleteAttendance(id)
      await loadAttendance()
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to delete attendance')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Attendance Management</h1>
          <p className="mt-1 text-sm text-slate-500">Mark daily attendance and review records per employee.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            onClick={loadAttendance}
            disabled={!form.employee_id}
            title={!form.employee_id ? 'Select an employee to refresh attendance' : 'Refresh attendance'}
          >
            <IconRefresh className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        <Card as="section">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingId ? 'Edit Attendance' : 'Mark Attendance'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editingId
                    ? 'Update the selected record. Employee selection is locked.'
                    : 'Choose an employee, pick a date, and set Present/Absent.'}
                </p>
              </div>
              <Badge variant={editingId ? 'info' : 'neutral'}>{editingId ? 'Editing' : 'New'}</Badge>
            </div>
          </div>

          <div className="p-5">
            {employeesLoading ? (
              <Loader label="Loading employees..." />
            ) : employeesError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {employeesError}
              </div>
            ) : employees.length === 0 ? (
              <EmptyState title="No employees" description="Add employees before marking attendance." />
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Employee<span className="text-rose-600">*</span>
                  </label>
                  <select
                    ref={employeeSelectRef}
                    value={form.employee_id}
                    onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                    disabled={saving || Boolean(editingId)}
                    className={inputClass(Boolean(fieldErrors.employee_id))}
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.employee_id ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.employee_id}</p>
                  ) : selectedEmployee ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Selected: {selectedEmployee.full_name} ({selectedEmployee.employee_id})
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Date<span className="text-rose-600">*</span>
                  </label>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    disabled={saving}
                    className={inputClass(Boolean(fieldErrors.date))}
                    required
                  />
                  {fieldErrors.date ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.date}</p>
                  ) : null}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600">Status</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setForm({ ...form, status: 'Present' })}
                      disabled={saving}
                      aria-pressed={form.status === 'Present'}
                      className={
                        form.status === 'Present'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                          : ''
                      }
                    >
                      Present
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setForm({ ...form, status: 'Absent' })}
                      disabled={saving}
                      aria-pressed={form.status === 'Absent'}
                      className={
                        form.status === 'Absent'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50'
                          : ''
                      }
                    >
                      Absent
                    </Button>
                  </div>
                </div>

                {formError ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {formError}
                  </div>
                ) : null}
                {success ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {success}
                  </div>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button type="submit" variant="primary" disabled={saving || !canSubmit}>
                    {saving ? 'Saving...' : editingId ? 'Update Attendance' : 'Mark Attendance'}
                  </Button>
                  {editingId ? (
                    <Button variant="secondary" onClick={resetForm} disabled={saving}>
                      Cancel
                    </Button>
                  ) : null}
                  <div className="text-xs text-slate-500 sm:ml-auto">Changes save directly to your database.</div>
                </div>
              </form>
            )}
          </div>
        </Card>

        <Card as="section" className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Attendance Records</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedEmployee
                    ? `${selectedEmployee.full_name} • ${selectedEmployee.employee_id}`
                    : 'Choose an employee to view their attendance history.'}
                </p>
              </div>
              {selectedEmployee ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    {records.length} record{records.length === 1 ? '' : 's'}
                  </Badge>
                  <Badge variant="success">{presentCount} present</Badge>
                  <Badge variant="danger">{absentCount} absent</Badge>
                </div>
              ) : null}
            </div>
          </div>

          <div className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full sm:max-w-xs">
                <label className="text-xs font-semibold text-slate-600">Filter by date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>
              {filterDate ? (
                <Button variant="secondary" size="sm" onClick={() => setFilterDate('')}>
                  Clear filter
                </Button>
              ) : null}
            </div>

            <div className="mt-4">
              {!form.employee_id ? (
                <EmptyState title="Select an employee" description="Choose an employee to view attendance records." />
              ) : loading ? (
                <Loader label="Loading attendance..." />
              ) : error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : visibleRecords.length === 0 ? (
                <EmptyState
                  title="No records found"
                  description={
                    filterDate ? `No attendance records for ${filterDate}.` : 'Mark attendance to populate this list.'
                  }
                />
              ) : (
                <div className="max-h-[560px] overflow-auto rounded-xl border border-slate-200">
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
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleRecords.map((record, idx) => {
                        const isEditing = editingId === record.id
                        const baseBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'

                        return (
                          <tr
                            key={record.id}
                            className={`${isEditing ? 'bg-indigo-50' : baseBg} transition-colors hover:bg-slate-100`}
                          >
                            <td className="px-4 py-3 text-slate-900">
                              {selectedEmployee ? selectedEmployee.full_name : `Employee #${record.employee_id}`}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-700">{record.date}</td>
                            <td className="px-4 py-3">
                              <Badge variant={record.status === 'Present' ? 'success' : 'danger'}>
                                {record.status}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  onClick={() => onEdit(record)}
                                  aria-label="Edit attendance"
                                  title="Edit"
                                >
                                  <IconEdit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="icon"
                                  onClick={() => onDelete(record.id)}
                                  aria-label="Delete attendance"
                                  title="Delete"
                                >
                                  <IconTrash className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

