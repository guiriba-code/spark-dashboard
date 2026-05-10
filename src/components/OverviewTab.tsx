import type { Layer, Contract, SparkFunction } from '../types'
import { getScoreColor, getRelevanceColor } from '../types'
import { ProtocolGraph } from './ProtocolGraph'
import { ScoreBadge } from './ScoreBadge'

interface OverviewTabProps {
  layers: Layer[]
  contracts: Contract[]
  functions: SparkFunction[]
}

export function OverviewTab({ layers, contracts, functions }: OverviewTabProps) {
  const avgSec  = (layers.reduce((s, l) => s + l.securityScore, 0) / layers.length).toFixed(1)
  const avgRelev = (layers.reduce((s, l) => s + l.relevance,   0) / layers.length).toFixed(1)
  const criticalFns = functions.filter(f => f.score <= 3).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'SEC. AVG',       value: avgSec,        color: getScoreColor(parseFloat(avgSec)),    sub: 'protocol-wide'  },
          { label: 'RELEV. AVG',    value: avgRelev,      color: getRelevanceColor(parseFloat(avgRelev)), sub: 'across components' },
          { label: 'CONTRACTS',     value: contracts.length, color: 'green' as const, sub: 'mapped'        },
          { label: 'CRITICAL FNS',  value: criticalFns,   color: criticalFns > 0 ? 'red' as const : 'green' as const, sub: 'score <= 3' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              background: '#0f0f1e',
              borderTop:    '2px solid #808080',
              borderLeft:   '2px solid #808080',
              borderRight:  '2px solid #202020',
              borderBottom: '2px solid #202020',
              padding: '10px 12px',
            }}
          >
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: '#9090c0', marginBottom: 6 }}>
              {stat.label}
            </div>
            <ScoreBadge score={parseFloat(String(stat.value))} color={stat.color} size="lg" />
            <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#6060a0', marginTop: 4 }}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '4px 0' }}>
        {[
          { color: '#ff3333', label: 'Score 1-3: Insecure' },
          { color: '#ffcc00', label: 'Score 4-7: Moderate' },
          { color: '#00ff41', label: 'Score 8-10: Secure'  },
        ].map(({ color, label }) => (
          <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Courier New', fontSize: 10, color: '#9090c0' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, background: color, boxShadow: `0 0 6px ${color}` }} />
            {label}
          </span>
        ))}
      </div>

      {/* React Flow graph */}
      <ProtocolGraph layers={layers} contracts={contracts} functions={functions} />
    </div>
  )
}
