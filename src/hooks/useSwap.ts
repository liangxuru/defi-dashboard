'use client'

import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { 
  getMockQuote, 
  mockExecuteSwap,
  getChainTokens,
  getTokenInfo,
  isNativeToken,
  calculateMinAmountOut,
  calculateDeadline,
  getAllTokenSymbols
} from '@/lib/uniswap'
import { useTokenPrices, TOKEN_ID_MAP } from '@/hooks/useTokenPrices'

interface SwapParams {
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  deadline: number
}

interface QuoteResult {
  amountOut: string
  amountOutMin: string
  path: string[]
  priceImpact: number
  exchangeRate: string
}

interface SwapStatus {
  status: 'idle' | 'loading' | 'approving' | 'swapping' | 'success' | 'error'
  message?: string
  txHash?: string
}

export function useSwap() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  
  const [swapStatus, setSwapStatus] = useState<SwapStatus>({ status: 'idle' })
  const [availableTokens, setAvailableTokens] = useState<string[]>([])

  // 初始化可用代币
  useEffect(() => {
    if (chainId) {
      const tokens = getAllTokenSymbols(chainId)
      setAvailableTokens(tokens)
    }
  }, [chainId])

  // 获取报价
  const getQuote = async (params: SwapParams): Promise<QuoteResult | null> => {
    try {
      const { fromToken, toToken, amount } = params
      
      if (!isConnected || !amount || parseFloat(amount) <= 0) {
        return null
      }

      // 使用模拟报价
      const quote = await getMockQuote(fromToken, toToken, amount, chainId)
      if (!quote) return null

      // 计算汇率
      const fromAmount = parseFloat(amount)
      const toAmount = parseFloat(quote.amountOut)
      const exchangeRate = fromAmount > 0 ? (toAmount / fromAmount).toFixed(6) : '0'

      return {
        ...quote,
        exchangeRate,
      }
    } catch (error) {
      console.error('Error getting quote:', error)
      return null
    }
  }

  // 检查余额是否充足
  const checkBalance = async (
    fromToken: string, 
    amount: string, 
    currentBalance?: string
  ): Promise<{ hasBalance: boolean; requiredBalance: string }> => {
    if (!currentBalance) {
      return { hasBalance: false, requiredBalance: amount }
    }

    const hasBalance = parseFloat(currentBalance) >= parseFloat(amount)
    return { 
      hasBalance, 
      requiredBalance: amount 
    }
  }

  // 获取代币的USD价格
  const getTokenUSDValue = (tokenSymbol: string, amount: string): number => {
    const tokenId = TOKEN_ID_MAP[tokenSymbol]
    // 这里可以调用 useTokenPrices hook 获取实际价格
    // 暂时返回模拟价格
    const mockPrices: Record<string, number> = {
      'ETH': 2500,
      'MATIC': 0.8,
      'USDC': 1,
      'DAI': 1,
      'USDT': 1,
    }
    
    const price = mockPrices[tokenSymbol] || 1
    return parseFloat(amount) * price
  }

  // 执行交换
  const executeSwap = async (params: SwapParams): Promise<boolean> => {
    if (!isConnected || !address) {
      setSwapStatus({ 
        status: 'error', 
        message: 'Wallet not connected' 
      })
      return false
    }

    try {
      // 开始交换流程
      setSwapStatus({ 
        status: 'swapping', 
        message: 'Initiating swap...' 
      })

      // 模拟执行交换
      const result = await mockExecuteSwap({
        fromToken: params.fromToken,
        toToken: params.toToken,
        amount: params.amount,
        slippage: params.slippage,
        deadline: params.deadline,
      })

      if (result.success) {
        setSwapStatus({
          status: 'success',
          message: 'Swap completed successfully!',
          txHash: result.hash,
        })
        
        // 5秒后重置状态
        setTimeout(() => {
          setSwapStatus({ status: 'idle' })
        }, 5000)
        
        return true
      } else {
        setSwapStatus({
          status: 'error',
          message: 'Swap failed. Please try again.',
        })
        return false
      }
    } catch (error: any) {
      console.error('Swap execution error:', error)
      
      setSwapStatus({
        status: 'error',
        message: error.message || 'An error occurred during swap',
      })
      
      return false
    }
  }

  // 模拟授权（如果需要）
  const approveToken = async (tokenAddress: string, amount: string): Promise<boolean> => {
    try {
      setSwapStatus({
        status: 'approving',
        message: 'Approving token...',
      })

      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 1500))

      console.log(`Demo: Approved ${amount} of token at ${tokenAddress}`)
      return true
    } catch (error) {
      console.error('Approve error:', error)
      setSwapStatus({
        status: 'error',
        message: 'Token approval failed',
      })
      return false
    }
  }

  // 重置状态
  const resetSwap = () => {
    setSwapStatus({ status: 'idle' })
  }

  // 获取代币信息
  const getTokenDetails = (symbol: string) => {
    return getTokenInfo(chainId, symbol)
  }

  // 检查是否是原生代币
  const isTokenNative = (symbol: string) => {
    return isNativeToken(symbol)
  }

  // 获取链上的所有代币
  const getTokensForCurrentChain = () => {
    return getChainTokens(chainId)
  }

  // 格式化金额显示
  const formatAmount = (amount: string, tokenSymbol: string): string => {
    const token = getTokenInfo(chainId, tokenSymbol)
    const decimals = token?.decimals || 18
    
    const num = parseFloat(amount)
    if (isNaN(num)) return '0'
    
    // 根据金额大小调整显示精度
    if (num === 0) return '0'
    if (num < 0.0001) return num.toExponential(4)
    if (num < 1) return num.toFixed(6).replace(/\.?0+$/, '')
    if (num < 1000) return num.toFixed(4).replace(/\.?0+$/, '')
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // 计算预估Gas费用（模拟）
  const estimateGasFee = async (params: SwapParams): Promise<string> => {
    // 模拟Gas估算
    const baseGas = isNativeToken(params.fromToken) ? 0.001 : 0.002
    const token = getTokenInfo(chainId, params.fromToken)
    const tokenPrice = getTokenUSDValue(params.fromToken, '1')
    
    const gasInETH = baseGas * parseFloat(params.amount)
    const gasInUSD = gasInETH * tokenPrice
    
    return gasInUSD.toFixed(2)
  }

  return {
    // 状态
    swapStatus,
    availableTokens,
    isConnected,
    
    // 主要功能
    getQuote,
    executeSwap,
    approveToken,
    resetSwap,
    
    // 工具函数
    checkBalance,
    getTokenUSDValue,
    getTokenDetails,
    isTokenNative,
    getTokensForCurrentChain,
    formatAmount,
    estimateGasFee,
    
    // 链信息
    currentChainId: chainId,
    currentAddress: address,
  }
}