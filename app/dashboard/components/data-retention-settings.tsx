'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database, 
  Archive, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react'
import { toast } from 'sonner'

interface DataRetentionSettings {
  dataRetentionDays: number
  archiveRetentionDays: number
  autoArchiveEnabled: boolean
}

interface ArchiveStats {
  activeTrades: number
  archivedTrades: number
  recentJobs: Array<{
    id: string
    recordsProcessed: number
    recordsArchived: number
    status: string
    startTime: string
    endTime?: string
  }>
}

export function DataRetentionSettings() {
  const [settings, setSettings] = useState<DataRetentionSettings>({
    dataRetentionDays: 365,
    archiveRetentionDays: 2555,
    autoArchiveEnabled: true
  })
  const [stats, setStats] = useState<ArchiveStats>({
    activeTrades: 0,
    archivedTrades: 0,
    recentJobs: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [archiving, setArchiving] = useState(false)

  // Load settings and stats
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/data-retention')
      if (!response.ok) throw new Error('Failed to load settings')
      
      const data = await response.json()
      setSettings(data.settings)
      setStats(data.stats)
    } catch (error) {
      console.error('Error loading data retention settings:', error)
      toast.error('Failed to load data retention settings')
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/data-retention', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      if (!response.ok) throw new Error('Failed to save settings')
      
      toast.success('Data retention settings saved successfully')
      await loadData() // Reload to get updated data
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save data retention settings')
    } finally {
      setSaving(false)
    }
  }

  const runManualArchive = async () => {
    try {
      setArchiving(true)
      const response = await fetch('/api/data-retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceRun: true })
      })
      
      if (!response.ok) throw new Error('Failed to run archiving')
      
      const data = await response.json()
      toast.success(`Archiving completed: ${data.archived} trades archived`)
      await loadData() // Reload to get updated stats
    } catch (error) {
      console.error('Error running manual archiving:', error)
      toast.error('Failed to run manual archiving')
    } finally {
      setArchiving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Completed</Badge>
      case 'RUNNING':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Running</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading data retention settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Retention Settings
          </CardTitle>
          <CardDescription>
            Configure how long your trading data is kept in active storage and archives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Archive Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Automatic Archiving</Label>
              <p className="text-sm text-muted-foreground">
                Automatically move old trades to archive storage
              </p>
            </div>
            <Switch
              checked={settings.autoArchiveEnabled}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, autoArchiveEnabled: checked }))
              }
            />
          </div>

          {/* Data Retention Days */}
          <div className="space-y-2">
            <Label htmlFor="dataRetentionDays">Active Storage Period (Days)</Label>
            <Input
              id="dataRetentionDays"
              type="number"
              min="30"
              max="3650"
              value={settings.dataRetentionDays}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  dataRetentionDays: parseInt(e.target.value) || 365 
                }))
              }
              disabled={!settings.autoArchiveEnabled}
            />
            <p className="text-sm text-muted-foreground">
              How long to keep trades in active storage before archiving (30-3650 days)
            </p>
          </div>

          {/* Archive Retention Days */}
          <div className="space-y-2">
            <Label htmlFor="archiveRetentionDays">Archive Storage Period (Days)</Label>
            <Input
              id="archiveRetentionDays"
              type="number"
              min="365"
              max="3650"
              value={settings.archiveRetentionDays}
              onChange={(e) => 
                setSettings(prev => ({ 
                  ...prev, 
                  archiveRetentionDays: parseInt(e.target.value) || 2555 
                }))
              }
              disabled={!settings.autoArchiveEnabled}
            />
            <p className="text-sm text-muted-foreground">
              How long to keep archived trades before permanent deletion (365-3650 days)
            </p>
          </div>

          {/* Save Button */}
          <Button onClick={saveSettings} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Current Data Status
          </CardTitle>
          <CardDescription>
            Overview of your current data storage and archiving status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Trades</p>
                <p className="text-2xl font-bold">{stats.activeTrades.toLocaleString()}</p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived Trades</p>
                <p className="text-2xl font-bold">{stats.archivedTrades.toLocaleString()}</p>
              </div>
              <Archive className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Manual Archive Button */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Manual Archive</p>
                <p className="text-sm text-muted-foreground">
                  Manually trigger archiving of old trades
                </p>
              </div>
              <Button 
                onClick={runManualArchive} 
                disabled={archiving || !settings.autoArchiveEnabled}
                variant="outline"
              >
                {archiving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Archiving...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 mr-2" />
                    Run Archive
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Archive Jobs */}
      {stats.recentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Archive Jobs
            </CardTitle>
            <CardDescription>
              History of recent data archiving operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(job.startTime)}
                      </span>
                    </div>
                    <p className="text-sm">
                      Processed {job.recordsProcessed.toLocaleString()} records, 
                      archived {job.recordsArchived.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {job.endTime ? formatDate(job.endTime) : 'In Progress'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Data Retention Policy:</strong> Your trading data is automatically archived to optimize 
          database performance while preserving historical records. Archived data remains accessible for 
          analytics and reporting but is stored in a compressed format to save space.
        </AlertDescription>
      </Alert>
    </div>
  )
}
