import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getScoreColor, getRelevanceColor } from '../types'
import type { Layer, Contract } from '../types'

interface SummaryTabProps {
  layers: Layer[]
  contracts: Contract[]
}

interface ScorePillProps {
  value: number
  label: string
  colorFn: (v: number) => 'red' | 'yellow' | 'green'
}

const COLOR_MAP = {
  red:    { bg: '#2a0000', text: '#ff4444', border: '#ff333340' },
  yellow: { bg: '#2a1a00', text: '#ffcc00', border: '#ffcc0040' },
  green:  { bg: '#002200', text: '#00ff41', border: '#00ff4140' },
}

function ScorePill({ value, label, colorFn }: ScorePillProps) {
  const c = COLOR_MAP[colorFn(value)]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
      <div style={{
        fontFamily: 'Courier New, monospace',
        fontSize: 8,
        color: '#9090c0',
        marginBottom: 3,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: 11,
        padding: '4px 14px',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        minWidth: 50,
        textAlign: 'center',
      }}>
        {value.toFixed(1)}
      </div>
    </div>
  )
}

function ContractRow({ contract }: { contract: Contract }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 12px 8px 40px',
      background: '#0a0a16',
      borderBottom: '1px solid #12122a',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          background: COLOR_MAP[getScoreColor(contract.securityScore)].text,
          flexShrink: 0,
        }} />
        <span style={{
          fontFamily: 'Courier New, monospace',
          fontSize: 11,
          color: '#c0c0d8',
        }}>
          {contract.name}
        </span>
        <span style={{
          fontFamily: 'Courier New, monospace',
          fontSize: 9,
          color: '#4040a0',
        }}>
          {contract.repository}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
        <ScorePill value={contract.securityScore} label="Security"  colorFn={getScoreColor} />
        <ScorePill value={contract.relevance}     label="Relevance" colorFn={getRelevanceColor} />
      </div>
    </div>
  )
}

export function SummaryTab({ layers, contracts }: SummaryTabProps) {
  const [allOpen, setAllOpen] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{
        borderBottom: '2px solid #202020',
        background: '#0f0f1e',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#00ff41', marginBottom: 6 }}>
            SUMMARY BY LAYER AND CONTRACT
          </div>
          <div style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 11, color: '#9090c0' }}>
            Consolidated Security and Relevance scores by architectural layer and individual contract.
            Click a layer to expand its contracts.
          </div>
        </div>
        <button
          onClick={() => setAllOpen(v => !v)}
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: 9,
            padding: '4px 10px',
            background: '#0a0a14',
            color: '#9090c0',
            border: '1px solid #1a1a3a',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#e0e0ff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9090c0' }}
        >
          {allOpen ? '▲ Collapse all' : '▼ Expand all'}
        </button>
      </div>

      {/* Column labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingRight: 14,
        gap: 24,
      }}>
        <div style={{ minWidth: 90, textAlign: 'center', fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a', letterSpacing: 1 }}>
          SECURITY
        </div>
        <div style={{ minWidth: 90, textAlign: 'center', fontFamily: 'Courier New, monospace', fontSize: 8, color: '#3a3a6a', letterSpacing: 1 }}>
          RELEVANCE
        </div>
      </div>

      {/* Scale reference */}
      <div style={{
        display: 'flex',
        gap: 16,
        fontFamily: 'Courier New, monospace',
        fontSize: 9,
        color: '#9090c0',
        paddingLeft: 4,
      }}>
        <span>Scale: <span style={{ color: '#00ff41' }}>8-10 secure</span></span>
        <span><span style={{ color: '#ffcc00' }}>4-7 caution</span></span>
        <span><span style={{ color: '#ff4444' }}>2-3 critical</span></span>
        <span style={{ color: '#4040a0' }}>|</span>
        <span>Relevance: <span style={{ color: '#ff4444' }}>8-10 high</span></span>
        <span><span style={{ color: '#ffcc00' }}>4-7 medium</span></span>
        <span><span style={{ color: '#00ff41' }}>1-3 low</span></span>
      </div>

      {/* Layers */}
      <ExpandAllContext layers={layers} contracts={contracts} forceOpen={allOpen} />
    </div>
  )
}

function ExpandAllContext({
  layers,
  contracts,
  forceOpen,
}: {
  layers: Layer[]
  contracts: Contract[]
  forceOpen: boolean
}) {
  return (
    <div>
      {layers.map(layer => {
        const layerContracts = contracts.filter(c => c.layerId === layer.id)
        return (
          <ControlledLayerRow
            key={layer.id}
            layer={layer}
            contracts={layerContracts}
            forceOpen={forceOpen}
          />
        )
      })}
    </div>
  )
}

function ControlledLayerRow({
  layer,
  contracts,
  forceOpen,
}: {
  layer: Layer
  contracts: Contract[]
  forceOpen: boolean
}) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = forceOpen || localOpen

  return (
    <div style={{ border: '1px solid #1a1a3a', marginBottom: 6, overflow: 'hidden' }}>
      <button
        onClick={() => setLocalOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: open ? '#14142a' : '#0f0f22',
          border: 'none',
          cursor: 'pointer',
          borderBottom: open ? '1px solid #1a1a3a' : 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#14142a' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = open ? '#14142a' : '#0f0f22' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ color: '#9090c0', flexShrink: 0 }}>
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: '#e0e0ff' }}>
            {layer.name.toUpperCase()}
          </span>
          <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#4040a0', flexShrink: 0 }}>
            {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
          <ScorePill value={layer.securityScore} label="Security"  colorFn={getScoreColor} />
          <ScorePill value={layer.relevance}     label="Relevance" colorFn={getRelevanceColor} />
        </div>
      </button>

      {open && contracts.map(c => <ContractRow key={c.id} contract={c} />)}
    </div>
  )
}
