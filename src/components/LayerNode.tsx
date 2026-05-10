import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps, Node } from '@xyflow/react'
import type { Layer } from '../types'
import { getScoreColor, getRelevanceColor } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'

export type LayerNodeData = {
  layer: Layer
  expanded: boolean
  contractCount: number
}

export type LayerNodeType = Node<LayerNodeData, 'layer'>

function LayerNodeComponent({ data }: NodeProps<LayerNodeType>) {
  const { layer, expanded, contractCount } = data
  const secColor = getScoreColor(layer.securityScore)
  const critColor = getRelevanceColor(layer.relevance)

  const borderColor = expanded ? '#4040ff' : '#2a2a55'
  const glowColor   = expanded ? '#4040ff88' : 'transparent'

  return (
    <div
      style={{
        width: 220,
        borderTop:    `2px solid ${expanded ? '#8080ff' : '#dfdfdf'}`,
        borderLeft:   `2px solid ${expanded ? '#8080ff' : '#dfdfdf'}`,
        borderRight:  `2px solid ${expanded ? '#000080' : '#404040'}`,
        borderBottom: `2px solid ${expanded ? '#000080' : '#404040'}`,
        boxShadow: `2px 2px 0 #000, 0 0 12px ${glowColor}`,
        background: '#0f0f1e',
        cursor: 'pointer',
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: expanded
            ? 'linear-gradient(90deg, #000080 0%, #4040cc 100%)'
            : 'linear-gradient(90deg, #000055 0%, #1a1a88 100%)',
          padding: '3px 4px 3px 6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
        }}
      >
        <span
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '6px',
            letterSpacing: '-0.5px',
            lineHeight: 1.4,
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {layer.name}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 14,
            height: 12,
            background: '#c0c0c0',
            color: '#000',
            fontFamily: "'Courier New', monospace",
            fontSize: 10,
            fontWeight: 'bold',
            borderTop:    '1px solid #ffffff',
            borderLeft:   '1px solid #ffffff',
            borderRight:  '1px solid #404040',
            borderBottom: '1px solid #404040',
            flexShrink: 0,
          }}
        >
          {expanded ? '−' : '+'}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '8px', background: '#0f0f1e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: '#9090c0', marginBottom: 2 }}>
              Security
            </div>
            <ScoreBadge score={layer.securityScore} color={secColor} size="sm" />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: 9, color: '#9090c0', marginBottom: 2 }}>
              Relevance
            </div>
            <ScoreBadge score={layer.relevance} color={critColor} size="sm" />
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid #1a1a3a',
            paddingTop: 5,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <DotIndicator color={secColor} />
          <span style={{ fontFamily: 'Tahoma, Arial, sans-serif', fontSize: 10, color: '#9090c0' }}>
            {contractCount} contract{contractCount !== 1 ? 's' : ''}
          </span>
          {expanded && (
            <span
              style={{
                marginLeft: 'auto',
                fontFamily: "'Courier New', monospace",
                fontSize: 8,
                color: '#4040ff',
              }}
            >
              EXPANDIDO
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: borderColor, border: `1px solid ${expanded ? '#8080ff' : '#404080'}` }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: borderColor, border: `1px solid ${expanded ? '#8080ff' : '#404080'}` }}
      />
    </div>
  )
}

export const LayerNode = memo(LayerNodeComponent)
