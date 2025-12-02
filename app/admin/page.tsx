'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Activity,
  LogOut,
  Search,
  Eye,
  Calendar,
  Target,
  Wallet,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/currency'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { format } from 'date-fns'

interface User {
  id: number
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  createdAt: string
  stats: {
    tradesCount: number
    totalPnL: number
    strategiesCount: number
    accountsCount: number
  }
}

interface PlatformStats {
  overview: {
    totalUsers: number
    newUsersLast30Days: number
    totalTrades: number
    tradesLast30Days: number
    totalStrategies: number
    totalAccounts: number
    totalPnL: number
    overallWinRate: number
    winningTrades: number
    losingTrades: number
  }
  charts: {
    usersByMonth: Array<{ month: string; count: number }>
  }
}

interface UserDetails {
  user: {
    id: number
    email: string
    name: string | null
    firstName: string | null
    lastName: string | null
    createdAt: string
  }
  statistics: {
    trades: {
      total: number
      winning: number
      losing: number
      winRate: number
      totalPnL: number
      avgPnL: number
    }
    strategies: number
    accounts: number
    groups: number
    payouts: number
  }
  data: {
    trades: any[]
    strategies: any[]
    accounts: any[]
    groups: any[]
    payouts: any[]
  }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const backendUrl = 'https://www.backend.mytradejournal.co.in'

  useEffect(() => {
    // Check if we're on admin subdomain
    const hostname = window.location.hostname
    const isAdminDomain = hostname.includes('admin.mytradejournal.co.in') || 
                          hostname.includes('www.admin.mytradejournal.co.in') ||
                          hostname.includes('localhost') || 
                          hostname.includes('127.0.0.1')
    
    if (!isAdminDomain) {
      router.push('/')
      return
    }

    // Check if admin token exists
    const token = localStorage.getItem('adminToken')
    if (!token || !token.startsWith('admin-token-')) {
      router.push('/admin/login')
      return
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, currentPage, searchTerm])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('adminToken')
      
      // Fetch users
      const usersResponse = await fetch(
        `${backendUrl}/admin/users?page=${currentPage}&limit=50&search=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      
      if (usersResponse.status === 401) {
        localStorage.removeItem('adminToken')
        router.push('/admin/login')
        return
      }
      
      const usersData = await usersResponse.json()
      setUsers(usersData.users || [])
      setTotalPages(usersData.pagination?.totalPages || 1)

      // Fetch platform stats
      const statsResponse = await fetch(`${backendUrl}/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setPlatformStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    router.push('/admin/login')
  }

  const handleViewUser = async (userId: number) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`${backendUrl}/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const userDetails = await response.json()
        setSelectedUser(userDetails)
        setShowUserModal(true)
      }
    } catch (error) {
      console.error('Error fetching user details:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchData()
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage and monitor your trading platform</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-input text-foreground hover:bg-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Platform Statistics */}
        {platformStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{platformStats.overview.totalUsers}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{platformStats.overview.newUsersLast30Days} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div className="text-2xl font-bold text-foreground">{platformStats.overview.totalTrades}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {platformStats.overview.tradesLast30Days} in last 30 days
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <div className={`text-2xl font-bold ${platformStats.overview.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(platformStats.overview.totalPnL)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Win rate: {platformStats.overview.overallWinRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  <div className="text-2xl font-bold text-foreground">{platformStats.overview.totalStrategies}</div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {platformStats.overview.totalAccounts} accounts
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-input text-foreground"
                />
              </div>
              <Button type="submit" variant="outline" className="border-input">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={fetchData}
                className="border-input"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Users</CardTitle>
            <CardDescription>Manage and view all platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Trades</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Total P&L</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Strategies</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Accounts</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Joined</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-2 text-sm text-foreground">{user.id}</td>
                      <td className="p-2 text-sm text-foreground">{user.email}</td>
                      <td className="p-2 text-sm text-foreground">
                        {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}
                      </td>
                      <td className="p-2 text-sm text-foreground">{user.stats.tradesCount}</td>
                      <td className={`p-2 text-sm font-medium ${user.stats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(user.stats.totalPnL)}
                      </td>
                      <td className="p-2 text-sm text-foreground">{user.stats.strategiesCount}</td>
                      <td className="p-2 text-sm text-foreground">{user.stats.accountsCount}</td>
                      <td className="p-2 text-sm text-muted-foreground">
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                          className="text-primary hover:text-primary/80"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-input"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-input"
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Modal */}
        <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border text-foreground">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Comprehensive view of user data and statistics
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="space-y-6">
                {/* User Info */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-sm font-medium text-foreground">{selectedUser.user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="text-sm font-medium text-foreground">
                        {selectedUser.user.name || `${selectedUser.user.firstName || ''} ${selectedUser.user.lastName || ''}`.trim() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">User ID</p>
                      <p className="text-sm font-medium text-foreground">{selectedUser.user.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(selectedUser.user.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Trades</p>
                        <p className="text-2xl font-bold text-foreground">{selectedUser.statistics.trades.total}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedUser.statistics.trades.winning}W / {selectedUser.statistics.trades.losing}L
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className="text-2xl font-bold text-foreground">{selectedUser.statistics.trades.winRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total P&L</p>
                        <p className={`text-2xl font-bold ${selectedUser.statistics.trades.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(selectedUser.statistics.trades.totalPnL)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Avg P&L</p>
                        <p className={`text-2xl font-bold ${selectedUser.statistics.trades.avgPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(selectedUser.statistics.trades.avgPnL)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Strategies</p>
                        <p className="text-2xl font-bold text-foreground">{selectedUser.statistics.strategies}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Accounts</p>
                        <p className="text-2xl font-bold text-foreground">{selectedUser.statistics.accounts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Groups</p>
                        <p className="text-2xl font-bold text-foreground">{selectedUser.statistics.groups}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Payouts</p>
                        <p className="text-2xl font-bold text-foreground">{selectedUser.statistics.payouts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Trades */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Trades ({selectedUser.data.trades.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2 text-muted-foreground">Symbol</th>
                            <th className="text-left p-2 text-muted-foreground">Status</th>
                            <th className="text-left p-2 text-muted-foreground">P&L</th>
                            <th className="text-left p-2 text-muted-foreground">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedUser.data.trades.slice(0, 10).map((trade: any) => (
                            <tr key={trade.id} className="border-b border-border">
                              <td className="p-2 text-foreground">{trade.symbol}</td>
                              <td className="p-2">
                                <Badge variant={trade.status === 'closed' ? 'default' : 'secondary'}>
                                  {trade.status}
                                </Badge>
                              </td>
                              <td className={`p-2 font-medium ${parseFloat(trade.pnl || '0') >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(parseFloat(trade.pnl || '0') - parseFloat(trade.commission || '0'))}
                              </td>
                              <td className="p-2 text-muted-foreground">
                                {trade.entryDate ? format(new Date(trade.entryDate), 'MMM dd, yyyy') : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
