import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Ban, CheckCircle, Search, UserPlus, Users } from "lucide-react";
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
  const [formData, setFormData] = useState({ userName: "", userEmail: "", password: "", role: "user" });

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await getAllUsersService();
      if (res?.success) {
        setUsers(res.data || []);
      } else {
        toast({ title: "Error", description: res?.message || "Failed to load users", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to load users", variant: "destructive" });
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
        toast({ title: "Success", description: res.message || "User added" });
        setShowAddDialog(false);
        setFormData({ userName: "", userEmail: "", password: "", role: "user" });
        loadUsers();
      } else {
        toast({ title: "Error", description: res?.message || "Failed to add user", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to add user", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handleEditUser(user) {
    setSelectedUser(user);
    setFormData({ userName: user.userName, userEmail: user.userEmail, password: "", role: user.role });
    setShowEditDialog(true);
  }

  async function handleUpdateUser(e) {
    e.preventDefault();
    if (!selectedUser?._id) return;
    setLoading(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      const res = await updateUserService(selectedUser._id, updateData);
      if (res?.success) {
        toast({ title: "Success", description: res.message || "User updated" });
        setShowEditDialog(false);
        setSelectedUser(null);
        setFormData({ userName: "", userEmail: "", password: "", role: "user" });
        loadUsers();
      } else {
        toast({ title: "Error", description: res?.message || "Failed to update", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to update", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleBlock(e, userId) {
    e?.preventDefault(); e?.stopPropagation();
    try {
      const res = await toggleUserBlockService(userId);
      if (res?.success) {
        toast({ title: "Success", description: res.message });
        loadUsers();
      } else {
        toast({ title: "Error", description: res?.message || "Failed", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed", variant: "destructive" });
    }
  }

  function handleDeleteClick(e, user) {
    e?.preventDefault(); e?.stopPropagation();
    setUserToDelete(user);
    setShowDeleteDialog(true);
  }

  async function confirmDeleteUser() {
    if (!userToDelete?._id) return;
    try {
      const res = await deleteUserService(userToDelete._id);
      if (res?.success) {
        toast({ title: "Success", description: res.message || "User deleted" });
        setShowDeleteDialog(false);
        setUserToDelete(null);
        loadUsers();
      } else {
        toast({ title: "Error", description: res?.message || "Failed", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed", variant: "destructive" });
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    admin: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    instructor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    user: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  const darkDialog = "bg-[#0f172a] border-white/10 text-white";
  const darkInput = "bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50";
  const darkLabel = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";
  const darkSelect = "bg-[#0f172a] border-white/10 text-gray-300";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all users: Students, Instructors, and Admins</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-[#0f172a]/60 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-blue-500/50"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className={`w-full sm:w-48 rounded-xl ${darkSelect}`}>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f172a] border-white/10 text-gray-200">
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">Student</SelectItem>
            <SelectItem value="instructor">Instructor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur">
        <CardHeader className="border-b border-white/5 px-6 py-4">
          <CardTitle className="text-base font-black text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            All Users
            <span className="text-gray-500 font-bold">({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pl-6">Name</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Email</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Role</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-white pl-6">{user.userName}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{user.userEmail}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${roleColors[user.role] || roleColors.user}`}>
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.isBlocked ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">Blocked</span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleEditUser(user)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.isBlocked ? (
                            <button onClick={(e) => handleToggleBlock(e, user._id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all" title="Unblock">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={(e) => handleToggleBlock(e, user._id)} className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-gray-500 hover:text-yellow-400 transition-all" title="Block">
                              <Ban className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={(e) => handleDeleteClick(e, user)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
        <DialogContent className={darkDialog}>
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 mt-2">
            <div>
              <label className={darkLabel}>Name *</label>
              <Input required value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} placeholder="Enter name" className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>Email *</label>
              <Input type="email" required value={formData.userEmail} onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })} placeholder="Enter email" className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>Password *</label>
              <Input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password" className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>Role *</label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className={`rounded-xl ${darkSelect}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-gray-200">
                  <SelectItem value="user">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddDialog(false)} className="border border-white/10 text-gray-300 hover:bg-white/5 rounded-xl">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">Add User</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className={darkDialog}>
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateUser} className="space-y-4 mt-2">
            <div>
              <label className={darkLabel}>Name *</label>
              <Input required value={formData.userName} onChange={(e) => setFormData({ ...formData, userName: e.target.value })} className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>Email *</label>
              <Input type="email" required value={formData.userEmail} onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })} className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>New Password (leave blank to keep current)</label>
              <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter new password" className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>Role *</label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className={`rounded-xl ${darkSelect}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-gray-200">
                  <SelectItem value="user">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEditDialog(false)} className="border border-white/10 text-gray-300 hover:bg-white/5 rounded-xl">Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">{loading ? "Updating..." : "Update User"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className={darkDialog}>
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Delete User</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <p className="text-sm text-gray-400">
              Are you sure you want to delete <strong className="text-white">{userToDelete?.userName}</strong> ({userToDelete?.userEmail})?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowDeleteDialog(false)} className="border border-white/10 text-gray-300 hover:bg-white/5 rounded-xl">Cancel</Button>
              <Button type="button" onClick={confirmDeleteUser} disabled={loading} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-bold">
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
