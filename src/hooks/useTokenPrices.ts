'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

const COINGECKO_API = 'https://api.coingecko.com/api/v3'

export function useTokenPrices(tokenIds: string[]) {
  return useQuery({
    queryKey: ['tokenPrices', tokenIds],
    queryFn: async () => {
      if (tokenIds.length === 0) return {}

      const response = await axios.get(`${COINGECKO_API}/simple/price`, {
        params: {
          ids: tokenIds.join(','),
          vs_currencies: 'usd',
        },
        timeout: 5000,
      })

      return response.data
    },
    enabled: tokenIds.length > 0,
    staleTime: 60000, // 1分钟
    retry: 2,
  })
}

// 代币ID映射
export const TOKEN_ID_MAP: Record<string, string> = {
  // Ethereum
  'ETH': 'ethereum',
  'USDC': 'usd-coin',
  'DAI': 'dai',
  'USDT': 'tether',
  'WBTC': 'wrapped-bitcoin',
  
  // Polygon
  'MATIC': 'matic-network',
  'WMATIC': 'matic-network',
  
  // Arbitrum
  'ARB': 'arbitrum',
}