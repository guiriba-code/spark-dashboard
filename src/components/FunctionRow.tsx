import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Clock, BarChart2, Shield } from 'lucide-react'
import { getScoreColor } from '../types'
import type { SparkFunction } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'
import { DimensionTable } from './DimensionTable'

interface FunctionRowProps {
  fn: SparkFunction
  showImpact?: boolean
}

type StatusVal = 'Yes' | 'No' | 'Partial' | 'N/A'

function normalizeStatus(value: string): StatusVal {
  if (value.startsWith('Yes'))     return 'Yes'
  if (value.startsWith('No'))      return 'No'
  if (value.startsWith('Partial')) return 'Partial'
  return 'N/A'
}

function StatusBadge({ value, label }: { value: string; label: string }) {
  const colorMap: Record<StatusVal, { bg: string; text: string; border: string }> = {
    'Yes':    { bg: '#002200', text: '#00ff41', border: '#00ff4140' },
    'No':     { bg: '#2a0000', text: '#ff3333', border: '#ff333340' },
    'Partial':{ bg: '#2a1a00', text: '#ffcc00', border: '#ffcc0040' },
    'N/A':    { bg: '#0a0a1a', text: '#9090c0', border: '#2a2a55'  },
  }
  const s = colorMap[normalizeStatus(value)]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 9,
        padding: '1px 5px',
        background: s.bg,
        color: s.text,
        border: `1px solid ${s.border}`,
        fontWeight: 'bold',
      }}
    >
      {label}:{value}
    </span>
  )
}

export function FunctionRow({ fn, showImpact = false }: FunctionRowProps) {
  const [open, setOpen] = useState(false)
  const color = getScoreColor(fn.score)

  return (
    <div
      style={{
        border: '1px solid #1a1a3a',
        background: '#0f0f1e',
      }}
    >
      {/* Header row */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 10px',
          background: 'transparent',
          border: 'none',
          color: '#e0e0ff',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#14142a' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        <span style={{ color: '#9090c0', flexShrink: 0 }}>
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>

        <DotIndicator color={color} />

        <span
          style={{
            fontFamily: 'Courier New',
            fontSize: 11,
            color: '#e0e0ff',
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fn.name}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {showImpact && (
            <ScoreBadge
              score={fn.relevance}
              color={fn.relevance >= 8 ? 'red' : fn.relevance >= 4 ? 'yellow' : 'green'}
              label="Relev"
              size="sm"
            />
          )}
          <ScoreBadge score={fn.score} color={color} label="Sec" size="sm" />
          <StatusBadge value={fn.limits} label="L" />
          <StatusBadge value={fn.delay}   label="D" />
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          style={{
            borderTop: '1px solid #1a1a3a',
            padding: '10px 12px',
            background: '#0a0a18',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {/* Permission + Concentration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 2 }}>
                PERMISSION
              </div>
              <div style={{ fontFamily: 'Courier New', fontSize: 10, color: '#e0e0ff' }}>
                {fn.permission}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 2 }}>
                CONCENTRATION
              </div>
              <div style={{ fontFamily: 'Courier New', fontSize: 10, color: '#e0e0ff' }}>
                {fn.concentration}
              </div>
            </div>
          </div>

          {/* Description — what the function does */}
          {fn.description && fn.description !== '-' && (
            <div>
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 4 }}>
                WHAT IT DOES
              </div>
              <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#c8c8e8', lineHeight: 1.5 }}>
                {fn.description}
              </div>
            </div>
          )}

          <div>
            <div
              style={{
                fontFamily: 'Courier New',
                fontSize: 9,
                color: '#9090c0',
                marginBottom: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <AlertTriangle size={10} /> MAIN RISK
            </div>
            <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#b0b0d8', lineHeight: 1.5 }}>
              {fn.mainRisk}
            </div>
          </div>

          {/* Limits + Delay */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ border: '1px solid #1a1a3a', padding: 8 }}>
              <div
                style={{
                  fontFamily: 'Courier New',
                  fontSize: 9,
                  color: '#9090c0',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <BarChart2 size={10} /> LIMITS
              </div>
              <StatusBadge value={fn.limits} label="Limits" />
              <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 10, color: '#9090c0', marginTop: 4 }}>
                {fn.limits === 'N/A'      ? 'No financial exposure'               :
                 fn.limits === 'Yes'      ? 'Strict limits implemented'            :
                 fn.limits === 'Partial'  ? 'Partial or bypassable limits'         :
                                           'Limits required — none exist'         }
              </div>
            </div>
            <div style={{ border: '1px solid #1a1a3a', padding: 8 }}>
              <div
                style={{
                  fontFamily: 'Courier New',
                  fontSize: 9,
                  color: '#9090c0',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Clock size={10} /> DELAY
              </div>
              <StatusBadge value={fn.delay} label="Delay" />
              <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 10, color: '#9090c0', marginTop: 4 }}>
                {fn.delay === 'N/A'      ? 'Permissionless / emergency / Timelock already present' :
                 fn.delay === 'Yes'      ? 'On-chain Timelock present'                              :
                 fn.delay === 'Partial'  ? 'Temporal rate limit / multisig'                        :
                                          'Delay required — none exists'                           }
              </div>
            </div>
          </div>

          {/* Dimension table */}
          <div>
            <div
              style={{
                fontFamily: 'Courier New',
                fontSize: 9,
                color: '#9090c0',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Shield size={10} /> SCORE BY DIMENSION
            </div>
            <DimensionTable fn={fn} />
          </div>

          {/* Worst case */}
          {fn.worstCase && (
            <div
              style={{
                border: '1px solid #3a2000',
                background: '#180e00',
                padding: 10,
              }}
            >
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#ffcc00', marginBottom: 6, fontWeight: 'bold' }}>
                &#9888; WORST CASE SCENARIO
              </div>
              <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#b0b0d8', lineHeight: 1.5 }}>
                {fn.worstCase}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
