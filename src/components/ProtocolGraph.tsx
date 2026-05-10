import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
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

// Fixed positions for the 8 layers
const LAYER_POSITIONS: Record<string, { x: number; y: number }> = {
  governance:  { x: 380,  y: 0   },
  lending:     { x: 50,   y: 280 },
  alm:         { x: 350,  y: 280 },
  oracles:     { x: 680,  y: 280 },
  security:    { x: -80,  y: 560 },
  automation:  { x: 200,  y: 560 },
  crosschain:  { x: 520,  y: 560 },
  rewards:     { x: 800,  y: 560 },
}

// Dependency edges between layers
const DEPENDENCY_EDGES: Edge[] = [
  { id: 'gov-lend',   source: 'governance', target: 'lending',    animated: true,  type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1.5 } },
  { id: 'gov-alm',    source: 'governance', target: 'alm',        animated: true,  type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1.5 } },
  { id: 'gov-ora',    source: 'governance', target: 'oracles',    animated: true,  type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1.5 } },
  { id: 'gov-sec',    source: 'governance', target: 'security',   animated: false, type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1 } },
  { id: 'gov-auto',   source: 'governance', target: 'automation', animated: false, type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1 } },
  { id: 'gov-xchain', source: 'governance', target: 'crosschain', animated: false, type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1 } },
  { id: 'gov-rew',    source: 'governance', target: 'rewards',    animated: false, type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1 } },
  { id: 'alm-lend',   source: 'alm',        target: 'lending',    animated: true,  type: 'smoothstep', style: { stroke: '#4040ff', strokeWidth: 1.5 } },
  { id: 'ora-lend',   source: 'oracles',    target: 'lending',    animated: true,  type: 'smoothstep', style: { stroke: '#4040ff', strokeWidth: 1.5 } },
  { id: 'auto-lend',  source: 'automation', target: 'lending',    animated: false, type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1 } },
  { id: 'xchain-alm', source: 'crosschain', target: 'alm',        animated: true,  type: 'smoothstep', style: { stroke: '#2a2a55', strokeWidth: 1 } },
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
  const spacing = 190
  const offset = (index - (total - 1) / 2) * spacing
  return {
    x: layerPos.x + offset,
    y: layerPos.y + 230,
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
          CLIQUE NUM BLOCO PARA EXPANDIR OS CONTRATOS
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
