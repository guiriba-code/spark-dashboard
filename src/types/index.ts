export interface Layer {
  id: string
  name: string
  securityScore: number
  relevance: number
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
  relevance: number
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
  limits: string
  delay: string
  access: 1 | 2 | 3
  limitsScore: 1 | 2 | 3
  verifiability: 1 | 2 | 3
  delayScore: 1 | 2 | 3
  relevance: number
  description: string
  worstCase?: string
}

export interface Top30Entry {
  rank: number
  functionId: string
  relevance: number
  securityScore: number
  worstCase?: string
}

export interface RoleHolder {
  address: string | null
  label: string
  type: 'EOA' | 'Multisig' | 'Contract' | null
  safeThreshold: string | null
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | null
  note?: string
}

export interface RoleContract {
  contractId: string
  contractName: string
  network: string
  holders: RoleHolder[]
}

export interface Permission {
  id: string
  name: string
  mechanism: string
  concentration: 'LOW' | 'MEDIUM' | 'HIGH'
  grantedBy: string
  contracts: RoleContract[]
}

export type ScoreColor = 'red' | 'yellow' | 'green'

export function getScoreColor(score: number): ScoreColor {
  if (score <= 3) return 'red'
  if (score <= 7) return 'yellow'
  return 'green'
}

export function getRelevanceColor(value: number): ScoreColor {
  if (value >= 8) return 'red'
  if (value >= 4) return 'yellow'
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
