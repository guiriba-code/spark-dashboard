import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from '@xyflow/react'
import type { Contract, Layer, SparkFunction } from '../types'
import { getScoreColor } from '../types'
import { LayerNode } from './LayerNode'
import type { LayerNodeType } from './LayerNode'
import { ContractNode } from './ContractNode'
import type { ContractNodeType } from './ContractNode'
import { ContractDetailPanel } from './ContractDetailPanel'

const nodeTypes = { layer: LayerNode, contract: ContractNode }

// Fixed positions for the 8 layers — row spacing 550px to avoid contract node overlap when expanded
const LAYER_POSITIONS: Record<string, { x: number; y: number }> = {
  governance:  { x: 500,  y: 0    },
  lending:     { x: 0,    y: 550  },
  alm:         { x: 500,  y: 550  },
  oracles:     { x: 1000, y: 550  },
  security:    { x: -100, y: 1100 },
  automation:  { x: 280,  y: 1100 },
  crosschain:  { x: 660,  y: 1100 },
  rewards:     { x: 1040, y: 1100 },
}

const ARROW_MARKER = { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '' }

const EDGE_STYLES = {
  governa:    { stroke: '#9090c0', strokeWidth: 1.5, strokeDasharray: '6 3' },
  dataflow:   { stroke: '#4488ff', strokeWidth: 2 },
  automation: { stroke: '#00cc88', strokeWidth: 1.5, strokeDasharray: '4 2' },
  security:   { stroke: '#ff6644', strokeWidth: 1.5, strokeDasharray: '4 2' },
} as const

const LABEL_STYLES = {
  governa:    { fill: '#9090c0', fontFamily: 'Courier New, monospace', fontSize: 9 },
  dataflow:   { fill: '#4488ff', fontFamily: 'Courier New, monospace', fontSize: 9 },
  automation: { fill: '#00cc88', fontFamily: 'Courier New, monospace', fontSize: 9 },
  security:   { fill: '#ff6644', fontFamily: 'Courier New, monospace', fontSize: 9 },
} as const

const BG_STYLE = { fill: '#0a0a14', fillOpacity: 0.9 }

const DEPENDENCY_EDGES: Edge[] = [
  // Governance configures the 3 core layers — label only on central edge (alm) to avoid repetition
  {
    id: 'gov-lend', source: 'governance', target: 'lending', animated: true, type: 'smoothstep',
    style: EDGE_STYLES.governa, markerEnd: { ...ARROW_MARKER, color: '#9090c0' },
  },
  {
    id: 'gov-alm', source: 'governance', target: 'alm', animated: true, type: 'smoothstep',
    label: 'configures', labelStyle: LABEL_STYLES.governa, labelBgStyle: BG_STYLE,
    style: EDGE_STYLES.governa, markerEnd: { ...ARROW_MARKER, color: '#9090c0' },
  },
  {
    id: 'gov-ora', source: 'governance', target: 'oracles', animated: true, type: 'smoothstep',
    style: EDGE_STYLES.governa, markerEnd: { ...ARROW_MARKER, color: '#9090c0' },
  },
  // Governance grants roles to support layers — no label (cross-canvas, would clutter)
  {
    id: 'gov-sec', source: 'governance', target: 'security', animated: false, type: 'straight',
    style: { stroke: '#3a3a6a', strokeWidth: 1, strokeDasharray: '3 5', opacity: 0.5 },
    markerEnd: { ...ARROW_MARKER, color: '#3a3a6a', width: 10, height: 10 },
  },
  {
    id: 'gov-auto', source: 'governance', target: 'automation', animated: false, type: 'straight',
    style: { stroke: '#3a3a6a', strokeWidth: 1, strokeDasharray: '3 5', opacity: 0.5 },
    markerEnd: { ...ARROW_MARKER, color: '#3a3a6a', width: 10, height: 10 },
  },
  {
    id: 'gov-rew', source: 'governance', target: 'rewards', animated: false, type: 'straight',
    style: { stroke: '#3a3a6a', strokeWidth: 1, strokeDasharray: '3 5', opacity: 0.5 },
    markerEnd: { ...ARROW_MARKER, color: '#3a3a6a', width: 10, height: 10 },
  },
  // Data / liquidity flow — always labeled, these are the core functional relationships
  {
    id: 'alm-lend', source: 'alm', target: 'lending', animated: true, type: 'smoothstep',
    label: 'liquidity', labelStyle: LABEL_STYLES.dataflow, labelBgStyle: BG_STYLE,
    style: EDGE_STYLES.dataflow, markerEnd: { ...ARROW_MARKER, color: '#4488ff' },
  },
  {
    id: 'ora-lend', source: 'oracles', target: 'lending', animated: true, type: 'smoothstep',
    label: 'prices', labelStyle: LABEL_STYLES.dataflow, labelBgStyle: BG_STYLE,
    style: EDGE_STYLES.dataflow, markerEnd: { ...ARROW_MARKER, color: '#4488ff' },
  },
  {
    id: 'xchain-alm', source: 'crosschain', target: 'alm', animated: true, type: 'smoothstep',
    label: 'inflows L2', labelStyle: LABEL_STYLES.dataflow, labelBgStyle: BG_STYLE,
    style: EDGE_STYLES.dataflow, markerEnd: { ...ARROW_MARKER, color: '#4488ff' },
  },
  // Automation adjusts caps directly in the Pool
  {
    id: 'auto-lend', source: 'automation', target: 'lending', animated: true, type: 'smoothstep',
    label: 'adjusts caps', labelStyle: LABEL_STYLES.automation, labelBgStyle: BG_STYLE,
    style: EDGE_STYLES.automation, markerEnd: { ...ARROW_MARKER, color: '#00cc88' },
  },
  // Security can freeze/pause Lending
  {
    id: 'sec-lend', source: 'security', target: 'lending', animated: false, type: 'smoothstep',
    label: 'freeze/pause', labelStyle: LABEL_STYLES.security, labelBgStyle: BG_STYLE,
    style: EDGE_STYLES.security, markerEnd: { ...ARROW_MARKER, color: '#ff6644' },
  },
]

function buildLayerNodes(
  layers: Layer[],
  contracts: Contract[],
  expandedLayers: Set<string>
): LayerNodeType[] {
  return layers.map(layer => ({
    id: layer.id,
    type: 'layer' as const,
    position: LAYER_POSITIONS[layer.id] ?? { x: 0, y: 0 },
    data: {
      layer,
      expanded: expandedLayers.has(layer.id),
      contractCount: contracts.filter(c => c.layerId === layer.id).length,
    },
    draggable: true,
  }))
}

function computeContractPosition(
  layerPos: { x: number; y: number },
  index: number,
  total: number
): { x: number; y: number } {
  const spacing = 220
  const offset = (index - (total - 1) / 2) * spacing
  return {
    x: layerPos.x + offset,
    y: layerPos.y + 300,
  }
}

interface ProtocolGraphProps {
  layers: Layer[]
  contracts: Contract[]
  functions: SparkFunction[]
}

export function ProtocolGraph({ layers, contracts, functions }: ProtocolGraphProps) {
  const [expandedLayers, setExpandedLayers]   = useState<Set<string>>(new Set())
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(buildLayerNodes(layers, contracts, new Set()))
  const [edges, setEdges, onEdgesChange] = useEdgesState(DEPENDENCY_EDGES)

  // When expanded layers change, sync layer node data (without changing positions)
  useEffect(() => {
    setNodes(nds =>
      nds.map(n => {
        if (n.type === 'layer') {
          return {
            ...n,
            data: { ...n.data, expanded: expandedLayers.has(n.id) },
          }
        }
        return n
      })
    )
  }, [expandedLayers, setNodes])

  // Track layer node positions for when we spawn contract nodes
  const nodePositionsRef = useRef<Record<string, { x: number; y: number }>>(
    Object.fromEntries(layers.map(l => [l.id, LAYER_POSITIONS[l.id] ?? { x: 0, y: 0 }]))
  )

  const handleLayerToggle = useCallback(
    (layerId: string) => {
      const layerContracts = contracts.filter(c => c.layerId === layerId)
      const isExpanded = expandedLayers.has(layerId)

      if (isExpanded) {
        // Collapse: remove contract nodes + their edges for this layer
        const contractIds = new Set(layerContracts.map(c => c.id))
        setNodes(nds => nds.filter(n => !contractIds.has(n.id)))
        setEdges(eds => eds.filter(e => !e.id.startsWith(`expand-${layerId}-`)))
        setExpandedLayers(prev => {
          const next = new Set(prev)
          next.delete(layerId)
          return next
        })
        // If selected contract was in this layer, close the panel
        if (selectedContract && contractIds.has(selectedContract)) {
          setSelectedContract(null)
        }
      } else {
        // Expand: add contract nodes around this layer
        const layerPos = nodePositionsRef.current[layerId] ?? LAYER_POSITIONS[layerId] ?? { x: 0, y: 0 }

        const newContractNodes: ContractNodeType[] = layerContracts.map((contract, i) => ({
          id: contract.id,
          type: 'contract' as const,
          position: computeContractPosition(layerPos, i, layerContracts.length),
          data: {
            contract,
            selected: false,
          },
          draggable: true,
        }))

        const newContractEdges: Edge[] = layerContracts.map(contract => ({
          id: `expand-${layerId}-${contract.id}`,
          source: layerId,
          target: contract.id,
          type: 'smoothstep',
          style: { stroke: '#4040ff', strokeWidth: 1, strokeDasharray: '4 2' },
        }))

        setNodes(nds => [...nds, ...newContractNodes])
        setEdges(eds => [...eds, ...newContractEdges])
        setExpandedLayers(prev => new Set([...prev, layerId]))
      }
    },
    [contracts, expandedLayers, selectedContract, setNodes, setEdges]
  )

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (node.type === 'layer') {
        handleLayerToggle(node.id)
      } else if (node.type === 'contract') {
        setSelectedContract(prev => (prev === node.id ? null : node.id))
      }
    },
    [handleLayerToggle]
  )

  // Sync selected state into contract nodes
  useEffect(() => {
    setNodes(nds =>
      nds.map(n => {
        if (n.type === 'contract') {
          return { ...n, data: { ...n.data, selected: n.id === selectedContract } }
        }
        return n
      })
    )
  }, [selectedContract, setNodes])

  // Track node position changes (for re-spawning contract children at correct positions)
  const onNodesChangeWithTracking = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes)
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          nodePositionsRef.current[change.id] = change.position
        }
      })
    },
    [onNodesChange]
  )

  const selectedContractData = useMemo(
    () => (selectedContract ? contracts.find(c => c.id === selectedContract) : null),
    [selectedContract, contracts]
  )

  const selectedContractFunctions = useMemo(
    () => (selectedContract ? functions.filter(f => f.contractId === selectedContract) : []),
    [selectedContract, functions]
  )

  return (
    <div style={{ position: 'relative', height: '680px', border: '2px solid #1a1a3a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChangeWithTracking}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable
        panOnDrag
        zoomOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1a1a3a"
          gap={20}
          size={1}
        />
        <Controls
          style={{
            border: '2px solid #1a1a3a',
            background: '#0f0f1e',
            borderRadius: 0,
          }}
        />
        <MiniMap
          nodeColor={node => {
            const score =
              node.type === 'layer'
                ? (node.data as { layer: Layer }).layer?.securityScore ?? 5
                : (node.data as { contract: Contract }).contract?.securityScore ?? 5
            const c = getScoreColor(score)
            return c === 'red' ? '#ff3333' : c === 'yellow' ? '#ffcc00' : '#00ff41'
          }}
          style={{
            background: '#0a0a10',
            border: '2px solid #1a1a3a',
            borderRadius: 0,
          }}
        />
      </ReactFlow>

      {/* Legend overlay — top-left corner */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: '#0a0a14',
          border: '2px solid #808080',
          borderBottom: '2px solid #3a3a3a',
          borderRight: '2px solid #3a3a3a',
          padding: '6px 10px 8px',
          zIndex: 5,
          pointerEvents: 'none',
          minWidth: 160,
        }}
      >
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: '#c0c0c0', marginBottom: 6, letterSpacing: 1 }}>
          LEGEND
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={28} height={8} style={{ flexShrink: 0 }}>
              <line x1={0} y1={4} x2={24} y2={4} stroke="#9090c0" strokeWidth={1.5} strokeDasharray="5 3" />
              <polygon points="24,1 28,4 24,7" fill="#9090c0" />
            </svg>
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#9090c0' }}>configures</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={28} height={8} style={{ flexShrink: 0 }}>
              <line x1={0} y1={4} x2={24} y2={4} stroke="#3a3a6a" strokeWidth={1} strokeDasharray="3 5" opacity={0.6} />
              <polygon points="24,2 28,4 24,6" fill="#3a3a6a" opacity={0.6} />
            </svg>
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#3a3a6a' }}>grants roles</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={28} height={8} style={{ flexShrink: 0 }}>
              <line x1={0} y1={4} x2={24} y2={4} stroke="#4488ff" strokeWidth={2} />
              <polygon points="24,1 28,4 24,7" fill="#4488ff" />
            </svg>
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#4488ff' }}>data / liquidity</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={28} height={8} style={{ flexShrink: 0 }}>
              <line x1={0} y1={4} x2={24} y2={4} stroke="#00cc88" strokeWidth={1.5} strokeDasharray="4 2" />
              <polygon points="24,1 28,4 24,7" fill="#00cc88" />
            </svg>
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#00cc88' }}>adjusts caps (automation)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width={28} height={8} style={{ flexShrink: 0 }}>
              <line x1={0} y1={4} x2={24} y2={4} stroke="#ff6644" strokeWidth={1.5} strokeDasharray="4 2" />
              <polygon points="24,1 28,4 24,7" fill="#ff6644" />
            </svg>
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 9, color: '#ff6644' }}>freeze / pause (emergency)</span>
          </div>
        </div>
      </div>

      {/* Instruction overlay (when nothing selected) */}
      {expandedLayers.size === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0f0f1e',
            border: '1px solid #1a1a3a',
            padding: '6px 12px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 7,
            color: '#9090c0',
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          CLICK A BLOCK TO EXPAND CONTRACTS
        </div>
      )}

      {/* Contract detail panel */}
      {selectedContractData && (
        <ContractDetailPanel
          contract={selectedContractData}
          functions={selectedContractFunctions}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  )
}
