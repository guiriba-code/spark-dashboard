import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getScoreColor, getCriticalidadeColor } from '../types'
import type { Layer, Contract, SparkFunction } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'
import { ContractCard } from './ContractCard'

interface LayerGroupProps {
  layer: Layer
  contracts: Contract[]
  functions: SparkFunction[]
}

export function LayerGroup({ layer, contracts, functions }: LayerGroupProps) {
  const [open, setOpen] = useState(false)
  const secColor = getScoreColor(layer.securityScore)
  const critColor = getCriticalidadeColor(layer.criticidade)

  const layerContracts = contracts.filter(c => c.layerId === layer.id)

  return (
    <div className="border border-[#2a2a35] rounded-2xl overflow-hidden bg-[#16161d]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-6 py-5 hover:bg-[#1e1e28] transition-colors text-left group"
      >
        <span className="text-[#6b6b80] group-hover:text-[#9494a8] transition-colors">
          {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>

        <DotIndicator color={secColor} />

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[#e8e8f0]">{layer.name}</h3>
          <p className="text-xs text-[#6b6b80] mt-0.5">
            {layerContracts.length} contrato{layerContracts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-[#6b6b80] mb-1">Segurança média</p>
            <ScoreBadge score={layer.securityScore} color={secColor} size="md" />
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b6b80] mb-1">Criticidade</p>
            <ScoreBadge score={layer.criticidade} color={critColor} size="md" />
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#2a2a35] p-4 space-y-3 bg-[#12121a]">
          {layerContracts.map(contract => (
            <ContractCard
              key={contract.id}
              contract={contract}
              functions={functions.filter(f => f.contractId === contract.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
