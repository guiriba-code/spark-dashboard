import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Clock, BarChart2, ExternalLink } from 'lucide-react'
import { getScoreColor, getNetworkExplorerUrl } from '../types'
import type { SparkFunction, Contract } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'
import { DimensionTable } from './DimensionTable'

interface InsecureTabProps {
  functions: SparkFunction[]
  contracts: Contract[]
}

const statusBadge = (value: 'Sim' | 'Não' | 'Parcial' | 'N/A', label: string) => {
  const colorMap = {
    'Sim': 'bg-[#0d2e1a] text-[#22c55e] border-[#22c55e]/30',
    'Não': 'bg-[#3f1212] text-[#ef4444] border-[#ef4444]/30',
    'Parcial': 'bg-[#3f2d0a] text-[#f59e0b] border-[#f59e0b]/30',
    'N/A': 'bg-[#1a1a22] text-[#6b6b80] border-[#2a2a35]',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded border font-medium ${colorMap[value]}`}>
      {label}: {value}
    </span>
  )
}

function InsecureCard({ fn, contract, rank }: { fn: SparkFunction; contract: Contract; rank: number }) {
  const [open, setOpen] = useState(false)
  const color = getScoreColor(fn.score)

  const primaryAddress = contract.addresses.find(a => a.address)
  const explorerUrl = primaryAddress ? getNetworkExplorerUrl(primaryAddress.network, primaryAddress.address) : ''

  return (
    <div className="border border-[#2a2a35] rounded-xl overflow-hidden">
      <div className="flex items-start gap-4 px-5 py-4">
        <span className="text-2xl font-bold font-mono text-[#3a3a48] w-8 flex-shrink-0 text-right leading-tight mt-0.5">
          {rank}
        </span>

        <DotIndicator color={color} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono font-semibold text-[#e8e8f0]">{fn.name}</span>
            {explorerUrl ? (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#818cf8] hover:underline"
              >
                {contract.name}
                <ExternalLink size={10} />
              </a>
            ) : (
              <span className="text-xs text-[#6b6b80]">{contract.name}</span>
            )}
          </div>

          <p className="text-sm text-[#9494a8] leading-relaxed mb-3">{fn.mainRisk}</p>

          <div className="flex flex-wrap items-center gap-2">
            <ScoreBadge score={fn.score} color={color} label="Score" size="sm" />
            {statusBadge(fn.limites, 'Limites')}
            {statusBadge(fn.delay, 'Delay')}
            <span className="text-xs text-[#6b6b80] font-mono">perm: {fn.permission}</span>
          </div>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="text-[#6b6b80] hover:text-[#e8e8f0] transition-colors flex-shrink-0 mt-1"
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#2a2a35] px-5 py-4 space-y-4 bg-[#13131a]">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#2a2a35] p-3">
              <p className="text-xs text-[#6b6b80] mb-1.5 flex items-center gap-1.5">
                <BarChart2 size={12} />
                Por que sem Limites?
              </p>
              <p className="text-xs text-[#9494a8]">
                {fn.limites === 'Não'
                  ? 'Função com exposição financeira direta ou paramétrica sem mecanismo de cap implementado'
                  : fn.limites === 'Parcial'
                  ? 'Limites existem mas são contornáveis ou cobrem apenas parte da exposição'
                  : fn.limites === 'N/A'
                  ? 'Função sem exposição financeira — limites não são aplicáveis'
                  : 'Limites rigorosos implementados'}
              </p>
            </div>
            <div className="rounded-lg border border-[#2a2a35] p-3">
              <p className="text-xs text-[#6b6b80] mb-1.5 flex items-center gap-1.5">
                <Clock size={12} />
                Por que sem Delay?
              </p>
              <p className="text-xs text-[#9494a8]">
                {fn.delay === 'Não'
                  ? 'Ação crítica executável imediatamente — sem janela de revisão para a comunidade reagir'
                  : fn.delay === 'Parcial'
                  ? 'Rate limit temporal ou multisig como proxy de coordenação, mas sem Timelock on-chain'
                  : fn.delay === 'N/A'
                  ? 'Função permissionless, emergência, ou já protegida por Timelock'
                  : 'Timelock on-chain implementado'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Score por Dimensão
            </p>
            <DimensionTable fn={fn} />
          </div>

          {fn.worstCase && (
            <div className="rounded-lg border border-[#3f1212] bg-[#1e0a0a] p-3">
              <p className="text-xs text-[#ef4444] uppercase tracking-wide mb-1.5 font-semibold">
                Pior Cenário de Exploração
              </p>
              <p className="text-sm text-[#9494a8] leading-relaxed">{fn.worstCase}</p>
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
    <div className="space-y-4">
      <div className="rounded-xl border border-[#3f1212]/60 bg-[#3f1212]/20 p-4">
        <p className="text-sm text-[#ef4444] font-medium mb-1">
          Top 20 Funções Mais Inseguras
        </p>
        <p className="text-xs text-[#9494a8]">
          Ordenadas por score de segurança crescente (2 = mais inseguro). Inclui apenas funções state com score ≤ 5.
          Detalhes sobre ausência de Limites e Delay disponíveis ao expandir.
        </p>
      </div>

      <div className="space-y-3">
        {top20.map((fn, i) => {
          const contract = contracts.find(c => c.id === fn.contractId)!
          return <InsecureCard key={fn.id} fn={fn} contract={contract} rank={i + 1} />
        })}
      </div>
    </div>
  )
}
