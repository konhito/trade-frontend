// DEPRECATED: This route is no longer used. The frontend now uses the backend API directly.
// Keep for backward compatibility but routes should use /lib/services/trades instead

import { NextRequest, NextResponse } from 'next/server'

// This route has been replaced by backend API
// Frontend now uses @/lib/services/trades which calls the backend
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This API route is deprecated. Use backend API instead.',
    message: 'Please use the backend API'
  }, { status: 410 }) // 410 Gone - resource is permanently unavailable
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This API route is deprecated. Use backend API instead.',
    message: 'Please use the backend API'
  }, { status: 410 })
}
