'use client'

import { useState, useEffect } from 'react'
import { useAccount, useBalance, useChainId } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowDownUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CHAIN_INFO } from '@/lib/chains'

// 创建类型安全的辅助函数
const getChainInfo = (chainId: number | undefined) => {
    return CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]
}
// 模拟的代币数据
const MOCK_TOKENS = [
  { symbol: 'ETH', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, name: 'Ethereum' },
  { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6, name: 'USD Coin' },
  { symbol: 'DAI', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, name: 'DAI Stablecoin' },
  { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6, name: 'Tether USD' },
  { symbol: 'MATIC', address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', decimals: 18, name: 'Polygon' },
]

// 模拟的报价函数
const getMockQuote = (fromToken: string, toToken: string, amount: string) => {
  if (!amount || parseFloat(amount) <= 0) return null
  
  const mockRates: Record<string, Record<string, number>> = {
    'ETH': { 'USDC': 2500, 'DAI': 2500, 'USDT': 2500, 'MATIC': 2000 },
    'USDC': { 'ETH': 0.0004, 'DAI': 1, 'USDT': 1, 'MATIC': 0.0005 },
    'DAI': { 'ETH': 0.0004, 'USDC': 1, 'USDT': 1, 'MATIC': 0.0005 },
    'USDT': { 'ETH': 0.0004, 'USDC': 1, 'DAI': 1, 'MATIC': 0.0005 },
    'MATIC': { 'ETH': 0.0005, 'USDC': 0.0005, 'DAI': 0.0005, 'USDT': 0.0005 },
  }

  const rate = mockRates[fromToken]?.[toToken]
  if (!rate) return null

  const amountOut = parseFloat(amount) * rate
  const slippage = 0.005 // 0.5%
  const amountOutMin = amountOut * (1 - slippage)
  const priceImpact = Math.random() * 2 // 0-2%

  return {
    amountOut: amountOut.toFixed(6),
    amountOutMin: amountOutMin.toFixed(6),
    priceImpact,
    path: [fromToken, toToken]
  }
}

export function SwapPanel() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [showSettings, setShowSettings] = useState(false)
  
  // Swap状态
  const [fromToken, setFromToken] = useState('ETH')
  const [toToken, setToToken] = useState('USDC')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5) // 0.5%
  const [deadline, setDeadline] = useState(20) // 20分钟
  const [swapStatus, setSwapStatus] = useState<'idle' | 'approving' | 'swapping' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState('')

  // 获取余额
  const { data: fromBalance } = useBalance({
    address,
    chainId,
    token: fromToken !== 'ETH' && fromToken !== 'MATIC' 
      ? MOCK_TOKENS.find(t => t.symbol === fromToken)?.address as `0x${string}`
      : undefined,
    // enabled: isConnected,
  })

  const [quote, setQuote] = useState<any>(null)
  const [isLoadingQuote, setIsLoadingQuote] = useState(false)

  // 当参数变化时获取报价
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amount || parseFloat(amount) <= 0 || !isConnected) {
        setQuote(null)
        return
      }

      setIsLoadingQuote(true)
      try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300))
        const result = getMockQuote(fromToken, toToken, amount)
        setQuote(result)
      } catch (error) {
        console.error('Fetch quote error:', error)
        setQuote(null)
      } finally {
        setIsLoadingQuote(false)
      }
    }

    const timeoutId = setTimeout(fetchQuote, 500) // 防抖
    return () => clearTimeout(timeoutId)
  }, [fromToken, toToken, amount, isConnected])

  // 处理交换
  const handleSwap = async () => {
    if (!quote || !isConnected) return

    setSwapStatus('swapping')
    
    try {
      // 模拟交易延迟
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟交易哈希
      const mockHash = `0x${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setTxHash(mockHash)
      setSwapStatus('success')
      
      // 3秒后重置状态
      setTimeout(() => {
        setSwapStatus('idle')
        setAmount('')
      }, 3000)
    } catch (error) {
      console.error('Swap error:', error)
      setSwapStatus('error')
    }
  }

  // 切换代币
  const handleSwitchTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
    setAmount(quote?.amountOut || '')
  }

  // 设置最大金额
  const handleMaxAmount = () => {
    if (fromBalance) {
      setAmount(parseFloat(fromBalance.formatted).toFixed(4))
    }
  }

  // 重置状态
  const resetSwap = () => {
    setSwapStatus('idle')
    setTxHash('')
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔄 Token Swap
          </CardTitle>
          <CardDescription>
            Connect your wallet to swap tokens
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ArrowDownUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-gray-500">
              Connect your wallet to use the swap feature
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 获取当前链信息
  const currentChainInfo = getChainInfo(chainId)

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              🔄 Token Swap
              <Badge variant="outline" className="ml-2">
                Demo Mode
              </Badge>
            </CardTitle>
            <CardDescription>
              Swap tokens on {currentChainInfo?.name || 'Ethereum'}
            </CardDescription>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* 设置面板 */}
        {showSettings && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Swap Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="slippage">Slippage Tolerance</Label>
                  <span className="text-sm text-gray-500">{slippage}%</span>
                </div>
                <Slider
                  id="slippage"
                  min={0.1}
                  max={5}
                  step={0.1}
                  value={[slippage]}
                  onValueChange={([value]) => setSlippage(value)}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="deadline">Transaction Deadline</Label>
                  <span className="text-sm text-gray-500">{deadline} minutes</span>
                </div>
                <Slider
                  id="deadline"
                  min={1}
                  max={60}
                  step={1}
                  value={[deadline]}
                  onValueChange={([value]) => setDeadline(value)}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 min</span>
                  <span>60 min</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 交换表单 */}
        <div className="space-y-4">
          {/* From Token */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="from-amount">From</Label>
              {fromBalance && (
                <div className="text-sm text-gray-500">
                  Balance: {parseFloat(fromBalance.formatted).toFixed(4)} {fromBalance.symbol}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 ml-2"
                    onClick={handleMaxAmount}
                  >
                    Max
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="from-amount"
                  type="number"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-2xl h-16"
                  step="any"
                  min="0"
                />
              </div>
              
              <div className="w-32">
                <Select value={fromToken} onValueChange={setFromToken}>
                  <SelectTrigger className="h-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TOKENS.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-xs">
                            {token.symbol[0]}
                          </div>
                          {token.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 切换按钮 */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleSwitchTokens}
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label htmlFor="to-amount">To</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="to-amount"
                  type="text"
                  placeholder="0.0"
                  value={quote?.amountOut || ''}
                  readOnly
                  className="text-2xl h-16 bg-gray-50"
                />
              </div>
              
              <div className="w-32">
                <Select value={toToken} onValueChange={setToToken}>
                  <SelectTrigger className="h-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TOKENS.map((token) => (
                      <SelectItem key={token.symbol} value={token.symbol}>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center text-xs">
                            {token.symbol[0]}
                          </div>
                          {token.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 报价信息 */}
          {quote && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Expected Output</p>
                  <p className="font-semibold">
                    {parseFloat(quote.amountOut).toFixed(6)} {toToken}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Minimum Received</p>
                  <p className="font-semibold">
                    {parseFloat(quote.amountOutMin).toFixed(6)} {toToken}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Price Impact</p>
                  <p className={cn(
                    "font-semibold",
                    quote.priceImpact > 1 ? "text-red-600" : "text-green-600"
                  )}>
                    {quote.priceImpact.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Slippage</p>
                  <p className="font-semibold">{slippage}%</p>
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="text-xs text-gray-500">
                <p>Exchange rate: 1 {fromToken} ≈ {getMockQuote('1', fromToken, toToken)?.amountOut || '0'} {toToken}</p>
              </div>
            </div>
          )}

          {/* 交换按钮 */}
          <Button
            onClick={handleSwap}
            disabled={
              !isConnected || 
              !amount || 
              parseFloat(amount) <= 0 || 
              !quote || 
              isLoadingQuote || 
              swapStatus === 'approving' || 
              swapStatus === 'swapping'
            }
            className="w-full h-14 text-lg mt-6"
          >
            {swapStatus === 'idle' && (isLoadingQuote ? 'Fetching quote...' : 'Swap (Demo)')}
            {swapStatus === 'approving' && (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Approving...
              </>
            )}
            {swapStatus === 'swapping' && (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Swapping...
              </>
            )}
            {swapStatus === 'success' && (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Swap Successful!
              </>
            )}
            {swapStatus === 'error' && (
              <>
                <AlertCircle className="mr-2 h-5 w-5" />
                Swap Failed
              </>
            )}
          </Button>

          {/* 状态信息 */}
          {swapStatus === 'success' && txHash && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Demo transaction successful!</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetSwap}
                  className="text-sm"
                >
                  Reset
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                This is a demo. In production, this would be a real transaction.
              </p>
              <div className="mt-2 text-xs font-mono bg-gray-800 text-gray-200 p-2 rounded">
                Tx Hash: {txHash}
              </div>
            </div>
          )}

          {swapStatus === 'error' && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>Demo transaction failed.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSwap}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* 提示信息 */}
          <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Demo Mode Active</p>
                <p>
                  This swap panel is running in demo mode. No real transactions will be executed.
                  Connect to a testnet and implement the swap logic to enable real trading.
                </p>
              </div>
            </div>
          </div>

          {/* 网络信息 */}
          <div className="text-center text-sm text-gray-500 pt-4">
            <p>Powered by Uniswap V2 (Demo) on {currentChainInfo?.name || 'Ethereum'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}