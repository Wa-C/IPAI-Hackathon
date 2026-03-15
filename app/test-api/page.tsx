'use client'

import { useState } from 'react'
import { api } from '@/lib/api-client'

export default function TestApiPage() {
  const [results, setResults] = useState<{ label: string; data: any; error?: string }[]>([])
  const [loading, setLoading] = useState(false)

  async function runTest(label: string, fn: () => Promise<any>) {
    try {
      const data = await fn()
      setResults((prev) => [...prev, { label, data }])
    } catch (e: any) {
      setResults((prev) => [...prev, { label, data: null, error: e.message }])
    }
  }

  async function runAllTests() {
    setResults([])
    setLoading(true)

    await runTest('Health Check', () => api.health())

    await runTest('Bias Scan', () =>
      api.biasScan('The fireman rushed to save the day. The exotic foods from foreign lands were amazing.')
    )

    setLoading(false)
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        COPA API Connection Test
      </h1>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Backend: <code>http://localhost:8000</code> | Make sure the FastAPI server is running.
      </p>

      <button
        onClick={runAllTests}
        disabled={loading}
        style={{
          padding: '0.75rem 1.5rem',
          background: loading ? '#999' : '#7c3aed',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {loading ? 'Running tests...' : 'Run API Tests'}
      </button>

      {results.map((r, i) => (
        <div
          key={i}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            border: `2px solid ${r.error ? '#ef4444' : '#22c55e'}`,
            borderRadius: '0.5rem',
            background: r.error ? '#fef2f2' : '#f0fdf4',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {r.error ? '[ FAIL ]' : '[ OK ]'} {r.label}
          </div>
          {r.error ? (
            <div style={{ color: '#ef4444' }}>{r.error}</div>
          ) : (
            <pre style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '300px' }}>
              {JSON.stringify(r.data, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}
