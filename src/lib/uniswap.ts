// Uniswap V2 配置和工具（简化版本，用于Demo模式）
import { createPublicClient, http, getContract } from 'viem'
import { mainnet, polygon, arbitrum } from 'viem/chains'

// ============== 配置常量 ==============

// Uniswap V2 Router 地址
export const UNISWAP_V2_ROUTER_ADDRESSES = {
  1: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Ethereum
  137: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // Polygon
  42161: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506', // Arbitrum
} as const

// 常用代币列表（主网）
export const COMMON_TOKENS = {
  1: {
    // Ethereum Mainnet
    ETH: { 
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 
      symbol: 'ETH', 
      decimals: 18,
      name: 'Ethereum',
      color: '#627EEA'
    },
    USDC: { 
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 
      symbol: 'USDC', 
      decimals: 6,
      name: 'USD Coin',
      color: '#2775CA'
    },
    DAI: { 
      address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', 
      symbol: 'DAI', 
      decimals: 18,
      name: 'DAI Stablecoin',
      color: '#F5AC37'
    },
    USDT: { 
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', 
      symbol: 'USDT', 
      decimals: 6,
      name: 'Tether USD',
      color: '#26A17B'
    },
  },
  137: {
    // Polygon Mainnet
    MATIC: { 
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 
      symbol: 'MATIC', 
      decimals: 18,
      name: 'Polygon',
      color: '#8247E5'
    },
    USDC: { 
      address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 
      symbol: 'USDC', 
      decimals: 6,
      name: 'USD Coin',
      color: '#2775CA'
    },
    DAI: { 
      address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 
      symbol: 'DAI', 
      decimals: 18,
      name: 'DAI Stablecoin',
      color: '#F5AC37'
    },
    USDT: { 
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', 
      symbol: 'USDT', 
      decimals: 6,
      name: 'Tether USD',
      color: '#26A17B'
    },
  },
  42161: {
    // Arbitrum Mainnet
    ETH: { 
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 
      symbol: 'ETH', 
      decimals: 18,
      name: 'Ethereum',
      color: '#28A0F0'
    },
    USDC: { 
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', 
      symbol: 'USDC', 
      decimals: 6,
      name: 'USD Coin',
      color: '#2775CA'
    },
    DAI: { 
      address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', 
      symbol: 'DAI', 
      decimals: 18,
      name: 'DAI Stablecoin',
      color: '#F5AC37'
    },
    USDT: { 
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', 
      symbol: 'USDT', 
      decimals: 6,
      name: 'Tether USD',
      color: '#26A17B'
    },
  },
} as const

// ============== 工具函数 ==============

// 获取公共客户端（用于只读操作）
export const getPublicClient = (chainId: number = 1) => {
  const chain = 
    chainId === 1 ? mainnet :
    chainId === 137 ? polygon :
    chainId === 42161 ? arbitrum : mainnet
  
  return createPublicClient({
    chain,
    transport: http()
  })
}

// 获取链上的代币列表
export function getChainTokens(chainId: number) {
  const tokens = COMMON_TOKENS[chainId as keyof typeof COMMON_TOKENS]
  if (!tokens) {
    console.warn(`No tokens configured for chain ${chainId}, using Ethereum mainnet tokens`)
    return COMMON_TOKENS[1]
  }
  return tokens
}

// 获取代币信息
export function getTokenInfo(chainId: number, symbol: string) {
  const tokens = getChainTokens(chainId)
  return tokens[symbol as keyof typeof tokens]
}

// 检查是否是原生代币（ETH/MATIC）
export function isNativeToken(symbol: string): boolean {
  return symbol === 'ETH' || symbol === 'MATIC'
}

// 获取代币符号的显示名称
export function getTokenDisplayName(symbol: string): string {
  const names: Record<string, string> = {
    'ETH': 'Ethereum',
    'MATIC': 'Polygon',
    'USDC': 'USD Coin',
    'DAI': 'DAI',
    'USDT': 'Tether',
    'WBTC': 'Wrapped Bitcoin',
    'WETH': 'Wrapped ETH',
    'WMATIC': 'Wrapped MATIC',
    'ARB': 'Arbitrum',
  }
  return names[symbol] || symbol
}

// 获取代币颜色
export function getTokenColor(symbol: string): string {
  const colors: Record<string, string> = {
    'ETH': '#627EEA',
    'MATIC': '#8247E5',
    'USDC': '#2775CA',
    'DAI': '#F5AC37',
    'USDT': '#26A17B',
    'WBTC': '#F7931A',
    'WETH': '#627EEA',
    'WMATIC': '#8247E5',
    'ARB': '#28A0F0',
  }
  return colors[symbol] || '#666666'
}

// ============== 模拟函数（Demo模式） ==============

// 模拟获取报价
export async function getMockQuote(
  fromTokenSymbol: string,
  toTokenSymbol: string,
  amount: string,
  chainId: number = 1
): Promise<{
  amountOut: string
  amountOutMin: string
  path: string[]
  priceImpact: number
} | null> {
  if (!amount || parseFloat(amount) <= 0) return null

  // 模拟汇率
  const mockRates: Record<string, Record<string, number>> = {
    'ETH': { 
      'USDC': 2500, 
      'DAI': 2500, 
      'USDT': 2500, 
      'MATIC': 2000 
    },
    'MATIC': { 
      'ETH': 0.0005, 
      'USDC': 0.8, 
      'DAI': 0.8, 
      'USDT': 0.8 
    },
    'USDC': { 
      'ETH': 0.0004, 
      'DAI': 1, 
      'USDT': 1, 
      'MATIC': 1.25 
    },
    'DAI': { 
      'ETH': 0.0004, 
      'USDC': 1, 
      'USDT': 1, 
      'MATIC': 1.25 
    },
    'USDT': { 
      'ETH': 0.0004, 
      'USDC': 1, 
      'DAI': 1, 
      'MATIC': 1.25 
    },
  }

  const rate = mockRates[fromTokenSymbol]?.[toTokenSymbol]
  if (!rate) {
    console.warn(`No mock rate found for ${fromTokenSymbol} -> ${toTokenSymbol}`)
    return null
  }

  const amountOut = parseFloat(amount) * rate
  const slippage = 0.005 // 0.5%
  const amountOutMin = amountOut * (1 - slippage)
  
  // 模拟价格影响（0-2%）
  const priceImpact = Math.random() * 2

  // 模拟路径
  const path = [fromTokenSymbol, toTokenSymbol]

  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  return {
    amountOut: amountOut.toFixed(6),
    amountOutMin: amountOutMin.toFixed(6),
    path,
    priceImpact,
  }
}

// 模拟检查授权
export async function mockCheckAllowance(): Promise<boolean> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 200))
  return Math.random() > 0.5 // 50%概率返回已授权
}

// 模拟授权代币
export async function mockApproveToken(): Promise<boolean> {
  // 模拟交易延迟
  await new Promise(resolve => setTimeout(resolve, 1500))
  console.log('Demo: Token approved successfully')
  return true
}

// 模拟执行交换
export async function mockExecuteSwap(params: {
  fromToken: string
  toToken: string
  amount: string
  slippage: number
  deadline: number
}): Promise<{ success: boolean; hash?: string }> {
  console.log('Demo: Executing swap with params:', params)
  
  // 模拟交易延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 生成模拟交易哈希
  const mockHash = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  
  return {
    success: true,
    hash: mockHash
  }
}

// ============== 真实交易函数（占位符） ==============

// 真实获取报价（待实现）
export async function getRealQuote(
  fromTokenSymbol: string,
  toTokenSymbol: string,
  amount: string,
  chainId: number
): Promise<any> {
  console.log('Real quote function called (not implemented yet)')
  return getMockQuote(fromTokenSymbol, toTokenSymbol, amount, chainId)
}

// 真实执行交换（待实现）
export async function executeRealSwap(): Promise<any> {
  console.log('Real swap function called (not implemented yet)')
  return mockExecuteSwap({
    fromToken: 'ETH',
    toToken: 'USDC',
    amount: '0.1',
    slippage: 0.5,
    deadline: 20
  })
}

// ============== 辅助函数 ==============

// 计算滑点后的最小输出
export function calculateMinAmountOut(
  amountOut: string,
  slippage: number
): string {
  const amount = parseFloat(amountOut)
  const minAmount = amount * (1 - slippage / 100)
  return minAmount.toFixed(6)
}

// 计算交易截止时间戳
export function calculateDeadline(minutes: number): number {
  const now = Math.floor(Date.now() / 1000)
  return now + (minutes * 60)
}

// 格式化代币金额
export function formatTokenAmount(amount: string, decimals: number = 18): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return '0'
  
  // 根据小数位数调整显示精度
  let precision = 4
  if (decimals <= 6) precision = 6
  if (num < 0.001) precision = 8
  
  return num.toFixed(precision).replace(/\.?0+$/, '')
}

// 获取所有可用代币符号
export function getAllTokenSymbols(chainId: number): string[] {
  const tokens = getChainTokens(chainId)
  return Object.keys(tokens)
}

// 添加这个函数到 uniswap.ts
export function getTokenBySymbol(chainId: number, symbol: string) {
    const chainTokens = COMMON_TOKENS[chainId as keyof typeof COMMON_TOKENS]
    if (!chainTokens) return null
    
    // 安全地访问代币
    return (chainTokens as Record<string, any>)[symbol] || null
  }

// 默认导出
export default {
  // 配置
  UNISWAP_V2_ROUTER_ADDRESSES,
  COMMON_TOKENS,
  
  // 工具函数
  getPublicClient,
  getChainTokens,
  getTokenInfo,
  isNativeToken,
  getTokenDisplayName,
  getTokenColor,
  
  // 模拟函数
  getMockQuote,
  mockCheckAllowance,
  mockApproveToken,
  mockExecuteSwap,
  
  // 真实函数（占位符）
  getRealQuote,
  executeRealSwap,
  
  // 辅助函数
  calculateMinAmountOut,
  calculateDeadline,
  formatTokenAmount,
  getAllTokenSymbols,
}