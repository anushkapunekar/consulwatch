import { useState, useRef } from 'react'
import {
  Activity, AlertTriangle, CheckCircle, ChevronRight,
  MessageSquare, Shield, Star, TrendingUp, User, Zap,
  BarChart2, Clock, ThumbsUp, Info
} from 'lucide-react'

const SAMPLE_TRANSCRIPT = `HR Consultant (Ritu): Hello! Welcome to your JSO consultation session. I'm Ritu, your career consultant today. How are you feeling about your job search so far?

Candidate (Priya): Hi Ritu. Honestly, it's been quite exhausting. I've been applying for 3 months and barely getting any responses.

HR Consultant (Ritu): I understand that frustration. Let's look at your profile. So you have a BE in Computer Science... okay. What kind of roles are you targeting?

Candidate (Priya): I'm looking for backend developer roles, ideally in Python or Java. I have about 1.5 years of experience through projects and a short internship.

HR Consultant (Ritu): Hmm. The market is quite competitive right now. Have you considered taking some certifications? That usually helps.

Candidate (Priya): I've been thinking about it. Which certifications do you recommend for backend development?

HR Consultant (Ritu): There are many options. AWS, Google Cloud, various Python certifications. You should research what companies in your target area are looking for.

Candidate (Priya): Okay... I was hoping you could give me more specific guidance on which ones would actually help versus which ones are just expensive and not worth it.

HR Consultant (Ritu): It depends on the company. Every company is different. Are you open to relocating?

Candidate (Priya): Yes, I am open to Pune, Bangalore, or remote roles. Can we talk about how to improve my resume? I feel like that might be the issue.

HR Consultant (Ritu): Your resume looks okay. Standard format. You might want to add more keywords. Let me check the time... we have about 5 minutes left.

Candidate (Priya): Oh, already? I still had questions about salary negotiation and how to prepare for technical interviews.

HR Consultant (Ritu): Those are important topics. Maybe we can schedule a follow-up. For now, just keep applying and stay positive. The right opportunity will come.

Candidate (Priya): Alright... thank you.`

const SYSTEM_PROMPT = `You are JSO ConsultWatch, an expert HR consultation quality analysis AI for the JSO career platform.

Analyze the provided HR consultation transcript and return ONLY a valid JSON object (no markdown, no preamble, no backticks) with this exact structure:

{
  "overallScore": 0,
  "dimensions": {
    "candidateEngagement": { "score": 0, "label": "Low", "insight": "insight here" },
    "toneAndProfessionalism": { "score": 0, "label": "Fair", "insight": "insight here" },
    "contentRelevance": { "score": 0, "label": "Medium", "insight": "insight here" }
  },
  "flags": [
    { "severity": "medium", "type": "flag type", "description": "description" }
  ],
  "highlights": ["highlight 1", "highlight 2"],
  "recommendations": [
    { "priority": "high", "action": "action title", "detail": "detail here" }
  ],
  "candidateExperience": "description here",
  "consultantTrend": "needs_attention",
  "sessionSummary": "summary here"
}

Replace all values with your actual analysis. Be rigorous, fair, and specific. Base all scores on evidence from the transcript only.`

function ScoreRing({ score, size = 120, color }) {
  const r = (size / 2) - 10
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const c = color || (score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444')
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="8"
        strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
    </svg>
  )
}

function MiniBar({ value, color }) {
  const c = color || (value >= 75 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444')
  return (
    <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, background: c, borderRadius: 3, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
    </div>
  )
}

function Badge({ severity }) {
  const map = {
    high: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444', label: 'HIGH' },
    medium: { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', label: 'MED' },
    low: { bg: 'rgba(107,114,128,0.2)', color: '#9CA3AF', label: 'LOW' }
  }
  const s = map[severity] || map.low
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 10, fontWeight: 700,
      padding: '2px 7px', borderRadius: 4, letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
      {s.label}
    </span>
  )
}

function PriorityDot({ priority }) {
  const c = priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#6B7280'
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', marginRight: 8, flexShrink: 0 }} />
}

export default function App() {
  const [apiKey, setApiKey] = useState('')
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyVisible, setKeyVisible] = useState(false)
  const resultsRef = useRef(null)

  function loadSample() {
    setTranscript(SAMPLE_TRANSCRIPT)
    setResult(null)
    setError('')
  }

  async function analyze() {
    if (!apiKey.trim()) { setError('Please enter your Groq API key.'); return }
    if (!transcript.trim()) { setError('Please enter a consultation transcript.'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          max_tokens: 2000,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `Analyze this HR consultation transcript:\n\n${transcript}` }
          ]
        })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const text = data.choices[0].message.content
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch (e) {
      setError('Analysis failed: ' + e.message)
    }
    setLoading(false)
  }

  const scoreColor = (s) => s >= 75 ? '#10B981' : s >= 50 ? '#F59E0B' : '#EF4444'
  const scoreLabel = (s) => s >= 75 ? 'Good' : s >= 50 ? 'Fair' : 'Poor'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', fontFamily: 'var(--font)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', background: 'rgba(15,32,64,0.9)',
        backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100, padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1B4FD8, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={18} color="white" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
                JSO <span style={{ color: 'var(--cyan)' }}>ConsultWatch</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.06em', marginTop: -1 }}>HR CONSULTATION MONITORING AGENT</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', animation: 'pulse-ring 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#10B981', fontFamily: 'var(--mono)' }}>AGENT ONLINE</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px' }}>
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <Zap size={12} color="var(--cyan)" />
            <span style={{ fontSize: 12, color: 'var(--cyan)', fontWeight: 600, letterSpacing: '0.04em' }}>
              Powered by Groq · LLaMA 3.3 70B · Free API
            </span>
          </div>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 16 }}>
            Real-time quality intelligence<br />
            <span style={{ color: 'var(--cyan)' }}>for every consultation.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--text2)', maxWidth: 560, lineHeight: 1.7 }}>
            Paste any HR consultation transcript. The ConsultWatch Agent analyzes tone, engagement, and professionalism — delivering a comprehensive quality report in seconds.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MessageSquare size={15} color="var(--cyan)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Consultation Transcript</span>
              </div>
              <button onClick={loadSample} style={{ fontSize: 11, color: 'var(--cyan)',
                background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                Load Sample
              </button>
            </div>
            <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
              placeholder="Paste your HR consultation transcript here, or click Load Sample above..."
              style={{ width: '100%', minHeight: 340, background: 'transparent', border: 'none',
                color: 'var(--text2)', fontFamily: 'var(--mono)', fontSize: 12.5,
                lineHeight: 1.7, padding: '20px', resize: 'vertical', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Shield size={14} color="var(--cyan)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>API Configuration</span>
              </div>
              <label style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                GROQ API KEY (FREE)
              </label>
              <div style={{ position: 'relative' }}>
                <input type={keyVisible ? 'text' : 'password'} value={apiKey}
                  onChange={e => setApiKey(e.target.value)} placeholder="gsk_..."
                  style={{ width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '10px 36px 10px 12px', color: 'var(--text)',
                    fontFamily: 'var(--mono)', fontSize: 12, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--cyan)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                <button onClick={() => setKeyVisible(v => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 11 }}>
                  {keyVisible ? 'hide' : 'show'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8, lineHeight: 1.5 }}>
                Get free key at <span style={{ color: 'var(--cyan)' }}>console.groq.com</span>. Never stored.
              </p>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(27,79,216,0.15), rgba(6,182,212,0.1))',
              border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, padding: '20px' }}>
              <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: 12 }}>ANALYSIS PIPELINE</div>
              {[
                { icon: <Zap size={12} />, label: 'Model', val: 'LLaMA 3.3 70B' },
                { icon: <BarChart2 size={12} />, label: 'Dimensions', val: '3 quality axes' },
                { icon: <Clock size={12} />, label: 'Speed', val: '~3 seconds' },
              ].map(({ icon, label, val }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text3)', fontSize: 12 }}>{icon} {label}</div>
                  <span style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--mono)' }}>{val}</span>
                </div>
              ))}
            </div>

            <button onClick={analyze} disabled={loading}
              style={{ background: loading ? 'var(--surface2)' : 'linear-gradient(135deg, #1B4FD8, #06B6D4)',
                border: 'none', borderRadius: 12, padding: '16px 24px', color: 'white',
                fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : '0 8px 24px rgba(27,79,216,0.4)', transition: 'all 0.2s' }}>
              {loading
                ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Analyzing...</>
                : <><Activity size={16} /> Analyze Session</>}
            </button>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>
                <AlertTriangle size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                {error}
              </div>
            )}
          </div>
        </div>

        {result && (
          <div ref={resultsRef} style={{ marginTop: 48 }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '32px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ScoreRing score={result.overallScore} size={140} color={scoreColor(result.overallScore)} />
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 36, fontWeight: 800, color: scoreColor(result.overallScore), lineHeight: 1 }}>{result.overallScore}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.08em' }}>/ 100</div>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 700 }}>Session Quality Score</span>
                  <span style={{ background: scoreColor(result.overallScore) + '22', color: scoreColor(result.overallScore), fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100 }}>{scoreLabel(result.overallScore)}</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>{result.sessionSummary}</p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
                    <TrendingUp size={14} color={result.consultantTrend === 'improving' ? '#10B981' : result.consultantTrend === 'stable' ? '#F59E0B' : '#EF4444'} />
                    Trend: <span style={{ color: result.consultantTrend === 'improving' ? '#10B981' : result.consultantTrend === 'stable' ? '#F59E0B' : '#EF4444', fontWeight: 600 }}>{result.consultantTrend.replace('_', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
                    <AlertTriangle size={14} color="#F59E0B" />
                    {result.flags.length} flag{result.flags.length !== 1 ? 's' : ''} detected
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              {[
                { key: 'candidateEngagement', label: 'Candidate Engagement', icon: <User size={15} /> },
                { key: 'toneAndProfessionalism', label: 'Tone & Professionalism', icon: <Star size={15} /> },
                { key: 'contentRelevance', label: 'Content Relevance', icon: <BarChart2 size={15} /> }
              ].map(({ key, label, icon }) => {
                const d = result.dimensions[key]
                const c = scoreColor(d.score)
                return (
                  <div key={key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: 13 }}>{icon} {label}</div>
                      <span style={{ background: c + '22', color: c, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, fontFamily: 'var(--mono)' }}>{d.label}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--display)', fontSize: 40, fontWeight: 800, color: c, marginBottom: 8 }}>{d.score}</div>
                    <MiniBar value={d.score} color={c} />
                    <p style={{ fontSize: 12.5, color: 'var(--text2)', marginTop: 12, lineHeight: 1.6 }}>{d.insight}</p>
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertTriangle size={15} color="#F59E0B" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Session Flags</span>
                  <span style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, fontFamily: 'var(--mono)' }}>{result.flags.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.flags.length === 0
                    ? <div style={{ fontSize: 13, color: 'var(--text3)' }}>No flags detected.</div>
                    : result.flags.map((f, i) => (
                      <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 14px',
                        borderLeft: `3px solid ${f.severity === 'high' ? '#EF4444' : f.severity === 'medium' ? '#F59E0B' : '#6B7280'}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <Badge severity={f.severity} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{f.type}</span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{f.description}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <ChevronRight size={15} color="var(--cyan)" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Recommendations</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.recommendations.map((r, i) => (
                    <div key={i} style={{ background: 'var(--surface2)', borderRadius: 10, padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <PriorityDot priority={r.priority} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.action}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{r.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <ThumbsUp size={15} color="#10B981" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Session Highlights</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {result.highlights.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <CheckCircle size={14} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <User size={15} color="var(--cyan)" />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Candidate Experience</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{result.candidateExperience}</p>
              </div>
            </div>

            <div style={{ marginTop: 20, padding: '14px 20px',
              background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
              borderRadius: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Info size={14} color="var(--cyan)" style={{ marginTop: 1, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: 'var(--text3)', lineHeight: 1.6 }}>
                AI-generated by JSO ConsultWatch Agent · LLaMA 3.3 70B via Groq. Scores based solely on the provided transcript. No automated actions taken without human admin review. Built by <strong style={{ color: 'var(--text2)' }}>Anushka Punekar</strong> — JSO Phase-2 Agentic Assignment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
