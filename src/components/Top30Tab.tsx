import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { getScoreColor, getNetworkExplorerUrl } from '../types'
import type { SparkFunction, Contract, Top30Entry } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'

interface Top30TabProps {
  top30: Top30Entry[]
  functions: SparkFunction[]
  contracts: Contract[]
}

function ImpactBadge({ impact }: { impact: number }) {
  const [bg, text, border] =
    impact >= 4 ? ['#2a0000', '#ff3333', '#ff333340'] :
    impact >= 3 ? ['#2a1a00', '#ffcc00', '#ffcc0040'] :
                  ['#002200', '#00ff41', '#00ff4140']
  return (
    <span style={{ fontFamily: 'Courier New', fontSize: 9, padding: '1px 5px', background: bg, color: text, border: `1px solid ${border}`, fontWeight: 'bold' }}>
      IMP {impact}
    </span>
  )
}

function Top30Card({ entry, fn, contract }: { entry: Top30Entry; fn: SparkFunction; contract: Contract }) {
  const [open, setOpen] = useState(false)
  const secColor = getScoreColor(fn.score)
  const primaryAddr = contract.addresses.find(a => a.address)
  const explorerUrl = primaryAddr ? getNetworkExplorerUrl(primaryAddr.network, primaryAddr.address) : ''

  return (
    <div style={{ border: '1px solid #1a1a3a', background: '#0f0f1e', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px' }}>
        <span style={{ fontFamily: 'Courier New', fontSize: 16, color: '#2a2a55', width: 28, textAlign: 'right', flexShrink: 0, lineHeight: 1.2, paddingTop: 2 }}>
          {String(entry.rank).padStart(2, '0')}
        </span>
        <DotIndicator color={entry.impact >= 4 ? 'red' : entry.impact >= 3 ? 'yellow' : 'green'} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'Courier New', fontSize: 12, color: '#e0e0ff', fontWeight: 'bold' }}>
              {fn.name}
            </span>
            {explorerUrl ? (
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'Courier New', fontSize: 9, color: '#4040ff', textDecoration: 'none' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}
              >
                {contract.name} <ExternalLink size={9} />
              </a>
            ) : (
              <span style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0' }}>{contract.name}</span>
            )}
          </div>
          <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#b0b0d8', lineHeight: 1.5, marginBottom: 8 }}>
            {fn.mainRisk}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <ImpactBadge impact={entry.impact} />
            <ScoreBadge score={fn.score} color={secColor} label="Seg" size="sm" />
            <span style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0' }}>{fn.permission}</span>
          </div>
        </div>
        {entry.worstCase && (
          <button onClick={() => setOpen(!open)}
            style={{ color: '#9090c0', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e0e0ff' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9090c0' }}
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {open && entry.worstCase && (
        <div style={{ borderTop: '1px solid #1a1a3a', padding: '10px 12px', background: '#0c0c00' }}>
          <div style={{ border: '1px solid #3a2a00', background: '#180e00', padding: 10 }}>
            <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#ffcc00', marginBottom: 6, fontWeight: 'bold' }}>
              ⚠ PIOR CENÁRIO DE IMPACTO
            </div>
            <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#b0b0d8', lineHeight: 1.5 }}>
              {entry.worstCase}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function Top30Tab({ top30, functions, contracts }: Top30TabProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div
        style={{
          borderTop:    '2px solid #808080',
          borderLeft:   '2px solid #808080',
          borderRight:  '2px solid #202020',
          borderBottom: '2px solid #202020',
          background: '#0f0f1e',
          padding: '10px 14px',
        }}
      >
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ffcc00', marginBottom: 6 }}>
          TOP 30 POR CRITICIDADE (IMPACTO)
        </div>
        <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#9090c0' }}>
          Ordenadas por impacto potencial no protocolo (4 = catastrófico, 1 = baixo). O score de segurança é secundário.
          Expanda para ver o pior cenário de exploração.
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, fontFamily: 'Courier New', fontSize: 9, color: '#9090c0' }}>
        <span><span style={{ color: '#ff3333', fontWeight: 'bold' }}>IMP 4</span> — Catastrófico</span>
        <span><span style={{ color: '#ffcc00', fontWeight: 'bold' }}>IMP 3</span> — Severo</span>
        <span><span style={{ color: '#00ff41', fontWeight: 'bold' }}>IMP 2</span> — Moderado</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {top30.map(entry => {
          const fn = functions.find(f => f.id === entry.functionId)
          const contract = fn ? contracts.find(c => c.id === fn.contractId) : undefined
          if (!fn || !contract) return null
          return <Top30Card key={entry.rank} entry={entry} fn={fn} contract={contract} />
        })}
      </div>
    </div>
  )
}
