export interface Layer {
  id: string
  name: string
  securityScore: number
  criticidade: number
  contractIds: string[]
}

export interface ContractAddress {
  network: 'mainnet' | 'base' | 'arbitrum'
  address: string
}

export interface Contract {
  id: string
  name: string
  repository: string
  layerId: string
  securityScore: number
  criticidade: number
  addresses: ContractAddress[]
}

export interface SparkFunction {
  id: string
  contractId: string
  name: string
  permission: string
  score: number
  isView: boolean
  mainRisk: string
  concentration: string
  limites: 'Sim' | 'Não' | 'Parcial' | 'N/A'
  delay: 'Sim' | 'Não' | 'Parcial' | 'N/A'
  acesso: 1 | 2 | 3
  limitesScore: 1 | 2 | 3
  verificabilidade: 1 | 2 | 3
  delayScore: 1 | 2 | 3
  impact: number
  worstCase?: string
}

export interface Top30Entry {
  rank: number
  functionId: string
  impact: number
  securityScore: number
  worstCase?: string
}

export type ScoreColor = 'red' | 'yellow' | 'green'

export function getScoreColor(score: number): ScoreColor {
  if (score <= 3) return 'red'
  if (score <= 7) return 'yellow'
  return 'green'
}

export function getCriticalidadeColor(value: number): ScoreColor {
  if (value >= 3.5) return 'red'
  if (value >= 2.5) return 'yellow'
  return 'green'
}

export function getNetworkExplorerUrl(network: string, address: string): string {
  if (!address) return ''
  switch (network) {
    case 'mainnet': return `https://etherscan.io/address/${address}`
    case 'base': return `https://basescan.org/address/${address}`
    case 'arbitrum': return `https://arbiscan.io/address/${address}`
    default: return ''
  }
}
