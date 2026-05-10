import { useState } from 'react'
import { ChevronDown, ChevronRight, AlertTriangle, Clock, BarChart2, Shield } from 'lucide-react'
import { getScoreColor } from '../types'
import type { SparkFunction } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'
import { DimensionTable } from './DimensionTable'

interface FunctionRowProps {
  fn: SparkFunction
  showImpact?: boolean
}

const statusBadge = (value: 'Sim' | 'Não' | 'Parcial' | 'N/A', label: string) => {
  const colorMap = {
    'Sim': 'bg-[#0d2e1a] text-[#22c55e] border-[#22c55e]/30',
    'Não': 'bg-[#3f1212] text-[#ef4444] border-[#ef4444]/30',
    'Parcial': 'bg-[#3f2d0a] text-[#f59e0b] border-[#f59e0b]/30',
    'N/A': 'bg-[#1a1a22] text-[#6b6b80] border-[#2a2a35]',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border font-medium ${colorMap[value]}`}>
      {label}: {value}
    </span>
  )
}

export function FunctionRow({ fn, showImpact = false }: FunctionRowProps) {
  const [open, setOpen] = useState(false)
  const color = getScoreColor(fn.score)

  return (
    <div className="border border-[#2a2a35] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1e1e28] transition-colors text-left"
      >
        <span className="text-[#6b6b80]">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>

        <DotIndicator color={color} />

        <span className="font-mono text-sm text-[#e8e8f0] flex-1 min-w-0 truncate">
          {fn.name}
        </span>

        <div className="flex items-center gap-2 flex-shrink-0">
          {showImpact && (
            <ScoreBadge score={fn.impact} color={getScoreColor(fn.impact >= 4 ? 1 : fn.impact >= 3 ? 5 : 8)} label="Imp" size="sm" />
          )}
          <ScoreBadge score={fn.score} color={color} label="Seg" size="sm" />
          {statusBadge(fn.limites, 'L')}
          {statusBadge(fn.delay, 'D')}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#2a2a35] px-4 py-4 space-y-4 bg-[#16161d]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-1">Permissão</p>
              <p className="text-sm text-[#e8e8f0] font-mono">{fn.permission}</p>
            </div>
            <div>
              <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-1">Concentração</p>
              <p className="text-sm text-[#e8e8f0]">{fn.concentration}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Risco Principal
            </p>
            <p className="text-sm text-[#9494a8] leading-relaxed">{fn.mainRisk}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#2a2a35] p-3">
              <p className="text-xs text-[#6b6b80] mb-1.5 flex items-center gap-1.5">
                <BarChart2 size={12} />
                Limites de Exposição
              </p>
              <div className="flex items-center gap-2">
                {statusBadge(fn.limites, 'Limites')}
                <span className="text-xs text-[#6b6b80]">
                  {fn.limites === 'N/A' ? 'Não precisa (sem exposição financeira)' :
                   fn.limites === 'Sim' ? 'Limites rigorosos implementados' :
                   fn.limites === 'Parcial' ? 'Limites parciais ou contornáveis' :
                   'Precisa de limites — nenhum implementado'}
                </span>
              </div>
            </div>
            <div className="rounded-lg border border-[#2a2a35] p-3">
              <p className="text-xs text-[#6b6b80] mb-1.5 flex items-center gap-1.5">
                <Clock size={12} />
                Mecanismo de Delay
              </p>
              <div className="flex items-center gap-2">
                {statusBadge(fn.delay, 'Delay')}
                <span className="text-xs text-[#6b6b80]">
                  {fn.delay === 'N/A' ? 'Não precisa (permissionless ou emergência)' :
                   fn.delay === 'Sim' ? 'Timelock on-chain presente' :
                   fn.delay === 'Parcial' ? 'Delay parcial (rate limit / multisig)' :
                   'Precisa de delay — nenhum implementado'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Shield size={12} />
              Score por Dimensão
            </p>
            <DimensionTable fn={fn} />
          </div>

          {fn.worstCase && (
            <div className="rounded-lg border border-[#3f2d0a] bg-[#1e1a0a] p-3">
              <p className="text-xs text-[#f59e0b] uppercase tracking-wide mb-1.5 font-semibold">
                Pior Cenário
              </p>
              <p className="text-sm text-[#9494a8] leading-relaxed">{fn.worstCase}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
