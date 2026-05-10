import { getScoreColor } from '../types'
import type { SparkFunction } from '../types'
import { ScoreBadge } from './ScoreBadge'

interface DimensionTableProps {
  fn: SparkFunction
}

const dimensionLabels: Record<string, string> = {
  acesso:           'Acesso',
  limitesScore:     'Limites',
  verificabilidade: 'Verificabilidade',
  delayScore:       'Delay',
}

const dimensionDesc: Record<string, Record<number, string>> = {
  acesso: {
    1: 'Chave única / bot / role direta sem delay',
    2: 'Multisig ou role com acesso agrupado',
    3: 'Timelock on-chain + governança OU permissionless',
  },
  limitesScore: {
    1: 'Sem limites — exposição financeira desprotegida',
    2: 'Limites parciais ou contornáveis',
    3: 'Limites rigorosos OU sem exposição financeira (N/A)',
  },
  verificabilidade: {
    1: 'Sem validação — calldata / endereço / amount arbitrário',
    2: 'Validação parcial (alguns parâmetros)',
    3: 'Determinística ou valida todos os inputs',
  },
  delayScore: {
    1: 'Precisa de delay — nenhum existe',
    2: 'Delay parcial (rate limit / multisig)',
    3: 'Timelock presente OU não precisa (N/A)',
  },
}

export function DimensionTable({ fn }: DimensionTableProps) {
  const dimensions = [
    { key: 'acesso',           value: fn.acesso           },
    { key: 'limitesScore',     value: fn.limitesScore     },
    { key: 'verificabilidade', value: fn.verificabilidade },
    { key: 'delayScore',       value: fn.delayScore       },
  ] as const

  return (
    <div style={{ border: '1px solid #1a1a3a', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ background: '#0a0a18', borderBottom: '1px solid #1a1a3a' }}>
            {['DIMENSÃO', 'SCORE', 'AVALIAÇÃO'].map(h => (
              <th
                key={h}
                style={{
                  textAlign: h === 'SCORE' ? 'center' : 'left',
                  padding: '5px 8px',
                  fontFamily: 'Courier New',
                  fontSize: 8,
                  color: '#9090c0',
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dimensions.map(({ key, value }) => (
            <tr
              key={key}
              style={{ borderBottom: '1px solid #1a1a3a' }}
            >
              <td
                style={{
                  padding: '5px 8px',
                  fontFamily: 'Courier New',
                  fontSize: 10,
                  color: '#e0e0ff',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                }}
              >
                {dimensionLabels[key]}
              </td>
              <td style={{ padding: '5px 8px', textAlign: 'center' }}>
                <ScoreBadge
                  score={value}
                  color={getScoreColor(value === 3 ? 10 : value === 2 ? 5 : 2)}
                  size="sm"
                />
              </td>
              <td
                style={{
                  padding: '5px 8px',
                  fontFamily: 'Tahoma, Arial, sans-serif',
                  fontSize: 10,
                  color: '#9090c0',
                }}
              >
                {dimensionDesc[key][value]}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: '#0a0a18' }}>
            <td
              style={{
                padding: '5px 8px',
                fontFamily: 'Courier New',
                fontSize: 10,
                color: '#e0e0ff',
                fontWeight: 'bold',
              }}
            >
              Score Final
            </td>
            <td style={{ padding: '5px 8px', textAlign: 'center' }}>
              <ScoreBadge score={fn.score} color={getScoreColor(fn.score)} size="sm" />
            </td>
            <td
              style={{
                padding: '5px 8px',
                fontFamily: 'Courier New',
                fontSize: 9,
                color: '#9090c0',
              }}
            >
              ({fn.acesso}+{fn.limitesScore}+{fn.verificabilidade}+{fn.delayScore})−2 = {fn.score}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
