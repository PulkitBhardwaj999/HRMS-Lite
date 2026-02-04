import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Loader from '../components/ui/Loader.jsx'
import { createEmployee, deleteEmployee, listEmployees, updateEmployee } from '../services/employees'

const todayISO = () => new Date().toISOString().slice(0, 10)

const initialForm = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
  date_of_joining: todayISO(),
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

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const employeeIdInputRef = useRef(null)
  const fullNameInputRef = useRef(null)

  const canSubmit = useMemo(() => {
    const baseValid = form.full_name.trim() && form.email.trim() && form.department.trim() && form.date_of_joining
    if (editingId) return Boolean(baseValid)
    return Boolean(baseValid && form.employee_id.trim())
  }, [editingId, form])

  const fieldErrors = useMemo(() => {
    if (!submitAttempted) return {}
    return {
      employee_id: !editingId && !form.employee_id.trim() ? 'Employee ID is required.' : '',
      full_name: !form.full_name.trim() ? 'Full name is required.' : '',
      email: !form.email.trim() ? 'Email is required.' : '',
      department: !form.department.trim() ? 'Department is required.' : '',
      date_of_joining: !form.date_of_joining ? 'Date of joining is required.' : '',
    }
  }, [editingId, form, submitAttempted])

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listEmployees()
      setEmployees(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  function resetForm() {
    setForm(initialForm)
    setEditingId(null)
    setSubmitAttempted(false)
    setFormError('')
    setTimeout(() => employeeIdInputRef.current?.focus(), 0)
  }

  function onEdit(employee) {
    setEditingId(employee.id)
    setForm({
      employee_id: employee.employee_id,
      full_name: employee.full_name,
      email: employee.email,
      department: employee.department,
      date_of_joining: employee.date_of_joining,
    })
    setSubmitAttempted(false)
    setFormError('')
    setSuccess('')
    setTimeout(() => fullNameInputRef.current?.focus(), 0)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitAttempted(true)
    setFormError('')
    setSuccess('')

    if (
      (!editingId && !form.employee_id.trim()) ||
      !form.full_name.trim() ||
      !form.email.trim() ||
      !form.department.trim() ||
      !form.date_of_joining
    ) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateEmployee(editingId, {
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          date_of_joining: form.date_of_joining,
        })
        setSuccess('Employee updated successfully.')
      } else {
        await createEmployee({
          employee_id: form.employee_id.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          department: form.department.trim(),
          date_of_joining: form.date_of_joining,
        })
        setSuccess('Employee created successfully.')
      }
      resetForm()
      await loadEmployees()
    } catch (err) {
      setFormError(err?.response?.data?.detail || err?.message || 'Unable to save employee')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(id) {
    if (!confirm('Delete this employee?')) return
    try {
      await deleteEmployee(id)
      await loadEmployees()
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to delete employee')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Employee Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and maintain employee records with clear validation and safe actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadEmployees}>
            <IconRefresh className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[420px_1fr]">
        {/* Add/Edit Panel */}
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingId ? 'Edit Employee' : 'Add Employee'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {editingId
                    ? 'Update details. Employee ID is locked.'
                    : 'Create a new employee. Employee ID must be unique.'}
                </p>
              </div>
              <Badge variant={editingId ? 'info' : 'neutral'}>{editingId ? 'Editing' : 'New'}</Badge>
            </div>
          </div>

          <form className="p-5" onSubmit={onSubmit}>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  Employee ID{editingId ? null : <span className="text-rose-600">*</span>}
                </label>
                <input
                  ref={employeeIdInputRef}
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                  placeholder="EMP-001"
                  disabled={saving || Boolean(editingId)}
                  autoFocus={!editingId}
                  className={inputClass(Boolean(fieldErrors.employee_id))}
                />
                {fieldErrors.employee_id ? (
                  <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.employee_id}</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Example: EMP-001, EMP-100</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  Full Name<span className="text-rose-600">*</span>
                </label>
                <input
                  ref={fullNameInputRef}
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Jane Doe"
                  disabled={saving}
                  autoFocus={Boolean(editingId)}
                  className={inputClass(Boolean(fieldErrors.full_name))}
                  required
                />
                {fieldErrors.full_name ? (
                  <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.full_name}</p>
                ) : null}
              </div>

              <div>
                <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                  Email<span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jane@company.com"
                  disabled={saving}
                  className={inputClass(Boolean(fieldErrors.email))}
                  required
                />
                {fieldErrors.email ? (
                  <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Department<span className="text-rose-600">*</span>
                  </label>
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    placeholder="Engineering"
                    disabled={saving}
                    className={inputClass(Boolean(fieldErrors.department))}
                    required
                  />
                  {fieldErrors.department ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.department}</p>
                  ) : null}
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">
                    Date of Joining<span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.date_of_joining}
                    onChange={(e) => setForm({ ...form, date_of_joining: e.target.value })}
                    disabled={saving}
                    className={inputClass(Boolean(fieldErrors.date_of_joining))}
                    required
                  />
                  {fieldErrors.date_of_joining ? (
                    <p className="mt-1 text-xs font-medium text-rose-600">{fieldErrors.date_of_joining}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {formError ? (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {formError}
              </div>
            ) : null}
            {success ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="submit" variant="primary" disabled={saving || !canSubmit}>
                {saving ? 'Saving...' : editingId ? 'Update Employee' : 'Create Employee'}
              </Button>
              {editingId ? (
                <Button variant="secondary" onClick={resetForm} disabled={saving}>
                  Cancel
                </Button>
              ) : null}
              <div className="text-xs text-slate-500 sm:ml-auto">Changes save directly to your database.</div>
            </div>
          </form>
        </Card>

        {/* Directory Panel */}
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Employee Directory</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {employees.length} employee{employees.length === 1 ? '' : 's'} total
                </p>
              </div>
              {editingId ? <Badge variant="info">Editing active</Badge> : null}
            </div>
          </div>

          <div className="p-5">
            {loading ? (
              <Loader label="Loading employees..." />
            ) : error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : employees.length === 0 ? (
              <EmptyState
                title="No employees found"
                description="Create your first employee using the form on the left."
              />
            ) : (
              <div className="max-h-[560px] overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Employee ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Email
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Department
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp, idx) => {
                      const isEditing = editingId === emp.id
                      const baseBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'

                      return (
                        <tr
                          key={emp.id}
                          className={`${isEditing ? 'bg-indigo-50' : baseBg} transition-colors hover:bg-slate-100`}
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                            {emp.employee_id}
                          </td>
                          <td className="px-4 py-3 text-slate-900">{emp.full_name}</td>
                          <td className="px-4 py-3 text-slate-700">{emp.email}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{emp.department}</td>
                          <td className="whitespace-nowrap px-4 py-3 text-slate-700">{emp.date_of_joining}</td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => onEdit(emp)}
                                aria-label={`Edit ${emp.full_name}`}
                                title="Edit"
                              >
                                <IconEdit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="danger"
                                size="icon"
                                onClick={() => onDelete(emp.id)}
                                aria-label={`Delete ${emp.full_name}`}
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
        </Card>
      </div>
    </div>
  )
}
