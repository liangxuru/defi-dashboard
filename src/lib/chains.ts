import { mainnet, polygon, arbitrum } from 'wagmi/chains'

export const SUPPORTED_CHAINS = [mainnet, polygon, arbitrum]

export const CHAIN_INFO = {
  [mainnet.id]: {
    name: 'Ethereum',
    symbol: 'ETH',
    logo: '🟢',
    explorer: 'https://etherscan.io',
  },
  [polygon.id]: {
    name: 'Polygon',
    symbol: 'MATIC',
    logo: '🟣',
    explorer: 'https://polygonscan.com',
  },
  [arbitrum.id]: {
    name: 'Arbitrum',
    symbol: 'ETH',
    logo: '🔵',
    explorer: 'https://arbiscan.io',
  },
} as const