'use client'

import { TradeDiarySidebar, TradeDiaryHeader } from './trade-diary-sidebar'
import { TradeDiaryDashboardIntegrated } from './trade-diary-dashboard-integrated'
import { AdvancedTradingFeatures } from './advanced-trading-features'

export function TradeDiaryLayout() {
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <TradeDiarySidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <TradeDiaryHeader />
        
        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto">
          <TradeDiaryDashboardIntegrated />
        </div>
      </div>
    </div>
  )
}
