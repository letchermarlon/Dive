'use client'
import { useEffect, useRef, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { createSupabaseBrowserClient } from '@/lib/supabase'

type Status = 'todo' | 'doing' | 'done'

interface Task {
  id: string
  projectId: string
  title: string
  description: string
  status: Status
  members: string[]
}

interface Member {
  id: string
  name: string
}

interface Props {
  projectId: string
  projectName: string
  initialTasks: Task[]
  currentUserId: string
  members: Member[]
  memberNames: Record<string, string>
}

const COLS: { key: Status; label: string; color: string }[] = [
  { key: 'todo',  label: 'To Do',       color: '#bbe1fa' },
  { key: 'doing', label: 'In Progress', color: '#3282b8' },
  { key: 'done',  label: 'Done',        color: '#7ef0a0' },
]

function initials(name: string) {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

const AVATAR_COLORS = ['#3282b8', '#0f4c75', '#1b6ca8', '#0d6e6e', '#2d6a4f', '#6b3fa0']
function avatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % AVATAR_COLORS.length
  return AVATAR_COLORS[h]
}

export default function SprintBoardClient({ projectId, projectName, initialTasks, members, memberNames }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [addingTitle, setAddingTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalTitle, setModalTitle] = useState('')
  const [modalDesc, setModalDesc] = useState('')
  const [modalMembers, setModalMembers] = useState<string[]>([])
  const [submitError, setSubmitError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [savingModal, setSavingModal] = useState(false)
  const addInputRef = useRef<HTMLInputElement>(null)
  const supabase = createSupabaseBrowserClient()

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`board:${projectId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      }, payload => {
        if (payload.eventType === 'INSERT') {
          const t = payload.new
          const status = t.status as Status
          if (!['todo', 'doing', 'done'].includes(status)) return
          setTasks(prev => {
            if (prev.find(x => x.id === t.id)) return prev
            return [...prev, { id: t.id, projectId: t.project_id, title: t.title, description: t.description ?? '', status, members: t.members ?? [] }]
          })
        } else if (payload.eventType === 'UPDATE') {
          const t = payload.new
          const status = t.status as Status
          setTasks(prev => {
            if (!['todo', 'doing', 'done'].includes(status)) return prev.filter(x => x.id !== t.id)
            return prev.map(x => x.id === t.id ? { ...x, title: t.title, description: t.description ?? '', status, members: t.members ?? [] } : x)
          })
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(x => x.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, supabase])

  useEffect(() => {
    if (isAdding && addInputRef.current) addInputRef.current.focus()
  }, [isAdding])

  function byStatus(s: Status) {
    return tasks.filter(t => t.status === s)
  }

  async function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const taskId = result.draggableId
    const newStatus = result.destination.droppableId as Status
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  }

  async function handleAddCard(e: React.FormEvent) {
    e.preventDefault()
    const title = addingTitle.trim()
    if (!title) return
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, title }),
    })
    const data = await res.json()
    if (data.task) {
      setTasks(prev => {
        if (prev.find(x => x.id === data.task.id)) return prev
        return [...prev, { id: data.task.id, projectId, title: data.task.title, description: '', status: 'todo', members: [] }]
      })
    }
    setAddingTitle('')
    setIsAdding(false)
  }

  function openModal(task: Task) {
    setSelectedTask(task)
    setModalTitle(task.title)
    setModalDesc(task.description)
    setModalMembers(task.members)
  }

  function closeModal() {
    setSelectedTask(null)
    setSavingModal(false)
  }

  async function saveModal() {
    if (!selectedTask) return
    setSavingModal(true)
    await fetch(`/api/tasks/${selectedTask.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: modalTitle, description: modalDesc, members: modalMembers }),
    })
    setTasks(prev => prev.map(t => t.id === selectedTask.id
      ? { ...t, title: modalTitle, description: modalDesc, members: modalMembers }
      : t
    ))
    closeModal()
  }

  async function deleteTask(taskId: string) {
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setDeleteConfirmId(null)
  }

  function handleSubmitDone() {
    setSubmitError('')
    const doneTasks = tasks.filter(t => t.status === 'done')
    if (doneTasks.length === 0) { setSubmitError('There are no cards in Done to submit.'); return }
    const missing = doneTasks.filter(t => t.members.length === 0)
    if (missing.length > 0) {
      setSubmitError(`${missing.length} card${missing.length > 1 ? 's' : ''} in Done ${missing.length > 1 ? 'have' : 'has'} no team members. Please open each card and add members before submitting.`)
      return
    }
    setShowConfirm(true)
  }

  async function confirmSubmit() {
    setSubmitting(true)
    const res = await fetch(`/api/projects/${projectId}/submit-done`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberNames }),
    })
    const data = await res.json()
    if (data.error) {
      setSubmitError(data.error)
      setShowConfirm(false)
      setSubmitting(false)
      return
    }
    setTasks(prev => prev.filter(t => t.status !== 'done'))
    setShowConfirm(false)
    setSubmitting(false)
  }

  // ─── Styles ────────────────────────────────────────────────────────────────
  const S = {
    topbar: {
      borderBottom: '1px solid rgba(187,225,250,0.12)',
      background: 'rgba(13,31,38,0.7)',
      backdropFilter: 'blur(8px)',
    } as React.CSSProperties,
    col: {
      minWidth: 260,
      maxWidth: 260,
      background: 'rgba(10,20,30,0.4)',
      border: '1px solid rgba(187,225,250,0.12)',
      borderRadius: 12,
      padding: 14,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    card: {
      background: 'rgba(15,76,117,0.25)',
      border: '1px solid rgba(187,225,250,0.12)',
      borderRadius: 8,
      padding: '10px 12px',
      cursor: 'pointer',
      marginBottom: 8,
      position: 'relative' as const,
      transition: 'box-shadow 0.15s',
    },
    btn: (bg: string, fg = 'white') => ({
      background: bg, color: fg,
      border: 'none', borderRadius: 6,
      padding: '6px 14px', fontSize: 12,
      fontWeight: 600, cursor: 'pointer',
      fontFamily: 'inherit',
    } as React.CSSProperties),
    input: {
      width: '100%',
      background: 'rgba(0,0,0,0.3)',
      border: '1px solid rgba(187,225,250,0.2)',
      borderRadius: 6, padding: '8px 10px',
      color: '#bbe1fa', fontSize: 13,
      outline: 'none', fontFamily: 'inherit',
      resize: 'none' as const,
    },
    overlay: {
      position: 'fixed' as const, inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 50, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: 16,
    },
    modal: {
      background: '#0f2d38',
      border: '1px solid rgba(187,225,250,0.15)',
      borderRadius: 14,
      padding: 24,
      width: '100%',
      maxWidth: 460,
      maxHeight: '90vh',
      overflowY: 'auto' as const,
    },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{ ...S.topbar, padding: '14px 28px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 17, color: '#bbe1fa' }}>Board</div>
          <div style={{ fontSize: 12, color: 'rgba(187,225,250,0.5)', marginTop: 2 }}>
            {projectName} · {members.length} member{members.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Error banner */}
      {submitError && (
        <div style={{ background: 'rgba(180,80,80,0.2)', border: '1px solid rgba(180,80,80,0.4)', borderRadius: 8, margin: '12px 28px 0', padding: '10px 14px', color: '#f88', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{submitError}</span>
          <button onClick={() => setSubmitError('')} style={{ background: 'none', border: 'none', color: '#f88', cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Kanban */}
      <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div style={{ display: 'flex', gap: 14, padding: '20px 28px', height: '100%', alignItems: 'flex-start' }}>
            {COLS.map(col => {
              const colTasks = byStatus(col.key)
              return (
                <div key={col.key} style={S.col}>
                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1px', color: col.color, textTransform: 'uppercase' }}>
                      {col.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 7px', borderRadius: 99, background: 'rgba(15,76,117,0.25)', color: 'rgba(187,225,250,0.7)' }}>
                        {colTasks.length}
                      </span>
                      {col.key === 'done' && (
                        <button
                          onClick={handleSubmitDone}
                          style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(126,240,160,0.15)', border: '1px solid rgba(126,240,160,0.3)', color: '#7ef0a0', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                          Submit Done
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cards */}
                  <Droppable droppableId={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                          flex: 1, overflowY: 'auto', scrollbarWidth: 'none',
                          minHeight: 60,
                          background: snapshot.isDraggingOver ? 'rgba(50,130,184,0.07)' : 'transparent',
                          borderRadius: 8,
                          transition: 'background 0.15s',
                        }}
                      >
                        {colTasks.map((task, idx) => (
                          <Draggable key={task.id} draggableId={task.id} index={idx}>
                            {(prov, snap) => (
                              <div
                                ref={prov.innerRef}
                                {...prov.draggableProps}
                                {...prov.dragHandleProps}
                                style={{
                                  ...S.card,
                                  boxShadow: snap.isDragging ? '0 8px 24px rgba(0,0,0,0.4)' : '0 1px 4px rgba(0,0,0,0.15)',
                                  opacity: snap.isDragging ? 0.95 : 1,
                                  ...prov.draggableProps.style,
                                }}
                                onClick={() => openModal(task)}
                              >
                                {/* Delete button */}
                                <button
                                  onClick={e => { e.stopPropagation(); setDeleteConfirmId(task.id) }}
                                  style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: 'rgba(187,225,250,0.3)', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 2, borderRadius: 4 }}
                                  title="Delete card"
                                >
                                  ✕
                                </button>

                                <p style={{ fontSize: 12, fontWeight: 500, color: '#bbe1fa', lineHeight: 1.4, marginRight: 16 }}>
                                  {task.title}
                                </p>
                                {task.description && (
                                  <p style={{ fontSize: 11, color: 'rgba(187,225,250,0.5)', marginTop: 4, lineHeight: 1.4 }}>
                                    {task.description.length > 80 ? task.description.slice(0, 80) + '…' : task.description}
                                  </p>
                                )}

                                {/* Member avatars */}
                                {task.members.length > 0 && (
                                  <div style={{ display: 'flex', marginTop: 8, gap: 3 }}>
                                    {task.members.map(uid => {
                                      const name = memberNames[uid] ?? '?'
                                      return (
                                        <div
                                          key={uid}
                                          title={name}
                                          style={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            background: avatarColor(name),
                                            color: '#fff', fontSize: 9, fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: '1px solid rgba(187,225,250,0.2)',
                                            flexShrink: 0,
                                          }}
                                        >
                                          {initials(name)}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: 'rgba(187,225,250,0.25)' }}>
                            empty
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>

                  {/* Add card — only in To Do */}
                  {col.key === 'todo' && (
                    <div style={{ marginTop: 8, flexShrink: 0 }}>
                      {isAdding ? (
                        <form onSubmit={handleAddCard}>
                          <input
                            ref={addInputRef}
                            value={addingTitle}
                            onChange={e => setAddingTitle(e.target.value)}
                            placeholder="Card title…"
                            style={{ ...S.input, marginBottom: 6 }}
                            onKeyDown={e => { if (e.key === 'Escape') { setIsAdding(false); setAddingTitle('') } }}
                          />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button type="submit" style={S.btn('#3282b8')}>Add</button>
                            <button type="button" onClick={() => { setIsAdding(false); setAddingTitle('') }} style={S.btn('rgba(187,225,250,0.1)', 'rgba(187,225,250,0.6)')}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setIsAdding(true)}
                          style={{ width: '100%', background: 'none', border: '1px dashed rgba(187,225,250,0.2)', borderRadius: 6, padding: '7px 0', color: 'rgba(187,225,250,0.4)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                        >
                          + Add task
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* ── Card detail modal ── */}
      {selectedTask && (
        <div style={S.overlay} onClick={closeModal}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={{ marginBottom: 16 }}>
              <input
                value={modalTitle}
                onChange={e => setModalTitle(e.target.value)}
                style={{ ...S.input, fontSize: 15, fontWeight: 600 }}
                placeholder="Card title"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(187,225,250,0.5)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Description</div>
              <textarea
                value={modalDesc}
                onChange={e => setModalDesc(e.target.value)}
                style={{ ...S.input, minHeight: 80 }}
                placeholder="Add a description…"
                rows={3}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(187,225,250,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Members</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {members.map(m => {
                  const checked = modalMembers.includes(m.id)
                  return (
                    <label
                      key={m.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, background: checked ? 'rgba(50,130,184,0.15)' : 'transparent', border: `1px solid ${checked ? 'rgba(50,130,184,0.3)' : 'transparent'}`, transition: 'all 0.12s' }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setModalMembers(prev => checked ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                        style={{ accentColor: '#3282b8', width: 14, height: 14 }}
                      />
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: avatarColor(m.name), color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {initials(m.name)}
                      </div>
                      <span style={{ fontSize: 13, color: '#bbe1fa' }}>{m.name}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={S.btn('rgba(187,225,250,0.08)', 'rgba(187,225,250,0.6)')}>Cancel</button>
              <button onClick={saveModal} disabled={savingModal} style={S.btn('#3282b8')}>
                {savingModal ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteConfirmId && (
        <div style={S.overlay} onClick={() => setDeleteConfirmId(null)}>
          <div style={{ ...S.modal, maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <p style={{ color: '#bbe1fa', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Delete this card?</p>
            <p style={{ color: 'rgba(187,225,250,0.5)', fontSize: 13, marginBottom: 20 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirmId(null)} style={S.btn('rgba(187,225,250,0.08)', 'rgba(187,225,250,0.6)')}>Cancel</button>
              <button onClick={() => deleteTask(deleteConfirmId)} style={S.btn('rgba(180,80,80,0.8)')}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Done confirm modal ── */}
      {showConfirm && (
        <div style={S.overlay} onClick={() => !submitting && setShowConfirm(false)}>
          <div style={{ ...S.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <p style={{ color: '#bbe1fa', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Submit completed tasks?</p>
            <p style={{ color: 'rgba(187,225,250,0.5)', fontSize: 13, marginBottom: 6 }}>
              An AI summary will be saved to Summaries. Your ocean will grow for tasks you were on.
            </p>
            <p style={{ color: 'rgba(180,80,80,0.8)', fontSize: 12, marginBottom: 20 }}>
              Done entries will be discarded from the board.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowConfirm(false)} disabled={submitting} style={S.btn('rgba(187,225,250,0.08)', 'rgba(187,225,250,0.6)')}>Cancel</button>
              <button onClick={confirmSubmit} disabled={submitting} style={S.btn('#3282b8')}>
                {submitting ? 'Submitting…' : '🌊 Yes, submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
