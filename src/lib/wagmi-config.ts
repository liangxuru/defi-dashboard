// src/lib/wagmi-config.ts - 完整版本
import { createPublicClient, http, PublicClient } from 'viem'
import { mainnet, polygon, arbitrum } from 'viem/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// 为每个支持的链创建客户端缓存
const clients: Record<number, PublicClient> = {}

// 获取指定链的公共客户端
export const getPublicClient = (chainId: number = 1): PublicClient => {
  // 如果已经有缓存的客户端，直接返回
  if (clients[chainId]) {
    return clients[chainId]
  }

  let chain
  switch (chainId) {
    case 1:
      chain = mainnet
      break
    case 137:
      chain = polygon
      break
    case 42161:
      chain = arbitrum
      break
    default:
      console.warn(`Chain ${chainId} not supported, defaulting to mainnet`)
      chain = mainnet
  }

  const client = createPublicClient({
    chain,
    transport: http(),
  })

  // 缓存客户端
  clients[chainId] = client
  return client
}

// 快捷方式
export const ethereumClient = getPublicClient(1)
export const polygonClient = getPublicClient(137)
export const arbitrumClient = getPublicClient(42161)

// 默认导出（Ethereum主网）
export const publicClient = ethereumClient

// 链信息
export const CHAINS = {
  1: { ...mainnet, name: 'Ethereum', explorer: 'https://etherscan.io' },
  137: { ...polygon, name: 'Polygon', explorer: 'https://polygonscan.com' },
  42161: { ...arbitrum, name: 'Arbitrum', explorer: 'https://arbiscan.io' },
}

export const config = getDefaultConfig({
    appName: 'DeFi Dashboard',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
    chains: [mainnet, polygon, arbitrum],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [arbitrum.id]: http(),
    },
    ssr: true, // 如果你使用Next.js SSR
  })

export default {
  getPublicClient,
  publicClient,
  ethereumClient,
  polygonClient,
  arbitrumClient,
  CHAINS,
}

