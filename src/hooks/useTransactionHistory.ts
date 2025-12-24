'use client'

import { useQuery } from '@tanstack/react-query'
import { useAccount, useChainId } from 'wagmi'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'

// ============== 配置部分 ==============

// 模拟交易数据（完全本地化，避免网络请求）
const MOCK_TRANSACTIONS: Record<number, any[]> = {
  1: [
    {
      id: '1',
      hash: '0x8a7b9c1d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
      from: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      to: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
      value: '0.5',
      timestamp: '1702771200',
      tokenSymbol: 'ETH',
      tokenAmount: '0.5',
      type: 'send',
      status: 'success',
      gasUsed: '21000',
      gasPrice: '30',
      chainId: 1,
    },
    {
      id: '2',
      hash: '0x9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7',
      from: '0xDAFEA492D9c6733ae3d56b7Ed1ADB60692c98Bc5',
      to: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      value: '1250',
      timestamp: '1702684800',
      tokenSymbol: 'USDC',
      tokenAmount: '1250',
      type: 'receive',
      status: 'success',
      gasUsed: '65000',
      gasPrice: '25',
      chainId: 1,
    },
    {
      id: '3',
      hash: '0x7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5',
      from: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      to: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
      value: '0',
      timestamp: '1702598400',
      tokenSymbol: 'ETH→USDC',
      tokenAmount: '1.5',
      type: 'swap',
      status: 'success',
      gasUsed: '185000',
      gasPrice: '32',
      chainId: 1,
    },
    {
      id: '4',
      hash: '0xc5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
      from: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      to: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      value: '0',
      timestamp: '1702512000',
      tokenSymbol: 'DAI',
      tokenAmount: '500',
      type: 'approve',
      status: 'success',
      gasUsed: '45000',
      gasPrice: '35',
      chainId: 1,
    },
    {
      id: '5',
      hash: '0xd2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1',
      from: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326',
      to: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      value: '0.1',
      timestamp: '1702425600',
      tokenSymbol: 'ETH',
      tokenAmount: '0.1',
      type: 'receive',
      status: 'success',
      gasUsed: '21000',
      gasPrice: '28',
      chainId: 1,
    },
  ],
  137: [
    {
      id: '6',
      hash: '0xc5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
      from: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      to: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
      value: '0',
      timestamp: '1702512000',
      tokenSymbol: 'DAI',
      tokenAmount: '500',
      type: 'approve',
      status: 'success',
      gasUsed: '45000',
      gasPrice: '150',
      chainId: 137,
    },
    {
      id: '7',
      hash: '0xd2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1',
      from: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      to: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
      value: '0',
      timestamp: '1702425600',
      tokenSymbol: 'USDC',
      tokenAmount: '750',
      type: 'receive',
      status: 'success',
      gasUsed: '55000',
      gasPrice: '120',
      chainId: 137,
    },
  ],
  42161: [
    {
      id: '8',
      hash: '0xe3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2',
      from: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      to: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      value: '0',
      timestamp: '1702339200',
      tokenSymbol: 'USDC',
      tokenAmount: '1000',
      type: 'receive',
      status: 'success',
      gasUsed: '60000',
      gasPrice: '0.1',
      chainId: 42161,
    },
    {
      id: '9',
      hash: '0xf2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1',
      from: '0x742d35Cc6634C0532925a3b844Bc9e94F736f123',
      to: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      value: '0',
      timestamp: '1702252800',
      tokenSymbol: 'ETH→USDT',
      tokenAmount: '0.3',
      type: 'swap',
      status: 'success',
      gasUsed: '220000',
      gasPrice: '0.12',
      chainId: 42161,
    },
  ],
}

// ============== Hook 主体 ==============

export function useTransactionHistory(limit: number = 5) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', address, chainId, limit],
    queryFn: async () => {
      if (!address || !isConnected) {
        return []
      }

      // 完全使用本地模拟数据，避免网络请求
      console.log(`Using mock transaction data for chain ${chainId}`)
      
      // 根据当前链获取模拟数据
      const chainTxs = MOCK_TRANSACTIONS[chainId as keyof typeof MOCK_TRANSACTIONS] || []
      
      // 如果链没有数据，使用以太坊数据作为备用
      if (chainTxs.length === 0) {
        console.warn(`No mock data for chain ${chainId}, using Ethereum data`)
        return MOCK_TRANSACTIONS[1].slice(0, limit)
      }
      
      // 返回指定数量的交易
      return chainTxs.slice(0, limit)
    },
    enabled: isConnected && !!address,
    refetchInterval: 60000, // 每60秒刷新
    staleTime: 30000, // 30秒后视为过时
    
    // 禁用重试，直接使用本地数据
    retry: false,
    
    // 出错时返回空数组
    retryOnMount: false,
  })

  // 格式化时间显示
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(parseInt(timestamp) * 1000)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'Some time ago'
    }
  }

  // 计算交易费用（ETH）
  const calculateTxFee = (gasUsed: string, gasPrice: string): string => {
    try {
      const gasUsedNum = parseInt(gasUsed || '0')
      const gasPriceNum = parseInt(gasPrice || '0')
      const feeWei = gasUsedNum * gasPriceNum
      const feeEth = feeWei / 1e18
      return feeEth.toFixed(6)
    } catch {
      return '0.000000'
    }
  }

  // 获取交易类型颜色
  const getTxTypeColor = (type: string): string => {
    switch (type) {
      case 'send': return 'text-red-600'
      case 'receive': return 'text-green-600'
      case 'swap': return 'text-blue-600'
      case 'approve': return 'text-yellow-600'
      case 'contract': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  // 获取交易类型图标
  const getTxTypeIcon = (type: string): string => {
    switch (type) {
      case 'send': return '↑'
      case 'receive': return '↓'
      case 'swap': return '⇄'
      case 'approve': return '✓'
      case 'contract': return '⚡'
      default: return '⚡'
    }
  }

  return {
    transactions: transactions || [],
    isLoading,
    error,
    refetch,
    formatTime,
    calculateTxFee,
    getTxTypeColor,
    getTxTypeIcon,
    totalTransactions: transactions?.length || 0,
    hasTransactions: (transactions?.length || 0) > 0,
  }
}