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

type StatusVal = 'Sim' | 'Não' | 'Parcial' | 'N/A'

function StatusBadge({ value, label }: { value: StatusVal; label: string }) {
  const colorMap: Record<StatusVal, { bg: string; text: string; border: string }> = {
    'Sim':    { bg: '#002200', text: '#00ff41', border: '#00ff4140' },
    'Não':    { bg: '#2a0000', text: '#ff3333', border: '#ff333340' },
    'Parcial':{ bg: '#2a1a00', text: '#ffcc00', border: '#ffcc0040' },
    'N/A':    { bg: '#0a0a1a', text: '#9090c0', border: '#2a2a55'  },
  }
  const s = colorMap[value]
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
              score={fn.impact}
              color={fn.impact >= 4 ? 'red' : fn.impact >= 3 ? 'yellow' : 'green'}
              label="Imp"
              size="sm"
            />
          )}
          <ScoreBadge score={fn.score} color={color} label="Seg" size="sm" />
          <StatusBadge value={fn.limites} label="L" />
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
                PERMISSÃO
              </div>
              <div style={{ fontFamily: 'Courier New', fontSize: 10, color: '#e0e0ff' }}>
                {fn.permission}
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 2 }}>
                CONCENTRAÇÃO
              </div>
              <div style={{ fontFamily: 'Courier New', fontSize: 10, color: '#e0e0ff' }}>
                {fn.concentration}
              </div>
            </div>
          </div>

          {/* Main risk */}
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
              <AlertTriangle size={10} /> RISCO PRINCIPAL
            </div>
            <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#b0b0d8', lineHeight: 1.5 }}>
              {fn.mainRisk}
            </div>
          </div>

          {/* Limites + Delay */}
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
                <BarChart2 size={10} /> LIMITES
              </div>
              <StatusBadge value={fn.limites} label="Limites" />
              <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 10, color: '#9090c0', marginTop: 4 }}>
                {fn.limites === 'N/A'     ? 'Sem exposição financeira'            :
                 fn.limites === 'Sim'     ? 'Limites rigorosos implementados'     :
                 fn.limites === 'Parcial' ? 'Limites parciais ou contornáveis'    :
                                           'Necessita limites — nenhum existe'   }
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
                {fn.delay === 'N/A'     ? 'Permissionless / emergência / Timelock já presente' :
                 fn.delay === 'Sim'     ? 'Timelock on-chain presente'                         :
                 fn.delay === 'Parcial' ? 'Rate limit temporal / multisig'                    :
                                         'Necessita delay — nenhum existe'                    }
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
              <Shield size={10} /> SCORE POR DIMENSÃO
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
                ⚠ PIOR CENÁRIO
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
