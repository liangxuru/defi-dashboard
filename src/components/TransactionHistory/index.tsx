'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTransactionHistory } from '@/hooks/useTransactionHistory'
import { 
  ExternalLink,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Repeat,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react'
import { useAccount, useChainId } from 'wagmi'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { CHAIN_INFO } from '@/lib/chains'

interface TransactionHistoryProps {
  limit?: number
  showTitle?: boolean
  compact?: boolean
}

// 定义交易类型
interface Transaction {
  id: string
  hash: string
  from: string
  to: string
  value: string
  timestamp: string
  tokenSymbol?: string
  tokenAmount?: string
  type: string  // 或者更具体的类型：'send' | 'receive' | 'swap' | 'approve' | 'contract'
  status: 'success' | 'failed'
  gasUsed: string
  gasPrice: string
  chainId: number
}

// 交易类型定义
type TransactionType = 'send' | 'receive' | 'swap' | 'approve' | 'contract'

export function TransactionHistory({ 
  limit = 5, 
  showTitle = true,
  compact = false 
}: TransactionHistoryProps) {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const [txFilter, setTxFilter] = useState<'all' | 'send' | 'receive' | 'swap'>('all')
  
  const {
    transactions,
    isLoading,
    refetch,
    formatTime,
    calculateTxFee,
    getTxTypeColor,
    getTxTypeIcon,
    totalTransactions,
    hasTransactions,
  } = useTransactionHistory(limit)

  // 过滤交易 - 使用明确的Transaction类型
  const filteredTransactions = txFilter === 'all' 
    ? transactions 
    : transactions.filter((tx: Transaction) => {
        // 现在tx有明确的类型
        return String(tx.type) === txFilter
      })

  // 安全获取浏览器链接
  const getExplorerUrl = () => {
    if (!chainId) return 'https://etherscan.io'
    
    const numericChainId = Number(chainId)
    const chainInfo = CHAIN_INFO[numericChainId as keyof typeof CHAIN_INFO]
    
    return chainInfo?.explorer || 'https://etherscan.io'
  }

  const handleViewOnExplorer = (hash: string) => {
    const explorer = getExplorerUrl()
    window.open(`${explorer}/tx/${hash}`, '_blank')
  }

  const handleRefresh = async () => {
    await refetch()
  }

  // 获取交易类型颜色
  const getTransactionTypeColor = (type: string): string => {
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
  const getTransactionTypeIcon = (type: string): React.ReactNode => {
    switch (type) {
      case 'send': return <ArrowUpRight className="h-5 w-5" />
      case 'receive': return <ArrowDownLeft className="h-5 w-5" />
      case 'swap': return <Repeat className="h-5 w-5" />
      case 'approve': return <CheckCircle className="h-5 w-5" />
      case 'contract': return '⚡'
      default: return '⚡'
    }
  }

  // 获取查看所有交易的链接
  const getAllTransactionsUrl = () => {
    if (!address) return '#'
    const explorer = getExplorerUrl()
    return `${explorer}/address/${address}`
  }

  // 渲染交易列表项
  const renderTransactionItem = (tx: Transaction) => {
    const txFee = calculateTxFee(tx.gasUsed, tx.gasPrice)
    const txTypeColor = getTransactionTypeColor(tx.type)
    
    return (
      <div key={tx.id} className="group p-4 border rounded-lg hover:bg-gray-50 transition">
        <div className="flex items-start justify-between">
          {/* 左侧：交易信息 */}
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txTypeColor}`}>
              {getTransactionTypeIcon(tx.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`font-medium capitalize ${txTypeColor}`}>
                  {tx.type}
                </span>
                {tx.status === 'success' ? (
                  <Badge variant="outline" className="border-green-200 text-green-700">
                    Success
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-red-200 text-red-700">
                    Failed
                  </Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                {tx.tokenSymbol && tx.tokenAmount && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {tx.tokenAmount} {tx.tokenSymbol}
                    </span>
                  </div>
                )}
                
                {!compact && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">From:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {tx.from.slice(0, 8)}...{tx.from.slice(-6)}
                      </code>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs">To:</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {tx.to.slice(0, 8)}...{tx.to.slice(-6)}
                      </code>
                    </div>
                  </>
                )}
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{formatTime(tx.timestamp)}</span>
                  {txFee !== '0.000000' && (
                    <span>Fee: {txFee} ETH</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewOnExplorer(tx.hash)}
              className="h-8 w-8 p-0"
              title="View on Explorer"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* 交易哈希（紧凑显示） */}
        {compact && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <code className="text-gray-500 truncate max-w-[200px]">
                {tx.hash.slice(0, 20)}...{tx.hash.slice(-20)}
              </code>
              <span className="text-gray-400">
                Chain: {CHAIN_INFO[tx.chainId as keyof typeof CHAIN_INFO]?.name || tx.chainId}
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!isConnected) {
    return (
      <Card className="w-full">
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Transaction History
            </CardTitle>
            <CardDescription>
              Connect your wallet to view transaction history
            </CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Wallet Not Connected
            </h3>
            <p className="text-gray-500">
              Connect your wallet to view your transaction history
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              📊 Transaction History
              {hasTransactions && (
                <Badge variant="secondary" className="ml-2">
                  {totalTransactions} TXs
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Recent transactions on {CHAIN_INFO[chainId as keyof typeof CHAIN_INFO]?.name || 'current network'}
              {address && (
                <span className="ml-2 text-xs">
                  ({address.slice(0, 6)}...{address.slice(-4)})
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 过滤器 */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              <Button
                variant={txFilter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTxFilter('all')}
                className="h-7 px-2"
              >
                All
              </Button>
              <Button
                variant={txFilter === 'send' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTxFilter('send')}
                className="h-7 px-2"
              >
                Send
              </Button>
              <Button
                variant={txFilter === 'receive' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTxFilter('receive')}
                className="h-7 px-2"
              >
                Receive
              </Button>
              <Button
                variant={txFilter === 'swap' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTxFilter('swap')}
                className="h-7 px-2"
              >
                Swap
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          // 加载状态
          <div className="space-y-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : hasTransactions ? (
          // 交易列表
          <div className="space-y-3">
            {filteredTransactions.map(renderTransactionItem)}
            
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  No transactions found
                </h3>
                <p className="text-gray-500">
                  No transactions match the current filter
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTxFilter('all')}
                  className="mt-4"
                >
                  Show all transactions
                </Button>
              </div>
            )}
            
            {/* 查看更多按钮 */}
            {totalTransactions >= limit && (
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <a 
                    href={getAllTransactionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    View all transactions on Explorer
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        ) : (
          // 无交易状态
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">
              No Transactions Yet
            </h3>
            <p className="text-gray-500 mb-4">
              You haven't made any transactions on this network
            </p>
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Try making a transaction:</p>
                <ul className="space-y-1 text-left">
                  <li className="flex items-center gap-2">
                    <ArrowUpRight className="h-3 w-3 text-blue-500" />
                    <span>Send tokens to another address</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Repeat className="h-3 w-3 text-green-500" />
                    <span>Swap tokens using our Swap feature</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-yellow-500" />
                    <span>Approve tokens for trading</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* 数据来源说明 */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <div className="w-2 h-2 mt-1 rounded-full bg-blue-500"></div>
            <div>
              <p>
                Transaction data is sourced from The Graph API with mock data fallback.
                For complete transaction history, view on block explorer.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}