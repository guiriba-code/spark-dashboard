import { getScoreColor } from '../types'
import type { SparkFunction } from '../types'
import { ScoreBadge } from './ScoreBadge'

interface DimensionTableProps {
  fn: SparkFunction
}

const dimensionLabels = {
  acesso: 'Acesso',
  limitesScore: 'Limites',
  verificabilidade: 'Verificabilidade',
  delayScore: 'Delay',
}

const dimensionDescriptions: Record<string, Record<number, string>> = {
  acesso: {
    1: 'Chave única / bot / role direta sem delay',
    2: 'Multisig ou role com acesso agrupado',
    3: 'Timelock on-chain + governança OU permissionless',
  },
  limitesScore: {
    1: 'Sem limites quando há exposição financeira',
    2: 'Limites parciais ou contornáveis',
    3: 'Limites rigorosos OU sem exposição financeira (N/A)',
  },
  verificabilidade: {
    1: 'Sem validação — aceita qualquer calldata / endereço / amount',
    2: 'Validação parcial (verifica alguns parâmetros)',
    3: 'Determinística ou valida todos os inputs rigorosamente',
  },
  delayScore: {
    1: 'Função precisa de delay, nenhum existe',
    2: 'Delay parcial (rate limit temporal / multisig)',
    3: 'Delay adequado presente (Timelock) OU não precisa (N/A)',
  },
}

export function DimensionTable({ fn }: DimensionTableProps) {
  const dimensions = [
    { key: 'acesso', value: fn.acesso },
    { key: 'limitesScore', value: fn.limitesScore },
    { key: 'verificabilidade', value: fn.verificabilidade },
    { key: 'delayScore', value: fn.delayScore },
  ] as const

  return (
    <div className="rounded-lg border border-[#2a2a35] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a2a35] bg-[#1a1a22]">
            <th className="text-left px-3 py-2 text-[#6b6b80] font-medium">Dimensão</th>
            <th className="text-center px-3 py-2 text-[#6b6b80] font-medium w-16">Score</th>
            <th className="text-left px-3 py-2 text-[#6b6b80] font-medium">Avaliação</th>
          </tr>
        </thead>
        <tbody>
          {dimensions.map(({ key, value }) => (
            <tr key={key} className="border-b border-[#2a2a35]/50 last:border-0 hover:bg-[#1e1e28]/50">
              <td className="px-3 py-2.5 font-medium text-[#e8e8f0]">
                {dimensionLabels[key as keyof typeof dimensionLabels]}
              </td>
              <td className="px-3 py-2.5 text-center">
                <ScoreBadge score={value} color={getScoreColor(value === 3 ? 10 : value === 2 ? 5 : 2)} size="sm" />
              </td>
              <td className="px-3 py-2.5 text-[#9494a8]">
                {dimensionDescriptions[key][value]}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-[#1a1a22]">
            <td className="px-3 py-2.5 font-semibold text-[#e8e8f0]">Score Final</td>
            <td className="px-3 py-2.5 text-center">
              <ScoreBadge score={fn.score} color={getScoreColor(fn.score)} size="sm" />
            </td>
            <td className="px-3 py-2.5 text-[#9494a8] text-xs font-mono">
              ({fn.acesso} + {fn.limitesScore} + {fn.verificabilidade} + {fn.delayScore}) − 2 = {fn.score}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
