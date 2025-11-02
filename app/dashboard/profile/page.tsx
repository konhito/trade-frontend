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
import { toast } from 'sonner'

export default function ProfilePage() {
  const { session, user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
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

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || '',
        joinDate: new Date(user.created_at).toLocaleDateString(),
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.location || '',
        website: user.user_metadata?.website || '',
        company: user.user_metadata?.company || '',
        phone: user.user_metadata?.phone || ''
      }))
    }
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update user metadata (this would be a real API call)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.user_metadata?.first_name || '',
        lastName: user.user_metadata?.last_name || '',
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.location || '',
        website: user.user_metadata?.website || '',
        company: user.user_metadata?.company || '',
        phone: user.user_metadata?.phone || ''
      }))
    }
  }

  const getInitials = () => {
    const first = profileData.firstName.charAt(0).toUpperCase()
    const last = profileData.lastName.charAt(0).toUpperCase()
    return first + last
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
                    <AvatarImage src={profileData.avatar} alt="Profile" />
                    <AvatarFallback className="text-2xl font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">
                  {profileData.firstName} {profileData.lastName}
                </CardTitle>
                <CardDescription>{profileData.email}</CardDescription>
                <Badge variant="outline" className="mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  Member since {profileData.joinDate}
                </Badge>
              </CardHeader>
              <CardContent>
                {/* Avatar upload */}
                <div className="space-y-2">
                  <Label htmlFor="avatarUpload">Profile Photo</Label>
                  <Input id="avatarUpload" type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const url = URL.createObjectURL(file)
                      setProfileData(prev => ({ ...prev, avatar: url }))
                      toast.success('Photo selected')
                    }
                  }} />
                </div>
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
