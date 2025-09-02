'use client';

import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { User } from '@/types';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface UserForm {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'employee';
}

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserForm>();

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      // If endpoint doesn't exist, create mock data for demo
      setUsers([
        {
          _id: '1',
          name: 'System Administrator',
          email: 'admin@inventory.com',
          role: 'admin'
        },
        {
          _id: '2',
          name: 'John Employee',
          email: 'john@inventory.com',
          role: 'employee'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserForm) => {
    try {
      if (editingUser) {
        // Update user (password optional for updates)
        const updateData: any = { ...data };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/users/${editingUser._id}`, updateData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        await api.post('/auth/register', data);
        toast.success('User created successfully');
      }

      fetchUsers();
      setShowForm(false);
      setEditingUser(null);
      reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '', // Don't pre-fill password
    });
    setShowForm(true);
  };

  const handleDelete = async (_id: string) => {
    if (_id === currentUser?._id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${_id}`);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    reset();
  };

  // Redirect if not admin
  if (currentUser?.role !== 'admin') {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="mx-auto h-20 w-20 text-gray-300 mb-6">
              <ShieldCheckIcon />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-lg text-gray-500 max-w-md mx-auto">
              You don't have permission to access the user management area.
            </p>
            <div className="mt-8">
              <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-200">
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Administrator access required
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <UsersIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <p className="mt-4 text-lg font-medium text-gray-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in mt-16">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-xl">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
                <p className="text-lg text-gray-600">Manage system users and their permissions</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2 self-start lg:self-auto"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card-modern">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="card-modern">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Administrators</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>
          <div className="card-modern">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <UserIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Employees</p>
                <p className="text-3xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'employee').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="card-modern max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-xl">
                    {editingUser ? (
                      <PencilIcon className="h-6 w-6 text-primary-600" />
                    ) : (
                      <PlusIcon className="h-6 w-6 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingUser ? 'Edit User' : 'Add New User'}
                    </h2>
                    <p className="text-gray-600">
                      {editingUser ? 'Update user information and permissions' : 'Create a new user account'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <input
                      {...register('name', { required: 'Name is required' })}
                      type="text"
                      className="input-field"
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      type="email"
                      className="input-field"
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                      {editingUser && (
                        <span className="text-gray-500 font-normal ml-1">
                          (leave blank to keep current)
                        </span>
                      )}
                    </label>
                    <input
                      {...register('password', {
                        required: editingUser ? false : 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type="password"
                      className="input-field"
                      placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Role
                    </label>
                    <select
                      {...register('role', { required: 'Role is required' })}
                      className="input-field"
                    >
                      <option value="">Select role...</option>
                      <option value="employee">Employee</option>
                      <option value="admin">Administrator</option>
                    </select>
                    {errors.role && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <button type="submit" className="btn-primary flex-1 sm:flex-none">
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-secondary flex-1 sm:flex-none">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="table-container">
          <div className="px-8 py-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">All Users</h3>
            <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-16 w-16 text-gray-300 mb-4">
                <UsersIcon />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first user to the system.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add First User</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">User</th>
                    <th className="table-header-cell">Email</th>
                    <th className="table-header-cell">Role</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-clors">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            {user._id === currentUser?._id && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="ml-4">
                            <p className="font-semibold text-gray-900">{user.name}</p>
                            {user._id === currentUser?._id && (
                              <p className="text-sm text-primary-600 font-medium">(You)</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <p className="text-gray-900">{user.email}</p>
                      </td>
                      <td className="table-cell">
                        <span className={`modern-badge ${user.role === 'admin'
                          ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-200'
                          : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200'
                          }`}>
                          {user.role === 'admin' ? (
                            <>
                              <ShieldCheckIcon className="h-3 w-3 mr-1" />
                              Administrator
                            </>
                          ) : (
                            <>
                              <UserIcon className="h-3 w-3 mr-1" />
                              Employee
                            </>
                          )}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="modern-badge bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Active
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-xl transition-all duration-200"
                            title="Edit user"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {user._id !== currentUser?._id && (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200"
                              title="Delete user"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="card-modern bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-xl">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-bold text-blue-900 mb-3">
                User Management Guide
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Administrators can manage all system features including users</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>Employees can add cartons, create assignments, and view their history</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>You cannot delete your own account for security reasons</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span>When editing users, leave password blank to keep current password</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage;