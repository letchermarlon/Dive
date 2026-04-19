'use client'
import { useState } from 'react'

interface Summary {
  id: string
  content: string
  taskCount: number
  createdAt: string
}

const SECTION_KEYS = ['OVERVIEW', 'WHAT WAS ACCOMPLISHED', 'TEAM CONTRIBUTIONS', 'HIGHLIGHTS', 'SUBMITTED'] as const
type SectionKey = typeof SECTION_KEYS[number]

const SECTION_ICONS: Record<SectionKey, string> = {
  'OVERVIEW': '📋',
  'WHAT WAS ACCOMPLISHED': '✅',
  'TEAM CONTRIBUTIONS': '👥',
  'HIGHLIGHTS': '🌟',
  'SUBMITTED': '🕐',
}

const SECTION_COLORS: Record<SectionKey, string> = {
  'OVERVIEW': '#bbe1fa',
  'WHAT WAS ACCOMPLISHED': '#7ef0a0',
  'TEAM CONTRIBUTIONS': '#3282b8',
  'HIGHLIGHTS': '#f0d060',
  'SUBMITTED': 'rgba(187,225,250,0.4)',
}

function parseSections(content: string): { key: SectionKey; text: string }[] {
  const result: { key: SectionKey; text: string }[] = []
  let remaining = content

  for (let i = 0; i < SECTION_KEYS.length; i++) {
    const key = SECTION_KEYS[i]
    const nextKey = SECTION_KEYS[i + 1]
    const start = remaining.indexOf(key)
    if (start === -1) continue
    const afterHeader = remaining.slice(start + key.length).trimStart()
    const end = nextKey ? afterHeader.indexOf(nextKey) : -1
    const text = end === -1 ? afterHeader.trim() : afterHeader.slice(0, end).trim()
    result.push({ key, text })
    remaining = end === -1 ? '' : afterHeader.slice(end)
  }

  return result
}

function previewText(content: string) {
  // Show first non-empty paragraph after OVERVIEW
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const overviewIdx = lines.findIndex(l => l === 'OVERVIEW')
  if (overviewIdx !== -1 && lines[overviewIdx + 1]) {
    const text = lines[overviewIdx + 1]
    return text.length > 160 ? text.slice(0, 157) + '…' : text
  }
  const first = lines.find(l => !SECTION_KEYS.includes(l as SectionKey) && l.length > 20)
  return first ? (first.length > 160 ? first.slice(0, 157) + '…' : first) : ''
}

export default function SummariesClient({ summaries }: { summaries: Summary[] }) {
  const [selected, setSelected] = useState<Summary | null>(null)

  const sections = selected ? parseSections(selected.content) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        borderBottom: '1px solid rgba(187,225,250,0.12)',
        background: 'rgba(13,31,38,0.7)',
        backdropFilter: 'blur(8px)',
        padding: '14px 28px',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 600, fontSize: 17, color: '#bbe1fa' }}>Summaries</div>
        <div style={{ fontSize: 12, color: 'rgba(187,225,250,0.5)', marginTop: 2 }}>
          AI-generated completion records · click any entry to read in full
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {summaries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(187,225,250,0.3)', fontSize: 14 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌊</div>
            <p>No summaries yet.</p>
            <p style={{ fontSize: 12, marginTop: 6 }}>Submit your Done cards on the Board to generate one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 760 }}>
            {summaries.map(s => {
              const date = new Date(s.createdAt).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              })
              const time = new Date(s.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              })
              const preview = previewText(s.content)

              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  style={{
                    background: 'rgba(15,76,117,0.25)',
                    border: '1px solid rgba(187,225,250,0.12)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    width: '100%',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(50,130,184,0.4)'
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,76,117,0.35)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(187,225,250,0.12)'
                    ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(15,76,117,0.25)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#7ef0a0', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      ✓ {s.taskCount} task{s.taskCount !== 1 ? 's' : ''} completed
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(187,225,250,0.4)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {date} · {time}
                    </span>
                  </div>
                  {preview && (
                    <p style={{ fontSize: 13, color: 'rgba(187,225,250,0.7)', lineHeight: 1.6, margin: 0 }}>
                      {preview}
                    </p>
                  )}
                  <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(50,130,184,0.8)', fontWeight: 600 }}>
                    Click to read full summary →
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            style={{
              background: 'linear-gradient(160deg, #0d1f26 0%, #0f2d38 100%)',
              border: '1px solid rgba(187,225,250,0.15)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 680,
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid rgba(187,225,250,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7ef0a0', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 4 }}>
                  ✓ {selected.taskCount} task{selected.taskCount !== 1 ? 's' : ''} completed
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#bbe1fa' }}>Completion Summary</div>
                <div style={{ fontSize: 11, color: 'rgba(187,225,250,0.4)', marginTop: 3 }}>
                  {new Date(selected.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'rgba(187,225,250,0.08)',
                  border: '1px solid rgba(187,225,250,0.12)',
                  borderRadius: 8,
                  color: 'rgba(187,225,250,0.6)',
                  cursor: 'pointer',
                  fontSize: 18,
                  lineHeight: 1,
                  padding: '4px 9px',
                  fontFamily: 'inherit',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal body — sections */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', scrollbarWidth: 'none' }}>
              {sections.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {sections.map(({ key, text }) => (
                    <div key={key}>
                      {/* Section header */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 10,
                        paddingBottom: 8,
                        borderBottom: '1px solid rgba(187,225,250,0.08)',
                      }}>
                        <span style={{ fontSize: 14 }}>{SECTION_ICONS[key]}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '1.2px',
                          textTransform: 'uppercase', color: SECTION_COLORS[key],
                        }}>
                          {key}
                        </span>
                      </div>

                      {/* Section content */}
                      {key === 'SUBMITTED' ? (
                        <div style={{ fontSize: 12, color: 'rgba(187,225,250,0.5)', fontStyle: 'italic' }}>
                          {text}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {text.split('\n').map((line, i) => {
                            const trimmed = line.trim()
                            if (!trimmed) return null
                            const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-')
                            return (
                              <div
                                key={i}
                                style={{
                                  fontSize: 13,
                                  color: isBullet ? '#bbe1fa' : 'rgba(187,225,250,0.8)',
                                  lineHeight: 1.65,
                                  paddingLeft: isBullet ? 0 : 0,
                                  display: 'flex',
                                  gap: isBullet ? 8 : 0,
                                }}
                              >
                                {isBullet && (
                                  <span style={{ color: SECTION_COLORS[key], flexShrink: 0, marginTop: 1 }}>
                                    {trimmed.startsWith('•') ? '•' : '–'}
                                  </span>
                                )}
                                <span>{isBullet ? trimmed.slice(1).trim() : trimmed}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                // Fallback: render raw content if parsing failed
                <div style={{ fontSize: 13, color: 'rgba(187,225,250,0.8)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {selected.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
