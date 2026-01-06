'use client'

import { useAuth } from '@/lib/auth'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PackageIcon, TableIcon, ArrowRightLeftIcon, TicketPercentIcon } from 'lucide-react'

export default function AdminDashboard() {
  const { user, loading, signOut, getProfileData, getAllProfileData, getUserDataById } = useAuth()
  const router = useTransitionRouter()
  const [profiles, setProfiles] = useState([])
  const [userProfile, setUserProfile] = useState(null)
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profilesError, setProfilesError] = useState(null)
  const [showAllProfiles, setShowAllProfiles] = useState(true)
  const [searchUserId, setSearchUserId] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router,])

  useEffect(() => {
    const fetchProfiles = async () => {
      setProfilesLoading(true)
      setProfilesError(null)
      
      try {
        if (showAllProfiles) {
          // Fetch all profiles for admin view
          const result = await getAllProfileData()
          console.log("getAllProfileData result:", result)
          if (result.success) {
            setProfiles(result.profiles)
          } else {
            console.error("Failed to fetch all profiles:", result.error)
            setProfilesError(result.error)
          }
        } else {
          // Fetch current user's profile only
          const result = await getProfileData()
          console.log("getProfileData result:", result)
          if (result.success) {
            setUserProfile(result.profiles[0] || null)
            setProfiles(result.profiles)
          } else {
            console.error("Failed to fetch user profile:", result.error)
            setProfilesError(result.error)
          }
        }
      } catch (error) {
        console.error("Error fetching profiles:", error)
        setProfilesError(error.message)
      }
      
      setProfilesLoading(false)
    }
    
    if (user) {
      fetchProfiles()
    }
  }, [user, showAllProfiles])

  useEffect(() => {
    console.log("profiles", profiles)
  }, [profiles])

  const handleSearchUser = async () => {
    if (!searchUserId.trim()) return
    
    setSearching(true)
    setSearchResult(null)
    
    try {
      const result = await getUserDataById(searchUserId.trim())
      setSearchResult(result)
    } catch (error) {
      console.error('Error searching for user:', error)
      setSearchResult({
        success: false,
        error: error.message,
        userId: searchUserId.trim()
      })
    }
    
    setSearching(false)
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back , {user.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Links</CardTitle>
                <CardDescription>Links to other pages</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/products')}>
                        <TableIcon className="w-4 h-4" /> Manage Products
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/orders')}>
                        <PackageIcon className="w-4 h-4" /> Manage Orders
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/tradein')}>
                        <ArrowRightLeftIcon className="w-4 h-4" /> Manage Trade-in Products
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => router.push('/admin/offers')}>
                        <TicketPercentIcon className="w-4 h-4" /> Manage Offers
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email: {user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last sign in: {new Date(user.last_sign_in_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  Update Profile
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  View Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Search User by ID</CardTitle>
              <CardDescription>Find specific user data by user ID</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter User ID"
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                  />
                  <Button 
                    onClick={handleSearchUser}
                    disabled={searching || !searchUserId.trim()}
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
                
                {searchResult && (
                  <div className="mt-4">
                    {searchResult.success ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">User Found</p>
                          <p className="text-xs text-green-600">User ID: {searchResult.userId}</p>
                        </div>
                        
                        {searchResult.profile ? (
                          <div className="p-3  rounded-lg">
                            <p className="text-sm font-medium">Profile Data:</p>
                            <pre className="text-xs text-muted-foreground mt-1 overflow-auto">
                              {JSON.stringify(searchResult.profile, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">No profile data found</p>
                          </div>
                        )}
                        
                        {searchResult.profileCustomerReadonly?.length > 0 && (
                          <div className="p-3  rounded-lg">
                            <p className="text-sm font-medium">Customer Data:</p>
                            <pre className="text-xs text-muted-foreground mt-1 overflow-auto">
                              {JSON.stringify(searchResult.profileCustomerReadonly, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">Error: {searchResult.error}</p>
                        <p className="text-xs text-red-600">User ID: {searchResult.userId}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profiles Data</CardTitle>
                  <CardDescription>
                    {showAllProfiles ? 'All profiles from database' : 'Your profile information'}
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllProfiles(!showAllProfiles)}
                >
                  {showAllProfiles ? 'Show My Profile' : 'Show All Profiles'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profilesLoading ? (
                  <div className="p-3  rounded-lg">
                    <p className="text-sm text-muted-foreground">Loading profiles...</p>
                  </div>
                ) : profilesError ? (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">Error: {profilesError}</p>
                  </div>
                ) : profiles.length > 0 ? (
                  profiles.map((profile, index) => (
                    <div key={profile.id || index} className="p-3  rounded-lg">
                      <p className="text-sm font-medium">Profile {index + 1} ({profile.full_name})</p>
                      <p className="text-xs text-muted-foreground">ID: {profile.id}</p>
                      <p className="text-xs text-muted-foreground">
                        Data: {JSON.stringify(profile, null, 2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3  rounded-lg">
                    <p className="text-sm text-muted-foreground">No profiles found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3  rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Signed in</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.last_sign_in_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3  rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Account created</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Account security information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email verified</span>
                  <span className={`text-sm font-medium ${user.email_confirmed_at ? 'text-green-600' : 'text-red-600'}`}>
                    {user.email_confirmed_at ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Two-factor auth</span>
                  <span className="text-sm font-medium text-muted-foreground">Not enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Password strength</span>
                  <span className="text-sm font-medium text-yellow-600">Medium</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
