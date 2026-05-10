import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { getScoreColor, getCriticalidadeColor, getNetworkExplorerUrl } from '../types'
import type { Contract, SparkFunction } from '../types'
import { ScoreBadge, DotIndicator } from './ScoreBadge'
import { FunctionRow } from './FunctionRow'

interface ContractCardProps {
  contract: Contract
  functions: SparkFunction[]
}

const networkLabel = { mainnet: 'ETH', base: 'Base', arbitrum: 'Arb' }

export function ContractCard({ contract, functions }: ContractCardProps) {
  const [open, setOpen] = useState(false)
  const secColor = getScoreColor(contract.securityScore)
  const critColor = getCriticalidadeColor(contract.criticidade)
  const stateFns = functions.filter(f => !f.isView)
  const viewFns = functions.filter(f => f.isView)

  const addressLinks = contract.addresses.filter(a => a.address)

  return (
    <div className="border border-[#2a2a35] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#1e1e28] transition-colors text-left group"
      >
        <span className="text-[#6b6b80] group-hover:text-[#9494a8] transition-colors">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        <DotIndicator color={secColor} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#e8e8f0]">{contract.name}</span>
            <span className="text-xs text-[#6b6b80] font-mono">{contract.repository}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {addressLinks.map((a) => {
              const url = getNetworkExplorerUrl(a.network, a.address)
              return (
                <a
                  key={a.network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-[#6366f1] hover:text-[#818cf8] hover:underline transition-colors"
                >
                  {networkLabel[a.network as keyof typeof networkLabel]}
                  <ExternalLink size={10} />
                </a>
              )
            })}
            {!addressLinks.length && (
              <span className="text-xs text-[#3a3a48]">endereço não disponível</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-[#6b6b80] mb-0.5">Segurança</p>
            <ScoreBadge score={contract.securityScore} color={secColor} size="sm" />
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6b6b80] mb-0.5">Criticidade</p>
            <ScoreBadge score={contract.criticidade} color={critColor} size="sm" />
          </div>
          <span className="text-xs text-[#3a3a48]">{stateFns.length}f</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-[#2a2a35] bg-[#13131a]">
          {stateFns.length > 0 && (
            <div className="p-4 space-y-2">
              <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-3 font-medium">
                Funções State ({stateFns.length})
              </p>
              {stateFns.map(fn => (
                <FunctionRow key={fn.id} fn={fn} showImpact />
              ))}
            </div>
          )}

          {viewFns.length > 0 && (
            <div className="px-4 pb-4 space-y-2">
              <p className="text-xs text-[#6b6b80] uppercase tracking-wide mb-3 font-medium">
                Funções View/Pure ({viewFns.length})
              </p>
              {viewFns.map(fn => (
                <FunctionRow key={fn.id} fn={fn} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
