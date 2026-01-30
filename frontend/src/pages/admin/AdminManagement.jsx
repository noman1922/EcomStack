import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Trash2, Shield, User } from 'lucide-react';
import './AdminManagement.css';

const AdminManagement = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admins');
            setAdmins(res.data);
        } catch (err) {
            console.error('Error fetching admins:', err);
            alert(err.response?.data?.message || 'Failed to load admins');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e) => {
        e.preventDefault();

        if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
            alert('Please fill all fields');
            return;
        }

        try {
            await api.post('/admins', newAdmin);
            alert('Admin created successfully!');
            setNewAdmin({ name: '', email: '', password: '' });
            setShowAddForm(false);
            fetchAdmins();
        } catch (err) {
            console.error('Error creating admin:', err);
            alert(err.response?.data?.message || 'Failed to create admin');
        }
    };

    const handleDeleteAdmin = async (adminId, adminName) => {
        if (!window.confirm(`Are you sure you want to delete admin "${adminName}"?`)) {
            return;
        }

        try {
            await api.delete(`/admins/${adminId}`);
            alert('Admin deleted successfully');
            fetchAdmins();
        } catch (err) {
            console.error('Error deleting admin:', err);
            alert(err.response?.data?.message || 'Failed to delete admin');
        }
    };

    // Only super admin can access this
    if (!user?.is_super_admin) {
        return (
            <div className="admin-management-restricted">
                <Shield size={48} className="restricted-icon" />
                <h2>Access Restricted</h2>
                <p>Only super administrators can manage admin users.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="loading">Loading admins...</div>;
    }

    return (
        <div className="admin-management">
            <div className="section-header">
                <h2>👥 Admin Management</h2>
                <button
                    className="btn-primary"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <UserPlus size={18} />
                    {showAddForm ? 'Cancel' : 'Add Admin'}
                </button>
            </div>

            {showAddForm && (
                <div className="add-admin-form">
                    <h3>Create New Admin</h3>
                    <form onSubmit={handleCreateAdmin}>
                        <input
                            type="text"
                            placeholder="Admin Name"
                            value={newAdmin.name}
                            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (min 6 characters)"
                            value={newAdmin.password}
                            onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                            required
                            minLength={6}
                        />
                        <button type="submit" className="btn-primary">
                            Create Admin
                        </button>
                    </form>
                </div>
            )}

            <div className="admins-list">
                {admins.length === 0 ? (
                    <p className="empty-state">No admins found</p>
                ) : (
                    <div className="admins-grid">
                        {admins.map((admin) => (
                            <div key={admin._id} className="admin-card">
                                <div className="admin-info">
                                    <div className="admin-avatar">
                                        {admin.is_super_admin ? (
                                            <Shield size={24} className="super-admin-icon" />
                                        ) : (
                                            <User size={24} />
                                        )}
                                    </div>
                                    <div className="admin-details">
                                        <h4>{admin.name}</h4>
                                        <p>{admin.email}</p>
                                        {admin.is_super_admin && (
                                            <span className="super-badge">Super Admin</span>
                                        )}
                                        <small>Added {new Date(admin.created_at).toLocaleDateString()}</small>
                                    </div>
                                </div>
                                {!admin.is_super_admin && admin._id !== user._id && (
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteAdmin(admin._id, admin.name)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminManagement;
