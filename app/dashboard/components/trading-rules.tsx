'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2,
  Target,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { useState } from 'react'

interface TradingRule {
  id: string
  name: string
  description: string
  type: 'risk' | 'entry' | 'exit' | 'position'
  enabled: boolean
  priority: 'high' | 'medium' | 'low'
  conditions: string[]
}

interface RiskLimit {
  id: string
  name: string
  limit: number
  current: number
  type: 'daily_loss' | 'max_position' | 'max_drawdown' | 'win_rate'
  enabled: boolean
}

const defaultRules: TradingRule[] = [
  {
    id: '1',
    name: 'Never Risk More Than 2%',
    description: 'Never risk more than 2% of account balance on a single trade',
    type: 'risk',
    enabled: true,
    priority: 'high',
    conditions: ['Account balance check', 'Position size calculation']
  },
  {
    id: '2',
    name: 'Stop Loss Required',
    description: 'Every trade must have a stop loss set before entry',
    type: 'entry',
    enabled: true,
    priority: 'high',
    conditions: ['Stop loss validation', 'Risk calculation']
  },
  {
    id: '3',
    name: 'Take Profit at 2:1',
    description: 'Set take profit at minimum 2:1 risk-reward ratio',
    type: 'exit',
    enabled: true,
    priority: 'medium',
    conditions: ['Risk-reward calculation', 'Profit target validation']
  },
  {
    id: '4',
    name: 'Max 3 Positions',
    description: 'Never hold more than 3 positions simultaneously',
    type: 'position',
    enabled: true,
    priority: 'medium',
    conditions: ['Position count check', 'New trade validation']
  }
]

const defaultLimits: RiskLimit[] = [
  {
    id: '1',
    name: 'Daily Loss Limit',
    limit: 500,
    current: 150,
    type: 'daily_loss',
    enabled: true
  },
  {
    id: '2',
    name: 'Max Position Size',
    limit: 1000,
    current: 250,
    type: 'max_position',
    enabled: true
  },
  {
    id: '3',
    name: 'Max Drawdown',
    limit: 10,
    current: 3.2,
    type: 'max_drawdown',
    enabled: true
  },
  {
    id: '4',
    name: 'Minimum Win Rate',
    limit: 60,
    current: 72.5,
    type: 'win_rate',
    enabled: true
  }
]

function TradingRulesManager() {
  const [rules, setRules] = useState<TradingRule[]>(defaultRules)
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [newRule, setNewRule] = useState<Partial<TradingRule>>({
    name: '',
    description: '',
    type: 'risk',
    enabled: true,
    priority: 'medium',
    conditions: []
  })

  const addRule = () => {
    if (newRule.name && newRule.description) {
      const rule: TradingRule = {
        id: Date.now().toString(),
        name: newRule.name,
        description: newRule.description,
        type: newRule.type || 'risk',
        enabled: newRule.enabled || true,
        priority: newRule.priority || 'medium',
        conditions: newRule.conditions || []
      }
      setRules([...rules, rule])
      setNewRule({ name: '', description: '', type: 'risk', enabled: true, priority: 'medium', conditions: [] })
      setIsAddingRule(false)
    }
  }

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id))
  }

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Trading Rules</h3>
        <Button 
          onClick={() => setIsAddingRule(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleRule(rule.id)}
                  />
                  <h4 className="font-medium text-white">{rule.name}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`${
                      rule.priority === 'high' ? 'bg-red-600 text-white' :
                      rule.priority === 'medium' ? 'bg-yellow-600 text-white' :
                      'bg-gray-600 text-white'
                    }`}
                  >
                    {rule.priority}
                  </Badge>
                  <Badge variant="outline" className="text-gray-300 border-gray-600">
                    {rule.type}
                  </Badge>
                </div>
                <p className="text-gray-400 text-sm mb-2">{rule.description}</p>
                <div className="flex flex-wrap gap-2">
                  {rule.conditions.map((condition, index) => (
                    <span key={index} className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => deleteRule(rule.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {isAddingRule && (
          <div className="p-4 bg-gray-700 rounded-lg border-2 border-dashed border-gray-600">
            <div className="space-y-4">
              <div>
                <Label className="text-white">Rule Name</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  className="bg-gray-600 border-gray-500 text-white"
                  placeholder="Enter rule name"
                />
              </div>
              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  className="bg-gray-600 border-gray-500 text-white"
                  placeholder="Describe the rule"
                />
              </div>
              <div className="flex space-x-4">
                <div>
                  <Label className="text-white">Type</Label>
                  <select
                    value={newRule.type}
                    onChange={(e) => setNewRule({...newRule, type: e.target.value as any})}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
                  >
                    <option value="risk">Risk Management</option>
                    <option value="entry">Entry Rules</option>
                    <option value="exit">Exit Rules</option>
                    <option value="position">Position Management</option>
                  </select>
                </div>
                <div>
                  <Label className="text-white">Priority</Label>
                  <select
                    value={newRule.priority}
                    onChange={(e) => setNewRule({...newRule, priority: e.target.value as any})}
                    className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={addRule} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
                <Button 
                  onClick={() => setIsAddingRule(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function RiskLimitsManager() {
  const [limits, setLimits] = useState<RiskLimit[]>(defaultLimits)

  const updateLimit = (id: string, value: number) => {
    setLimits(limits.map(limit => 
      limit.id === id ? { ...limit, limit: value } : limit
    ))
  }

  const toggleLimit = (id: string) => {
    setLimits(limits.map(limit => 
      limit.id === id ? { ...limit, enabled: !limit.enabled } : limit
    ))
  }

  const getStatusColor = (limit: RiskLimit) => {
    const percentage = (limit.current / limit.limit) * 100
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 70) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getStatusIcon = (limit: RiskLimit) => {
    const percentage = (limit.current / limit.limit) * 100
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-red-500" />
    if (percentage >= 70) return <Clock className="w-4 h-4 text-yellow-500" />
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  return (
    <Card className="p-6 bg-gray-800 border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Risk Limits</h3>
        <Badge variant="secondary" className="bg-blue-600 text-white">
          Live Monitoring
        </Badge>
      </div>

      <div className="space-y-4">
        {limits.map((limit) => (
          <div key={limit.id} className="p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Switch
                  checked={limit.enabled}
                  onCheckedChange={() => toggleLimit(limit.id)}
                />
                <h4 className="font-medium text-white">{limit.name}</h4>
                {getStatusIcon(limit)}
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getStatusColor(limit)}`}>
                  {limit.type === 'win_rate' ? `${limit.current}%` : `$${limit.current}`}
                </div>
                <div className="text-sm text-gray-400">
                  of {limit.type === 'win_rate' ? `${limit.limit}%` : `$${limit.limit}`}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full ${
                  (limit.current / limit.limit) * 100 >= 90 ? 'bg-red-500' :
                  (limit.current / limit.limit) * 100 >= 70 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min((limit.current / limit.limit) * 100, 100)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {((limit.current / limit.limit) * 100).toFixed(1)}% used
              </span>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={limit.limit}
                  onChange={(e) => updateLimit(limit.id, Number(e.target.value))}
                  className="w-20 h-8 bg-gray-600 border-gray-500 text-white text-sm"
                />
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export function TradingRules() {
  return (
    <div className="space-y-6">
      <TradingRulesManager />
      <RiskLimitsManager />
    </div>
  )
}

