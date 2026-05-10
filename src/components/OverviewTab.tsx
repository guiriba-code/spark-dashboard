import type { Layer, Contract, SparkFunction } from '../types'
import { LayerGroup } from './LayerGroup'
import { Shield, AlertTriangle } from 'lucide-react'

interface OverviewTabProps {
  layers: Layer[]
  contracts: Contract[]
  functions: SparkFunction[]
}

export function OverviewTab({ layers, contracts, functions }: OverviewTabProps) {
  const avgSecurity = (layers.reduce((s, l) => s + l.securityScore, 0) / layers.length).toFixed(1)
  const avgCrit = (layers.reduce((s, l) => s + l.criticidade, 0) / layers.length).toFixed(1)
  const totalContracts = contracts.length
  const criticalFns = functions.filter(f => f.score <= 3).length

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Segurança Média', value: avgSecurity, icon: <Shield size={16} />, sub: 'do protocolo' },
          { label: 'Criticidade Média', value: avgCrit, icon: <AlertTriangle size={16} />, sub: 'do protocolo' },
          { label: 'Contratos', value: totalContracts, sub: 'mapeados' },
          { label: 'Funções Críticas', value: criticalFns, sub: 'score ≤ 3', alert: criticalFns > 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 border ${stat.alert ? 'border-[#ef4444]/30 bg-[#3f1212]/30' : 'border-[#2a2a35] bg-[#16161d]'}`}
          >
            <div className="flex items-center gap-2 text-[#6b6b80] mb-2">
              {stat.icon}
              <span className="text-xs uppercase tracking-wide">{stat.label}</span>
            </div>
            <p className={`text-2xl font-bold font-mono ${stat.alert ? 'text-[#ef4444]' : 'text-[#e8e8f0]'}`}>
              {stat.value}
            </p>
            <p className="text-xs text-[#3a3a48] mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="text-xs text-[#6b6b80] flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block" /> Score 1–3: Alta Criticidade
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b] inline-block" /> Score 4–7: Risco Moderado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] inline-block" /> Score 8–10: Seguro
        </span>
      </div>

      {/* Layer groups */}
      <div className="space-y-4">
        {layers.map(layer => (
          <LayerGroup
            key={layer.id}
            layer={layer}
            contracts={contracts}
            functions={functions}
          />
        ))}
      </div>
    </div>
  )
}
