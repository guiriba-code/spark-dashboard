import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, AlertTriangle } from 'lucide-react'
import { getScoreColor, getNetworkExplorerUrl } from '../types'
import type { SparkFunction, Contract, Top30Entry } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'

interface Top30TabProps {
  top30: Top30Entry[]
  functions: SparkFunction[]
  contracts: Contract[]
}

function ImpactBadge({ impact }: { impact: number }) {
  const color = impact >= 4 ? 'text-[#ef4444] bg-[#3f1212] border-[#ef4444]/30'
    : impact >= 3 ? 'text-[#f59e0b] bg-[#3f2d0a] border-[#f59e0b]/30'
    : 'text-[#22c55e] bg-[#0d2e1a] border-[#22c55e]/30'
  return (
    <span className={`inline-flex items-center font-mono text-xs px-1.5 py-0.5 rounded border font-semibold ${color}`}>
      Imp {impact}
    </span>
  )
}

function Top30Card({ entry, fn, contract }: { entry: Top30Entry; fn: SparkFunction; contract: Contract }) {
  const [open, setOpen] = useState(false)
  const secColor = getScoreColor(fn.score)

  const primaryAddress = contract.addresses.find(a => a.address)
  const explorerUrl = primaryAddress ? getNetworkExplorerUrl(primaryAddress.network, primaryAddress.address) : ''

  return (
    <div className="border border-[#2a2a35] rounded-xl overflow-hidden">
      <div className="flex items-start gap-4 px-5 py-4">
        <span className="text-2xl font-bold font-mono text-[#3a3a48] w-8 flex-shrink-0 text-right leading-tight mt-0.5">
          {entry.rank}
        </span>

        <DotIndicator color={getScoreColor(entry.impact >= 4 ? 1 : entry.impact >= 3 ? 5 : 9)} />

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
            <ImpactBadge impact={entry.impact} />
            <ScoreBadge score={fn.score} color={secColor} label="Seg" size="sm" />
            <span className="text-xs text-[#6b6b80] font-mono">{fn.permission}</span>
          </div>
        </div>

        {entry.worstCase && (
          <button
            onClick={() => setOpen(!open)}
            className="text-[#6b6b80] hover:text-[#e8e8f0] transition-colors flex-shrink-0 mt-1"
            title="Ver pior cenário"
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>

      {open && entry.worstCase && (
        <div className="border-t border-[#2a2a35] px-5 py-4 bg-[#13131a]">
          <div className="rounded-lg border border-[#3f2d0a] bg-[#1e1a0a] p-4">
            <p className="text-xs text-[#f59e0b] uppercase tracking-wide mb-2 font-semibold flex items-center gap-1.5">
              <AlertTriangle size={12} />
              Pior Cenário de Impacto
            </p>
            <p className="text-sm text-[#9494a8] leading-relaxed">{entry.worstCase}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export function Top30Tab({ top30, functions, contracts }: Top30TabProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#f59e0b]/30 bg-[#3f2d0a]/20 p-4">
        <p className="text-sm text-[#f59e0b] font-medium mb-1">
          Top 30 por Criticidade (Impacto)
        </p>
        <p className="text-xs text-[#9494a8]">
          Ordenadas por impacto potencial no protocolo (4 = catastrófico, 1 = baixo).
          O score de segurança é secundário — uma função pode ser segura mas ter impacto altíssimo.
          Expanda para ver o pior cenário de exploração detalhado.
        </p>
      </div>

      <div className="flex items-center gap-6 text-xs text-[#6b6b80] px-1">
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-[#ef4444]">Imp 4</span> — Catastrófico
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-[#f59e0b]">Imp 3</span> — Severo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono font-semibold text-[#22c55e]">Imp 2</span> — Moderado
        </span>
      </div>

      <div className="space-y-3">
        {top30.map((entry) => {
          const fn = functions.find(f => f.id === entry.functionId)
          const contract = fn ? contracts.find(c => c.id === fn.contractId) : undefined
          if (!fn || !contract) return null
          return (
            <Top30Card
              key={entry.rank}
              entry={entry}
              fn={fn}
              contract={contract}
            />
          )
        })}
      </div>
    </div>
  )
}
