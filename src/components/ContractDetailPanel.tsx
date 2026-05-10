import { X, ExternalLink } from 'lucide-react'
import type { Contract, SparkFunction } from '../types'
import { getScoreColor, getRelevanceColor, getNetworkExplorerUrl } from '../types'
import { ScoreBadge } from './ScoreBadge'
import { FunctionRow } from './FunctionRow'

interface ContractDetailPanelProps {
  contract: Contract
  functions: SparkFunction[]
  onClose: () => void
}

const networkLabel: Record<string, string> = {
  mainnet: 'Ethereum Mainnet',
  base: 'Base',
  arbitrum: 'Arbitrum',
}

export function ContractDetailPanel({ contract, functions, onClose }: ContractDetailPanelProps) {
  const secColor  = getScoreColor(contract.securityScore)
  const critColor = getRelevanceColor(contract.relevance)
  const stateFns  = functions.filter(f => !f.isView)
  const viewFns   = functions.filter(f => f.isView)

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 420,
        height: '100%',
        background: '#0a0a10',
        borderLeft: '2px solid #1a1a3a',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.8)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Win95 title bar */}
      <div
        style={{
          background: 'linear-gradient(90deg, #000080 0%, #1060c8 100%)',
          padding: '4px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            color: '#ffffff',
          }}
        >
          {contract.name}
        </span>
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 14,
            background: '#c0c0c0',
            color: '#000',
            border: 'none',
            borderTop:    '1px solid #fff',
            borderLeft:   '1px solid #fff',
            borderRight:  '1px solid #404040',
            borderBottom: '1px solid #404040',
            cursor: 'pointer',
            flexShrink: 0,
            padding: 0,
          }}
        >
          <X size={10} />
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {/* Scores row */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginBottom: 12,
            padding: 10,
            border: '1px solid #1a1a3a',
            background: '#0f0f1e',
          }}
        >
          <div>
            <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 3 }}>
              SECURITY
            </div>
            <ScoreBadge score={contract.securityScore} color={secColor}  size="md" />
          </div>
          <div>
            <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 3 }}>
              RELEVANCE
            </div>
            <ScoreBadge score={contract.relevance}  color={critColor} size="md" />
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontFamily: 'Courier New', fontSize: 9, color: '#9090c0', marginBottom: 3 }}>
              REPOSITORY
            </div>
            <span style={{ fontFamily: 'Courier New', fontSize: 10, color: '#b0b0d8' }}>
              {contract.repository}
            </span>
          </div>
        </div>

        {/* Etherscan addresses */}
        {contract.addresses.filter(a => a.address).length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: '#9090c0',
                marginBottom: 6,
                borderBottom: '1px solid #1a1a3a',
                paddingBottom: 4,
              }}
            >
              ADDRESSES
            </div>
            {contract.addresses.filter(a => a.address).map(a => {
              const url = getNetworkExplorerUrl(a.network, a.address)
              return (
                <div key={a.network} style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: 'Courier New',
                      fontSize: 9,
                      color: '#9090c0',
                      width: 80,
                      flexShrink: 0,
                    }}
                  >
                    {networkLabel[a.network] ?? a.network}
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'Courier New',
                      fontSize: 9,
                      color: '#4040ff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      textDecoration: 'none',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}
                  >
                    {a.address.slice(0, 10)}…{a.address.slice(-8)}
                    <ExternalLink size={9} />
                  </a>
                </div>
              )
            })}
          </div>
        )}

        {/* State functions */}
        {stateFns.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: '#9090c0',
                marginBottom: 8,
                borderBottom: '1px solid #1a1a3a',
                paddingBottom: 4,
              }}
            >
              STATE FUNCTIONS ({stateFns.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stateFns.map(fn => (
                <FunctionRow key={fn.id} fn={fn} showImpact />
              ))}
            </div>
          </div>
        )}

        {/* View functions */}
        {viewFns.length > 0 && (
          <div>
            <div
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 7,
                color: '#9090c0',
                marginBottom: 8,
                borderBottom: '1px solid #1a1a3a',
                paddingBottom: 4,
              }}
            >
              VIEW FUNCTIONS ({viewFns.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {viewFns.map(fn => (
                <FunctionRow key={fn.id} fn={fn} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
