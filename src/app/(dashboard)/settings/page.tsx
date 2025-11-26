'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Shield, Users, Settings as SettingsIcon, Bell } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'pharmacist' | 'cashier';
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'pharmacist' | 'cashier';
}

interface SystemSettings {
  lowStockThreshold: number;
  expiryWarningDays: number;
  autoReorderEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

const initialUserData: UserFormData = {
  name: '',
  email: '',
  password: '',
  role: 'cashier',
};

const rolePermissions = {
  admin: [
    'Manage all users and roles',
    'Access all system settings',
    'View all reports and analytics',
    'Manage suppliers and inventory',
    'Process sales and purchases',
    'Manage stock adjustments',
  ],
  pharmacist: [
    'Manage inventory and medications',
    'Process sales and purchases',
    'View inventory reports',
    'Manage stock adjustments',
    'Access medication information',
  ],
  cashier: [
    'Process sales only',
    'View basic inventory information',
    'Access point-of-sale features',
  ],
};

export default function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userFormData, setUserFormData] = useState<UserFormData>(initialUserData);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    lowStockThreshold: 10,
    expiryWarningDays: 30,
    autoReorderEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    fetchUsers();
    loadSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token for users API:', token ? token.substring(0, 20) + '...' : 'null');
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setUsers(result.data || []);
      } else {
        if (response.status === 401) {
          // Token invalid or user not found - force logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = '/login';
          return;
        }
        
        const errorResult = await response.json();
        console.error('Error fetching users:', errorResult.error);
        toast({
          title: 'Error',
          description: errorResult.error || 'Failed to fetch users',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Network error while fetching users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = () => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = async () => {
    try {
      // Save settings to localStorage (in production, save to API/database)
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const isEditing = isEditUserOpen;
      
      // For editing, password is optional
      const submitData = isEditing && !userFormData.password 
        ? { ...userFormData, password: undefined }
        : userFormData;

      const url = isEditing ? `/api/auth/users/${editingUserId}` : '/api/auth/users';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: isEditing ? 'User updated successfully' : 'User created successfully',
        });
        
        setUserFormData(initialUserData);
        setIsAddUserOpen(false);
        setIsEditUserOpen(false);
        setEditingUserId(null);
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Network error while ${isEditUserOpen ? 'updating' : 'creating'} user`,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const handleEditUser = (user: User) => {
    setEditingUserId(user._id);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      role: user.role
    });
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
        return;
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully',
        });
        fetchUsers();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Network error while deleting user',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'pharmacist': return 'default';
      case 'cashier': return 'secondary';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <SettingsIcon className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" disabled={!isAdmin}>
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lowStock">Default Low Stock Threshold</Label>
                <Input
                  id="lowStock"
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 10 }))}
                />
              </div>
              <div>
                <Label htmlFor="expiryWarning">Expiry Warning (Days)</Label>
                <Input
                  id="expiryWarning"
                  type="number"
                  value={settings.expiryWarningDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, expiryWarningDays: parseInt(e.target.value) || 30 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoReorder"
                  checked={settings.autoReorderEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoReorderEnabled: e.target.checked }))}
                />
                <Label htmlFor="autoReorder">Enable Auto-Reorder Suggestions</Label>
              </div>
              <Button onClick={saveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                />
                <Label htmlFor="emailNotifications">Email Notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings(prev => ({ ...prev, smsNotifications: e.target.checked }))}
                />
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
              </div>
              <Button onClick={saveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {isAdmin ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Management</h2>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUserSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={userFormData.name}
                          onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userFormData.email}
                          onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={userFormData.password}
                          onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={userFormData.role}
                          onValueChange={(value: 'admin' | 'pharmacist' | 'cashier') => 
                            setUserFormData(prev => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cashier">Cashier</SelectItem>
                            <SelectItem value="pharmacist">Pharmacist</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAddUserOpen(false);
                            setUserFormData(initialUserData);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                          {submitting ? 'Creating...' : 'Create User'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                disabled={user._id === currentUser?._id}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDeleteUser(user._id, user.name)}
                                disabled={user._id === currentUser?._id}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Access Restricted</h3>
                <p className="text-gray-500">Only administrators can manage users.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <div className="grid gap-6">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(role)}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                    <span>Permissions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {permissions.map((permission, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={userFormData.name}
                onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled
                className="bg-gray-100"
              />
              <small className="text-gray-500">Email cannot be changed</small>
            </div>
            <div>
              <Label htmlFor="edit-password">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value: 'admin' | 'pharmacist' | 'cashier') => 
                  setUserFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashier">Cashier</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditUserOpen(false);
                  setUserFormData(initialUserData);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}