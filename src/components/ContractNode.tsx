import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { Contract } from '../types'
import { getScoreColor, getRelevanceColor, getNetworkExplorerUrl } from '../types'
import { ScoreBadge } from './ScoreBadge'

export type ContractNodeData = {
  contract: Contract
  selected: boolean
}

export type ContractNodeType = Node<ContractNodeData, 'contract'>

const networkShort: Record<string, string> = {
  mainnet: 'ETH',
  base: 'Base',
  arbitrum: 'Arb',
}

function ContractNodeComponent({ data }: NodeProps<ContractNodeType>) {
  const { contract, selected } = data
  const secColor  = getScoreColor(contract.securityScore)
  const critColor = getRelevanceColor(contract.relevance)

  const borderHighlight = selected ? '#00ff41' : '#404040'
  const borderLight     = selected ? '#88ff88' : '#808080'
  const glow            = selected ? '0 0 14px #00ff4166' : '2px 2px 0 #000'

  const addressLinks = contract.addresses.filter(a => a.address)

  return (
    <div
      style={{
        width: 200,
        borderTop:    `2px solid ${borderLight}`,
        borderLeft:   `2px solid ${borderLight}`,
        borderRight:  `2px solid ${borderHighlight}`,
        borderBottom: `2px solid ${borderHighlight}`,
        background: selected ? '#0a1a0a' : '#0f0f1e',
        boxShadow: glow,
        cursor: 'pointer',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: selected
            ? 'linear-gradient(90deg, #003300, #006600)'
            : 'linear-gradient(90deg, #1a1a1a, #2a2a2a)',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: selected ? '#00ff41' : '#c0c0c0',
        }}
      >
        <span
          style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '10px',
            fontWeight: 'bold',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 160,
            color: selected ? '#00ff41' : '#e0e0ff',
          }}
        >
          {contract.name}
        </span>
        {selected && (
          <span style={{ fontSize: 8, color: '#00ff41', fontFamily: 'Courier New' }}>◆</span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '6px 7px', fontSize: 10 }}>
        <div
          style={{
            fontFamily: "'Courier New', monospace",
            fontSize: 9,
            color: '#9090c0',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {contract.repository}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 5 }}>
          <div>
            <div style={{ fontFamily: 'Courier New', fontSize: 8, color: '#9090c0', marginBottom: 2 }}>Security</div>
            <ScoreBadge score={contract.securityScore} color={secColor}  size="sm" />
          </div>
          <div>
            <div style={{ fontFamily: 'Courier New', fontSize: 8, color: '#9090c0', marginBottom: 2 }}>Relevance</div>
            <ScoreBadge score={contract.relevance}  color={critColor} size="sm" />
          </div>
        </div>

        {/* Etherscan links */}
        {addressLinks.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {addressLinks.map(a => {
              const url = getNetworkExplorerUrl(a.network, a.address)
              return (
                <a
                  key={a.network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{
                    fontFamily: 'Courier New',
                    fontSize: 8,
                    color: '#4040ff',
                    textDecoration: 'none',
                    border: '1px solid #2a2a55',
                    padding: '1px 3px',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#8080ff' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = '#4040ff' }}
                >
                  {networkShort[a.network] ?? a.network} ↗
                </a>
              )
            })}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#2a2a55', border: '1px solid #4040ff' }}
      />
    </div>
  )
}

export const ContractNode = memo(ContractNodeComponent)
