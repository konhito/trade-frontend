'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Edit, 
  Save, 
  X,
  Shield,
  Bell,
  Globe,
  Phone,
  MapPin,
  Briefcase,
  Award,
  TrendingUp,
  Activity
} from "lucide-react"
import { useAuth } from '@/context/auth-provider'
import { apiFetch } from '@/lib/api'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProfilePage() {
  const { user, token } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    joinDate: '',
    avatar: '',
    preferences: {
      notifications: true,
      emailUpdates: true,
      darkMode: false,
      language: 'en'
    },
    stats: {
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      strategiesCount: 0
    }
  })

  // Load user data on mount - fetch from API to get latest data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        setFetching(false)
        return
      }
      
      try {
        const userData = await apiFetch<{
          id: number
          email: string
          name?: string | null
          firstName?: string | null
          lastName?: string | null
          phone?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          company?: string | null
          avatar?: string | null
          preferences?: any
          createdAt: string
        }>('/api/auth/me', { token })
        
        setProfileData(prev => ({
          ...prev,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          avatar: userData.avatar 
            ? (userData.avatar.startsWith('data:image') 
                ? userData.avatar 
                : `data:image/jpeg;base64,${userData.avatar}`)
            : '',
          joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '',
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          company: userData.company || '',
          phone: userData.phone || '',
          preferences: userData.preferences || prev.preferences
        }))
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        toast.error('Failed to load profile data')
      } finally {
        setFetching(false)
      }
    }

    fetchUserData()
  }, [token])

  const handleSave = async () => {
    if (!token) {
      toast.error('You must be logged in to update your profile')
      return
    }

    setLoading(true)
    try {
      // Prepare update data - only send fields that have values or are being cleared
      const updateData: any = {
        firstName: profileData.firstName || null,
        lastName: profileData.lastName || null,
        phone: profileData.phone || null,
        bio: profileData.bio || null,
        location: profileData.location || null,
        website: profileData.website?.trim() || null,
        company: profileData.company || null,
        avatar: profileData.avatar?.startsWith('data:image') 
          ? profileData.avatar.split(',')[1] // Extract base64 part if data URL
          : profileData.avatar || null,
        preferences: profileData.preferences || {}
      }
      
      // Set name from firstName and lastName if name field exists
      if (profileData.firstName || profileData.lastName) {
        updateData.name = [profileData.firstName, profileData.lastName].filter(Boolean).join(' ') || null
      }

      // Call the API to update profile
      const updatedUser = await apiFetch<{
        id: number
        email: string
        firstName?: string | null
        lastName?: string | null
        phone?: string | null
        bio?: string | null
        location?: string | null
        website?: string | null
        company?: string | null
        avatar?: string | null
        preferences?: any
      }>('/api/auth/profile', {
        method: 'PUT',
        token,
        body: updateData
      })
      
      // Update local state with returned data
      setProfileData(prev => ({
        ...prev,
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        phone: updatedUser.phone || '',
        bio: updatedUser.bio || '',
        location: updatedUser.location || '',
        website: updatedUser.website || '',
        company: updatedUser.company || '',
        avatar: updatedUser.avatar 
          ? (updatedUser.avatar.startsWith('data:image') 
              ? updatedUser.avatar 
              : `data:image/jpeg;base64,${updatedUser.avatar}`)
          : '',
        preferences: updatedUser.preferences || prev.preferences
      }))

      toast.success('Profile updated successfully!')
      setIsEditing(false)
      
      // Trigger auth refresh to update user data in context
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-profile-updated'))
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      const errorMessage = error?.message || 'Failed to update profile. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reload user data from API to reset form
    if (token) {
      apiFetch<{
        firstName?: string | null
        lastName?: string | null
        phone?: string | null
        bio?: string | null
        location?: string | null
        website?: string | null
        company?: string | null
        avatar?: string | null
        preferences?: any
      }>('/api/auth/me', { token })
        .then(userData => {
          setProfileData(prev => ({
            ...prev,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            location: userData.location || '',
            website: userData.website || '',
            company: userData.company || '',
            avatar: userData.avatar 
              ? (userData.avatar.startsWith('data:image') 
                  ? userData.avatar 
                  : `data:image/jpeg;base64,${userData.avatar}`)
              : '',
            preferences: userData.preferences || prev.preferences
          }))
        })
        .catch(() => {
          toast.error('Failed to reload profile data')
        })
    }
  }

  const getInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return (profileData.firstName.charAt(0) + profileData.lastName.charAt(0)).toUpperCase()
    }
    if (profileData.firstName) {
      return profileData.firstName.charAt(0).toUpperCase()
    }
    if (profileData.email) {
      return profileData.email.charAt(0).toUpperCase()
    }
    return 'U'
  }
  
  const getDisplayName = () => {
    if (profileData.firstName || profileData.lastName) {
      return [profileData.firstName, profileData.lastName].filter(Boolean).join(' ')
    }
    return profileData.email || 'User'
  }

  if (fetching) {
    return (
      <div className="flex-1 bg-background p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview Card Skeleton */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-border">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-40 mx-auto" />
                    <Skeleton className="h-6 w-24 mx-auto mt-2" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-3 mt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details Card Skeleton */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-9 w-28" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information Skeleton */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Skeleton className="h-px w-full" />

                  {/* Additional Information Skeleton */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-20 w-full rounded-md" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Skeleton className="h-px w-full" />

                  {/* Preferences Skeleton */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-64" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-background p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={profileData.avatar?.startsWith('data:image') 
                        ? profileData.avatar 
                        : profileData.avatar 
                          ? `data:image/jpeg;base64,${profileData.avatar}` 
                          : undefined} 
                      alt="Profile" 
                    />
                    <AvatarFallback className="text-2xl font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {getDisplayName()}
                </CardTitle>
                <CardDescription>{profileData.email}</CardDescription>
                <Badge variant="outline" className="mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  Member since {profileData.joinDate}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Avatar upload - only when editing */}
                {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="avatarUpload">Profile Photo</Label>
                  <Input 
                    id="avatarUpload" 
                    type="file" 
                    accept="image/*" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Validate file size (max 2MB)
                        const maxSize = 2 * 1024 * 1024 // 2MB
                        if (file.size > maxSize) {
                          toast.error('Image size must be less than 2MB')
                          return
                        }
                        
                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                          toast.error('Please select a valid image file')
                          return
                        }
                        
                        try {
                          // Convert image to base64
                          const reader = new FileReader()
                          reader.onloadend = () => {
                            const base64String = reader.result as string
                            setProfileData(prev => ({ ...prev, avatar: base64String }))
                            toast.success('Photo selected. Click Save to upload.')
                          }
                          reader.onerror = () => {
                            toast.error('Failed to read image file')
                          }
                          reader.readAsDataURL(file)
                        } catch (error) {
                          console.error('Error converting image to base64:', error)
                          toast.error('Failed to process image')
                        }
                      }
                    }} 
                  />
                  <p className="text-xs text-muted-foreground">
                    Max size: 2MB. Image will be stored as base64.
                  </p>
                </div>
                )}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {profileData.location || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {profileData.company || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {profileData.website || 'Not specified'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trading Stats removed as requested */}
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and preferences
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={loading}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="mt-1 bg-muted"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Email cannot be changed
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-primary" />
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                        rows={3}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="City, Country"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                          disabled={!isEditing}
                          className="mt-1"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Preferences */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your trading activity
                        </p>
                      </div>
                      <Button
                        variant={profileData.preferences.emailUpdates ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProfileData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, emailUpdates: !prev.preferences.emailUpdates }
                        }))}
                        disabled={!isEditing}
                      >
                        {profileData.preferences.emailUpdates ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about important updates
                        </p>
                      </div>
                      <Button
                        variant={profileData.preferences.notifications ? "default" : "outline"}
                        size="sm"
                        onClick={() => setProfileData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, notifications: !prev.preferences.notifications }
                        }))}
                        disabled={!isEditing}
                      >
                        {profileData.preferences.notifications ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
