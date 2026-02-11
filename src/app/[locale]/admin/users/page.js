'use client'

import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  RefreshCw,
  Eye,
  Users,
  ShieldCheck,
  UserPlus,
  Activity,
  Trash2,
} from 'lucide-react'

export default function AdminUsersPage() {
  const t = useTranslations('admin.users')
  const { user, loading } = useAuth()
  const router = useTransitionRouter()

  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [currentUserId, setCurrentUserId] = useState(null)

  // Detail modal
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Role update loading
  const [roleUpdating, setRoleUpdating] = useState(null)

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    newLast30: 0,
    activeLast7: 0,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(u =>
        u.full_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.id?.toLowerCase().includes(term)
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  useEffect(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    setStats({
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      newLast30: users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length,
      activeLast7: users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > sevenDaysAgo).length,
    })
  }, [users])

  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (data.success) {
        setUsers(data.users || [])
        setCurrentUserId(data.currentUserId)
      } else {
        console.error('Failed to fetch users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
    setUsersLoading(false)
  }

  const updateUserRole = async (userId, newRole) => {
    setRoleUpdating(userId)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await response.json()

      if (data.success) {
        setUsers(prev => prev.map(u =>
          u.id === userId ? { ...u, role: newRole } : u
        ))
      } else {
        console.error('Failed to update role:', data.error)
        alert(data.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Error updating role:', error)
    }
    setRoleUpdating(null)
  }

  const deleteUser = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/admin/users?id=${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
        setDeleteTarget(null)
      } else {
        console.error('Failed to delete user:', data.error)
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
    setDeleteLoading(false)
  }

  const isSelf = (userId) => userId === currentUserId

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'Never'
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return formatDate(dateStr)
  }

  if (!user || loading) return null

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
            <p className="text-muted-foreground">{t('subheading')}</p>
          </div>
          <Button onClick={fetchUsers} disabled={usersLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('admins')}</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('newLast30')}</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLast30}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('activeLast7')}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLast7}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">{t('allRoles')}</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('users')} ({filteredUsers.length})</CardTitle>
            <CardDescription>
              {usersLoading
                ? t('loading')
                : t('showingOf', { count: filteredUsers.length, total: users.length })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-muted-foreground" />
                <span className="text-muted-foreground">{t('loading')}</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('user')}</TableHead>
                      <TableHead>{t('role')}</TableHead>
                      <TableHead className="hidden sm:table-cell">{t('plan')}</TableHead>
                      <TableHead className="hidden md:table-cell">{t('joined')}</TableHead>
                      <TableHead className="hidden lg:table-cell">{t('lastActive')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        {/* User info */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                              {(u.full_name || u.email || '?')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-foreground truncate max-w-[180px]">
                                {u.full_name || t('noName')}
                                {isSelf(u.id) && (
                                  <span className="text-xs text-primary ml-1">{t('you')}</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {u.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell>
                          {isSelf(u.id) ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              {u.role}
                            </Badge>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value)}
                              disabled={roleUpdating === u.id}
                              className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                            >
                              <option value="customer">customer</option>
                              <option value="admin">admin</option>
                            </select>
                          )}
                        </TableCell>

                        {/* Plan */}
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {u.plan || '—'}
                          </span>
                        </TableCell>

                        {/* Joined */}
                        <TableCell className="hidden md:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {formatDate(u.created_at)}
                          </span>
                        </TableCell>

                        {/* Last Active */}
                        <TableCell className="hidden lg:table-cell">
                          <span className="text-sm text-muted-foreground">
                            {timeAgo(u.last_sign_in_at)}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(u)
                                setShowDetails(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {!isSelf(u.id) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteTarget(u)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredUsers.length === 0 && !usersLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t('noResults')}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t('userDetails')}</DialogTitle>
              <DialogDescription>
                {t('userDetailsDesc')}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                {/* Avatar + name */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                    {(selectedUser.full_name || selectedUser.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-foreground">
                      {selectedUser.full_name || t('noName')}
                    </div>
                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('role')}</p>
                    <Badge className={selectedUser.role === 'admin'
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-muted-foreground'
                    }>
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('plan')}</p>
                    <p className="font-medium text-foreground">{selectedUser.plan || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('joined')}</p>
                    <p className="font-medium text-foreground">{formatDateTime(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('lastActive')}</p>
                    <p className="font-medium text-foreground">{formatDateTime(selectedUser.last_sign_in_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('emailConfirmed')}</p>
                    <p className="font-medium text-foreground">
                      {selectedUser.email_confirmed_at ? formatDateTime(selectedUser.email_confirmed_at) : t('notConfirmed')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t('userId')}</p>
                    <p className="font-mono text-xs text-foreground break-all">{selectedUser.id}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetails(false)}>
                {t('close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deleteUser')}</DialogTitle>
              <DialogDescription>
                {t('deleteWarning')}
              </DialogDescription>
            </DialogHeader>
            {deleteTarget && (
              <div className="py-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive font-bold">
                    {(deleteTarget.full_name || deleteTarget.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {deleteTarget.full_name || t('noName')}
                    </div>
                    <div className="text-sm text-muted-foreground">{deleteTarget.email}</div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {t('deleting')}
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('deleteUser')}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
