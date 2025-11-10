import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Ban, CheckCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllUsersService,
  createUserService,
  updateUserService,
  toggleUserBlockService,
  deleteUserService,
} from "@/services";

function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    userName: "",
    userEmail: "",
    password: "",
    role: "user",
  });

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await getAllUsersService();
      if (res?.success) {
        setUsers(res.data || []);
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createUserService(formData);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "User added successfully",
        });
        setShowAddDialog(false);
        setFormData({ userName: "", userEmail: "", password: "", role: "user" });
        loadUsers();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to add user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function handleEditUser(user) {
    setSelectedUser(user);
    setFormData({
      userName: user.userName,
      userEmail: user.userEmail,
      password: "",
      role: user.role,
    });
    setShowEditDialog(true);
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!selectedUser?._id) return;
    setLoading(true);
    try {
      const updateData = { ...formData };
      // Only include password if it's provided
      if (!updateData.password) {
        delete updateData.password;
      }
      const res = await updateUserService(selectedUser._id, updateData);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "User updated successfully",
        });
        setShowEditDialog(false);
        setSelectedUser(null);
        setFormData({ userName: "", userEmail: "", password: "", role: "user" });
        loadUsers();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleBlockUser(e, userId) {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      const res = await toggleUserBlockService(userId);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "User blocked successfully",
        });
        loadUsers();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to block user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to block user",
        variant: "destructive",
      });
    }
  }

  async function handleUnblockUser(e, userId) {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      const res = await toggleUserBlockService(userId);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "User unblocked successfully",
        });
        loadUsers();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to unblock user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to unblock user",
        variant: "destructive",
      });
    }
  }

  function handleDeleteClick(e, user) {
    e?.preventDefault();
    e?.stopPropagation();
    setUserToDelete(user);
    setShowDeleteDialog(true);
  }

  async function confirmDeleteUser() {
    if (!userToDelete?._id) return;
    
    try {
      const res = await deleteUserService(userToDelete._id);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "User deleted successfully",
        });
        setShowDeleteDialog(false);
        setUserToDelete(null);
        loadUsers();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  }

  function cancelDelete() {
    setShowDeleteDialog(false);
    setUserToDelete(null);
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage all users: Students, Instructors
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.userName}</TableCell>
                      <TableCell>{user.userEmail}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.isBlocked ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleUnblockUser(e, user._id)}
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleBlockUser(e, user._id)}
                            >
                              <Ban className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, user)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input
                type="email"
                required
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Add User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <Input
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input
                type="email"
                required
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password (leave blank to keep current)
              </label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{userToDelete?.userName}</strong> ({userToDelete?.userEmail})? 
              This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={confirmDeleteUser}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete User"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagementPage;

