import React, { useEffect, useState } from 'react'
import { useCreateQuizHook } from '@/hooks/course.hook'

/* ─── helpers ────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 8)

const makeOption = () => ({ id: uid(), text: '' })
const makeQuestion = () => ({
  _key: uid(),
  question_text: '',
  options: [makeOption(), makeOption(), makeOption(), makeOption()],
  correct_answer_id: '',
  marks: 1,
})

const INITIAL_META = {
  title: '',
  description: '',
  time_limit: 10,
  total_marks: '',
  order_index: '',
}

/* ─── icons ──────────────────────────────────────────────────────── */
const PlusIcon = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
    <line x1='12' y1='5' x2='12' y2='19' /><line x1='5' y1='12' x2='19' y2='12' />
  </svg>
)
const TrashIcon = () => (
  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <polyline points='3 6 5 6 21 6' /><path d='M19 6l-1 14H6L5 6' />
    <path d='M10 11v6' /><path d='M14 11v6' /><path d='M9 6V4h6v2' />
  </svg>
)
const XIcon = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <line x1='18' y1='6' x2='6' y2='18' /><line x1='6' y1='6' x2='18' y2='18' />
  </svg>
)
const CheckIcon = () => (
  <svg width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5'>
    <polyline points='20 6 9 17 4 12' />
  </svg>
)
const QuizIcon = () => (
  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
    <circle cx='12' cy='12' r='10' />
    <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
    <line x1='12' y1='17' x2='12.01' y2='17' strokeWidth='3' strokeLinecap='round' />
  </svg>
)

/* ══════════════════════════════════════════════════════════════════ */
const InstructorQuizCreationForm = ({ courseId, moduleId, onCreated, onCancel, defaultOrderIndex = '' }) => {
  const { mutate: createQuiz } = useCreateQuizHook()
  const [meta, setMeta] = useState(INITIAL_META)
  const [questions, setQuestions] = useState([makeQuestion()])
  const [activeQ, setActiveQ] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setMeta((prev) => ({
      ...prev,
      order_index: defaultOrderIndex ? String(defaultOrderIndex) : '',
    }))
    setErrors({})
  }, [moduleId, defaultOrderIndex])

  /* ── question helpers ── */
  const updateQuestion = (qi, patch) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)))

  const updateOption = (qi, oi, text) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i !== qi ? q : { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, text } : o)) }
      )
    )

  const addOption = (qi) =>
    setQuestions((prev) =>
      prev.map((q, i) => (i !== qi ? q : { ...q, options: [...q.options, makeOption()] }))
    )

  const removeOption = (qi, oi) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q
        const opts = q.options.filter((_, j) => j !== oi)
        return {
          ...q,
          options: opts,
          correct_answer_id: q.correct_answer_id === q.options[oi]?.id ? '' : q.correct_answer_id,
        }
      })
    )

  const addQuestion = () => {
    const q = makeQuestion()
    setQuestions((prev) => [...prev, q])
    setActiveQ(questions.length)
  }

  const removeQuestion = (qi) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qi))
    setActiveQ((prev) => Math.max(0, Math.min(prev, questions.length - 2)))
  }

  /* ── validation ── */
  const validate = () => {
    const e = {}
    if (!meta.title.trim())       e.title = 'Quiz title is required'
    if (!meta.order_index)        e.order_index = 'Order # is required'
    if (!meta.total_marks)        e.total_marks = 'Total marks is required'
    questions.forEach((q, i) => {
      if (!q.question_text.trim()) e[`q_${i}_text`] = 'Question text required'
      if (!q.correct_answer_id)    e[`q_${i}_ans`]  = 'Select correct answer'
      q.options.forEach((o, oi) => {
        if (!o.text.trim()) e[`q_${i}_o_${oi}`] = 'Option text required'
      })
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── submit ── */
  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      course_id: courseId,
      module_id: moduleId,
      title: meta.title.trim(),
      description: meta.description.trim(),
      time_limit: Number(meta.time_limit),
      total_marks: Number(meta.total_marks),
      order_index: Number(meta.order_index),
      questions: questions.map(({ _key, ...q }) => ({
        question_text: q.question_text,
        options: q.options.map((o) => ({ id: o.id, text: o.text })),
        correct_answer_id: q.correct_answer_id,
        marks: Number(q.marks),
      })),
    }

    console.log('Quiz payload:', JSON.stringify(payload, null, 2))

    setSubmitting(true)
    createQuiz(
      { moduleId, payload },
      {
        onSuccess: async () => {
          await onCreated?.(payload)
        },
        onError: (err) => {
          console.error(err)
          const status = err?.response?.status
          const message = err?.response?.data?.message || 'Failed to create quiz'
          if (status === 409) {
            setErrors((prev) => ({ ...prev, order_index: message }))
          }
        },
        onSettled: () => {
          setSubmitting(false)
        },
      }
    )
  }

  const autoTotalMarks = questions.reduce((s, q) => s + Number(q.marks || 0), 0)

  /* ══════════════════════════════════════════════════════════════ */
  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <style>{`
          @keyframes qz-in { from { opacity:0; transform:scale(.97) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
          .qz-input:focus { outline:none; border-color:#6366f1 !important; }
          .qz-input::placeholder { color:#3a3d55; }
          .qz-opt-btn:hover { background: rgba(99,102,241,.12) !important; }
          .qz-q-tab:hover { background: #1a1d2e !important; }
          .qz-del:hover { color:#ef4444 !important; }
          select.qz-input option { background:#161929; color:#e2e4ed; }
        `}</style>

        {/* ── modal header ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.headerIcon}><QuizIcon /></span>
            <div>
              <p style={s.headerSub}>New Quiz</p>
              <p style={s.headerTitle}>{meta.title || 'Untitled Quiz'}</p>
            </div>
          </div>
          <button style={s.closeBtn} onClick={onCancel}><XIcon /></button>
        </div>

        <form onSubmit={onSubmit} style={s.body}>
          <div style={s.cols}>

            {/* ════ LEFT — quiz meta + question tabs ════ */}
            <div style={s.leftPanel}>

              {/* meta fields */}
              <div style={s.metaSection}>
                <p style={s.sectionLabel}>Quiz Details</p>

                <div style={s.field}>
                  <label style={s.lbl}>Title *</label>
                  <input
                    className='qz-input'
                    style={{ ...s.inp, ...(errors.title ? s.inputErr : {}) }}
                    value={meta.title}
                    onChange={(e) => setMeta((p) => ({ ...p, title: e.target.value }))}
                    placeholder='e.g. JavaScript Fundamentals Quiz'
                  />
                  {errors.title && <p style={s.err}>{errors.title}</p>}
                </div>

                <div style={s.field}>
                  <label style={s.lbl}>Description</label>
                  <textarea
                    className='qz-input'
                    style={{ ...s.inp, height: 60, resize: 'vertical' }}
                    value={meta.description}
                    onChange={(e) => setMeta((p) => ({ ...p, description: e.target.value }))}
                    placeholder='What does this quiz cover?'
                  />
                </div>

                <div style={s.row3}>
                  <div style={s.field}>
                    <label style={s.lbl}>Order # *</label>
                    <input
                      className='qz-input'
                      style={{ ...s.inp, ...(errors.order_index ? s.inputErr : {}) }}
                      type='number'
                      value={meta.order_index}
                      onChange={(e) => {
                        const value = e.target.value
                        setMeta((p) => ({ ...p, order_index: value }))
                        setErrors((prev) => ({ ...prev, order_index: undefined }))
                      }}
                      placeholder='e.g. 3'
                      min='1'
                    />
                    {errors.order_index && <p style={s.err}>{errors.order_index}</p>}
                  </div>
                  <div style={s.field}>
                    <label style={s.lbl}>Time (min)</label>
                    <input
                      className='qz-input'
                      style={s.inp}
                      type='number'
                      value={meta.time_limit}
                      onChange={(e) => setMeta((p) => ({ ...p, time_limit: e.target.value }))}
                      min='1'
                    />
                  </div>
                  <div style={s.field}>
                    <label style={s.lbl}>Total Marks *</label>
                    <input
                      className='qz-input'
                      style={{ ...s.inp, ...(errors.total_marks ? s.inputErr : {}) }}
                      type='number'
                      value={meta.total_marks}
                      onChange={(e) => setMeta((p) => ({ ...p, total_marks: e.target.value }))}
                      placeholder={String(autoTotalMarks)}
                      min='1'
                    />
                    {errors.total_marks && <p style={s.err}>{errors.total_marks}</p>}
                  </div>
                </div>

                {/* auto-total hint */}
                <p style={s.hint}>
                  Sum of question marks: <strong style={{ color: '#6366f1' }}>{autoTotalMarks}</strong>
                </p>
              </div>

              {/* question tabs */}
              <div style={s.qtabSection}>
                <p style={s.sectionLabel}>Questions ({questions.length})</p>
                <div style={s.qtabList}>
                  {questions.map((q, i) => {
                    const hasErr = errors[`q_${i}_text`] || errors[`q_${i}_ans`]
                    const isActive = activeQ === i
                    return (
                      <button
                        key={q._key}
                        type='button'
                        className='qz-q-tab'
                        onClick={() => setActiveQ(i)}
                        style={{
                          ...s.qtab,
                          ...(isActive ? s.qtabActive : {}),
                          ...(hasErr ? s.qtabErr : {}),
                        }}
                      >
                        <span style={s.qtabNum}>Q{i + 1}</span>
                        <span style={s.qtabPreview}>
                          {q.question_text ? q.question_text.slice(0, 28) + (q.question_text.length > 28 ? '…' : '') : 'Untitled question'}
                        </span>
                        {questions.length > 1 && (
                          <span
                            className='qz-del'
                            style={s.qtabDel}
                            onClick={(e) => { e.stopPropagation(); removeQuestion(i) }}
                            title='Remove question'
                          >
                            <XIcon />
                          </span>
                        )}
                      </button>
                    )
                  })}
                  <button type='button' style={s.addQBtn} onClick={addQuestion}>
                    <PlusIcon /> Add question
                  </button>
                </div>
              </div>
            </div>

            {/* ════ RIGHT — active question editor ════ */}
            <div style={s.rightPanel}>
              {questions[activeQ] && (() => {
                const q = questions[activeQ]
                const qi = activeQ
                return (
                  <div key={q._key} style={{ animation: 'qz-in .2s ease' }}>
                    <div style={s.qHeader}>
                      <span style={s.qNum}>Question {qi + 1}</span>
                      <div style={s.field}>
                        <label style={s.lbl}>Marks</label>
                        <input
                          className='qz-input'
                          style={{ ...s.inp, width: 72, textAlign: 'center' }}
                          type='number'
                          value={q.marks}
                          min='1'
                          onChange={(e) => updateQuestion(qi, { marks: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* question text */}
                    <div style={{ ...s.field, marginBottom: 20 }}>
                      <label style={s.lbl}>Question *</label>
                      <textarea
                        className='qz-input'
                        style={{
                          ...s.inp,
                          height: 80,
                          resize: 'vertical',
                          fontSize: 14,
                          ...(errors[`q_${qi}_text`] ? s.inputErr : {}),
                        }}
                        value={q.question_text}
                        onChange={(e) => updateQuestion(qi, { question_text: e.target.value })}
                        placeholder='Type your question here…'
                        autoFocus
                      />
                      {errors[`q_${qi}_text`] && <p style={s.err}>{errors[`q_${qi}_text`]}</p>}
                    </div>

                    {/* options */}
                    <div style={s.field}>
                      <div style={s.optHeader}>
                        <label style={s.lbl}>Answer Options *</label>
                        <span style={s.optHint}>Click the circle to mark correct answer</span>
                      </div>
                      {errors[`q_${qi}_ans`] && <p style={{ ...s.err, marginBottom: 8 }}>{errors[`q_${qi}_ans`]}</p>}

                      <div style={s.optList}>
                        {q.options.map((opt, oi) => {
                          const isCorrect = q.correct_answer_id === opt.id
                          return (
                            <div
                              key={opt.id}
                              style={{
                                ...s.optRow,
                                ...(isCorrect ? s.optRowCorrect : {}),
                              }}
                            >
                              {/* correct toggle */}
                              <button
                                type='button'
                                className='qz-opt-btn'
                                title='Mark as correct'
                                onClick={() => updateQuestion(qi, { correct_answer_id: opt.id })}
                                style={{
                                  ...s.optCircle,
                                  ...(isCorrect ? s.optCircleCorrect : {}),
                                }}
                              >
                                {isCorrect && <CheckIcon />}
                              </button>

                              {/* option letter */}
                              <span style={s.optLetter}>
                                {String.fromCharCode(65 + oi)}
                              </span>

                              {/* option text */}
                              <input
                                className='qz-input'
                                style={{
                                  ...s.optInput,
                                  ...(errors[`q_${qi}_o_${oi}`] ? s.inputErr : {}),
                                }}
                                value={opt.text}
                                onChange={(e) => updateOption(qi, oi, e.target.value)}
                                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                              />

                              {/* delete option */}
                              {q.options.length > 2 && (
                                <button
                                  type='button'
                                  className='qz-del'
                                  style={s.optDel}
                                  onClick={() => removeOption(qi, oi)}
                                  title='Remove option'
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {q.options.length < 6 && (
                        <button type='button' style={s.addOptBtn} onClick={() => addOption(qi)}>
                          <PlusIcon /> Add option
                        </button>
                      )}
                    </div>

                    {/* correct answer summary */}
                    {q.correct_answer_id && (
                      <div style={s.answerSummary}>
                        <CheckIcon />
                        <span>
                          Correct: <strong>
                            {(() => {
                              const oi = q.options.findIndex((o) => o.id === q.correct_answer_id)
                              return oi >= 0 ? `${String.fromCharCode(65 + oi)}. ${q.options[oi].text}` : '—'
                            })()}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

          </div>

          {/* ── footer ── */}
          <div style={s.footer}>
            <div style={s.footerLeft}>
              <span style={s.footerStat}>{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
              <span style={s.footerDot}>·</span>
              <span style={s.footerStat}>{autoTotalMarks} marks total</span>
              {meta.time_limit && (
                <>
                  <span style={s.footerDot}>·</span>
                  <span style={s.footerStat}>{meta.time_limit} min</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type='button' style={s.btnCancel} onClick={onCancel}>Cancel</button>
              <button type='submit' disabled={submitting} style={s.btnSubmit}>
                {submitting ? 'Creating…' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  )
}

/* ─── styles ─────────────────────────────────────────────────────── */
const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(5,6,12,.85)',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 980,
    maxHeight: '92vh',
    background: '#0d0f14',
    border: '1px solid #1e2130',
    borderRadius: 16,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 32px 80px rgba(0,0,0,.7)',
    animation: 'qz-in .25s ease',
    fontFamily: "'DM Sans', sans-serif",
    color: '#e2e4ed',
  },

  /* header */
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #1e2130',
    background: '#111420',
    flexShrink: 0,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon: {
    width: 36, height: 36,
    borderRadius: 8,
    background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff',
  },
  headerSub: { fontSize: 10, color: '#6366f1', letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" },
  headerTitle: { fontSize: 15, fontWeight: 600, color: '#f0f1f8', marginTop: 1 },
  closeBtn: {
    width: 32, height: 32,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: '1px solid #1e2130',
    borderRadius: 8, color: '#6b7280', cursor: 'pointer',
  },

  /* body */
  body: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' },
  cols: { display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, overflow: 'hidden' },

  /* left panel */
  leftPanel: {
    borderRight: '1px solid #1e2130',
    background: '#111420',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  metaSection: { padding: '18px 16px', borderBottom: '1px solid #1e2130' },
  qtabSection: { padding: '14px 0 8px', flex: 1 },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 12,
    paddingLeft: 16,
    fontFamily: "'JetBrains Mono',monospace",
  },

  /* question tabs */
  qtabList: { display: 'flex', flexDirection: 'column', gap: 2, padding: '0 8px' },
  qtab: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 10px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'left',
    color: '#8b8fa8',
    transition: 'background .12s',
  },
  qtabActive: {
    background: '#161929 !important',
    border: '1px solid #2a2d45',
    color: '#e2e4ed',
  },
  qtabErr: { border: '1px solid rgba(239,68,68,.4)' },
  qtabNum: {
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 10,
    color: '#6366f1',
    minWidth: 22,
  },
  qtabPreview: { flex: 1, fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
  qtabDel: {
    color: '#3a3d55',
    display: 'flex', alignItems: 'center',
    padding: '2px',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'color .12s',
    background: 'none',
    border: 'none',
  },
  addQBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    margin: '8px 0 0',
    padding: '9px 10px',
    background: 'transparent',
    border: '1.5px dashed #2a2d45',
    borderRadius: 8,
    color: '#6366f1',
    fontSize: 12,
    cursor: 'pointer',
    width: '100%',
  },

  /* right panel */
  rightPanel: {
    padding: '24px 28px',
    overflowY: 'auto',
    background: '#0d0f14',
  },
  qHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  qNum: {
    fontSize: 12,
    letterSpacing: '.08em',
    textTransform: 'uppercase',
    color: '#6b7280',
    fontFamily: "'JetBrains Mono',monospace",
  },

  /* options */
  optHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  optHint: { fontSize: 11, color: '#3a3d55' },
  optList: { display: 'flex', flexDirection: 'column', gap: 8 },
  optRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px',
    background: '#111420',
    border: '1px solid #1e2130',
    borderRadius: 10,
    transition: 'border-color .12s, background .12s',
  },
  optRowCorrect: {
    background: 'rgba(34,197,94,.06)',
    border: '1px solid rgba(34,197,94,.35)',
  },
  optCircle: {
    width: 26, height: 26, flexShrink: 0,
    borderRadius: '50%',
    border: '2px solid #2a2d45',
    background: 'transparent',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    color: 'transparent',
    transition: 'border-color .12s, background .12s',
  },
  optCircleCorrect: {
    background: '#22c55e',
    border: '2px solid #22c55e',
    color: '#fff',
  },
  optLetter: {
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 11,
    color: '#6366f1',
    minWidth: 16,
  },
  optInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#e2e4ed',
    fontSize: 13,
    fontFamily: "'DM Sans',sans-serif",
    outline: 'none',
  },
  optDel: {
    background: 'none', border: 'none',
    color: '#3a3d55',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    transition: 'color .12s',
    padding: 2,
  },
  addOptBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    marginTop: 8,
    padding: '7px 12px',
    background: 'transparent',
    border: '1.5px dashed #2a2d45',
    borderRadius: 8,
    color: '#6366f1',
    fontSize: 12,
    cursor: 'pointer',
  },
  answerSummary: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginTop: 16,
    padding: '8px 12px',
    background: 'rgba(34,197,94,.06)',
    border: '1px solid rgba(34,197,94,.2)',
    borderRadius: 8,
    fontSize: 12,
    color: '#86efac',
  },

  /* footer */
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px',
    borderTop: '1px solid #1e2130',
    background: '#111420',
    flexShrink: 0,
  },
  footerLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  footerStat: { fontSize: 12, color: '#6b7280' },
  footerDot: { color: '#2a2d45', fontSize: 16 },

  /* shared */
  field: { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 },
  lbl: { fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: '#6b7280' },
  inp: {
    width: '100%',
    background: '#0d0f14',
    border: '1px solid #1e2130',
    borderRadius: 8,
    padding: '8px 10px',
    color: '#e2e4ed',
    fontSize: 13,
    fontFamily: "'DM Sans',sans-serif",
    transition: 'border-color .15s',
  },
  inputErr: { borderColor: 'rgba(239,68,68,.5) !important' },
  err: { fontSize: 11, color: '#f87171', marginTop: 2 },
  hint: { fontSize: 11, color: '#3a3d55', marginTop: -6 },
  row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 },
  btnCancel: {
    padding: '9px 16px',
    background: 'transparent',
    border: '1px solid #1e2130',
    borderRadius: 8,
    color: '#6b7280', fontSize: 13, cursor: 'pointer',
  },
  btnSubmit: {
    padding: '9px 22px',
    background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
    border: 'none',
    borderRadius: 8,
    color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(99,102,241,.35)',
  },
}

export default InstructorQuizCreationForm