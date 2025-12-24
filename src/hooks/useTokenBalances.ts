'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount, useBalance, useChainId, usePublicClient } from 'wagmi'
import { erc20Abi } from 'viem'

// 常用ERC-20代币地址（仅包含已验证的地址）
const VERIFIED_TOKENS = {
  1: {
    // Ethereum Mainnet
    USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  137: {
    // Polygon Mainnet
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // 这是WMATIC地址，不是原生MATIC
  },
  42161: {
    // Arbitrum Mainnet
    USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  }
} as const

interface TokenBalance {
  address: string
  symbol: string
  balance: string
  decimals: number
  usdValue?: number
}

export function useTokenBalances() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const publicClient = usePublicClient()

  // 获取原生代币余额（ETH/MATIC）
  const { data: nativeBalance, refetch: refetchNative } = useBalance({
    address,
    chainId,
    // enabled: isConnected,
  })

  // 获取ERC-20代币余额（简化版本，避免错误）
  const { data: tokenBalances, isLoading, refetch } = useQuery({
    queryKey: ['tokenBalances', address, chainId],
    queryFn: async () => {
      if (!address || !isConnected || !publicClient) return []

      const chainTokens = VERIFIED_TOKENS[chainId as keyof typeof VERIFIED_TOKENS]
      if (!chainTokens) return []

      const balances: TokenBalance[] = []

      // 添加原生代币
      if (nativeBalance) {
        balances.push({
          address: 'native',
          symbol: nativeBalance.symbol,
          balance: nativeBalance.formatted,
          decimals: nativeBalance.decimals,
        })
      }

      // 只获取稳定币余额，避免复杂的代币检测
      for (const [symbol, tokenAddress] of Object.entries(chainTokens)) {
        try {
          // 使用公共客户端直接调用
          const [balance, decimals] = await Promise.all([
            publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [address],
            }),
            publicClient.readContract({
              address: tokenAddress as `0x${string}`,
              abi: erc20Abi,
              functionName: 'decimals',
            }),
          ])

          // 格式化余额
          const balanceBigInt = balance as bigint
          const formattedBalance = Number(balanceBigInt) / Math.pow(10, Number(decimals))

          // 只显示有余额的代币
          if (formattedBalance > 0.01) { // 过滤掉很小的余额
            balances.push({
              address: tokenAddress,
              symbol,
              balance: formattedBalance.toString(),
              decimals: Number(decimals),
            })
          }
        } catch (error) {
          // 静默处理错误，继续下一个代币
          console.debug(`Failed to fetch ${symbol} balance:`, error)
        }
      }

      return balances
    },
    enabled: isConnected && !!publicClient,
    refetchInterval: 30000, // 30秒更新一次
    retry: 1,
  })

  // 手动刷新余额
  const refreshBalances = async () => {
    await refetchNative()
    await refetch()
  }

  return {
    nativeBalance,
    tokenBalances: tokenBalances || [],
    isLoading,
    isConnected,
    refreshBalances,
    totalTokens: (tokenBalances?.length || 0) + (nativeBalance ? 1 : 0),
  }
}