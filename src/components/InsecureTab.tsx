import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { getScoreColor, getNetworkExplorerUrl } from '../types'
import type { SparkFunction, Contract } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'
import { DimensionTable } from './DimensionTable'

interface InsecureTabProps {
  functions: SparkFunction[]
  contracts: Contract[]
}

type StatusVal = 'Sim' | 'Não' | 'Parcial' | 'N/A'

function SBadge({ value, label }: { value: StatusVal; label: string }) {
  const m: Record<StatusVal, string> = {
    'Sim':     '#002200/#00ff41/#00ff4140',
    'Não':     '#2a0000/#ff3333/#ff333340',
    'Parcial': '#2a1a00/#ffcc00/#ffcc0040',
    'N/A':     '#0a0a1a/#9090c0/#2a2a55',
  }
  const [bg, text, border] = m[value].split('/')
  return (
    <span style={{ fontFamily: 'Courier New', fontSize: 9, padding: '1px 5px', background: bg, color: text, border: `1px solid ${border}`, fontWeight: 'bold' }}>
      {label}:{value}
    </span>
  )
}

function InsecureCard({ fn, contract, rank }: { fn: SparkFunction; contract: Contract; rank: number }) {
  const [open, setOpen] = useState(false)
  const color = getScoreColor(fn.score)
  const primaryAddr = contract.addresses.find(a => a.address)
  const explorerUrl = primaryAddr ? getNetworkExplorerUrl(primaryAddr.network, primaryAddr.address) : ''

  return (
    <div style={{ border: '1px solid #1a1a3a', background: '#0f0f1e', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px' }}>
        <span style={{ fontFamily: 'Courier New', fontSize: 16, color: '#2a2a55', width: 28, textAlign: 'right', flexShrink: 0, lineHeight: 1.2, paddingTop: 2 }}>
          {String(rank).padStart(2, '0')}
        </span>
        <DotIndicator color={color} />
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
            <ScoreBadge score={fn.score} color={color} label="Score" size="sm" />
            <SBadge value={fn.limites} label="L" />
            <SBadge value={fn.delay}   label="D" />
            <span style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0' }}>{fn.permission}</span>
          </div>
        </div>
        <button onClick={() => setOpen(!open)}
          style={{ color: '#9090c0', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e0e0ff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9090c0' }}
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #1a1a3a', padding: '10px 12px', background: '#0a0a18', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ border: '1px solid #1a1a3a', padding: 8 }}>
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 4 }}>POR QUE SEM LIMITES?</div>
              <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 10, color: '#9090c0', lineHeight: 1.4 }}>
                {fn.limites === 'Não'     ? 'Função com exposição financeira sem cap implementado'        :
                 fn.limites === 'Parcial' ? 'Limites existem mas são contornáveis ou incompletos'         :
                 fn.limites === 'N/A'     ? 'Sem exposição financeira — limites não aplicáveis'           :
                                           'Limites rigorosos implementados'}
              </div>
            </div>
            <div style={{ border: '1px solid #1a1a3a', padding: 8 }}>
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 4 }}>POR QUE SEM DELAY?</div>
              <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 10, color: '#9090c0', lineHeight: 1.4 }}>
                {fn.delay === 'Não'     ? 'Ação crítica executável imediatamente — sem janela de revisão' :
                 fn.delay === 'Parcial' ? 'Rate limit temporal ou multisig, sem Timelock on-chain'        :
                 fn.delay === 'N/A'     ? 'Permissionless, emergência ou já protegida por Timelock'       :
                                         'Timelock on-chain implementado'}
              </div>
            </div>
          </div>
          <DimensionTable fn={fn} />
          {fn.worstCase && (
            <div style={{ border: '1px solid #3a0000', background: '#140000', padding: 10 }}>
              <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#ff3333', marginBottom: 6, fontWeight: 'bold' }}>
                ⚠ PIOR CENÁRIO DE EXPLORAÇÃO
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

export function InsecureTab({ functions, contracts }: InsecureTabProps) {
  const top20 = [...functions]
    .filter(f => !f.isView && f.score <= 5)
    .sort((a, b) => a.score - b.score || b.impact - a.impact)
    .slice(0, 20)

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
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#ff3333', marginBottom: 6 }}>
          TOP 20 FUNÇÕES MAIS INSEGURAS
        </div>
        <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#9090c0' }}>
          Ordenadas por score crescente (2 = mais inseguro). Inclui apenas funções state com score ≤ 5.
          Expanda para ver ausência de Limites/Delay e pior cenário de exploração.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {top20.map((fn, i) => {
          const contract = contracts.find(c => c.id === fn.contractId)!
          return <InsecureCard key={fn.id} fn={fn} contract={contract} rank={i + 1} />
        })}
      </div>
    </div>
  )
}
