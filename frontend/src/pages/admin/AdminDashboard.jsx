import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Package,
    ShoppingCart,
    DollarSign,
    Plus,
    Trash2,
    Edit,
    TrendingUp,
    CheckCircle,
    Truck,
    Clock,
    XCircle,
    FolderTree
} from 'lucide-react';
import './Admin.css';
import HeroSettings from './HeroSettings';
import FooterSettings from './FooterSettings';
import StoreSettings from './StoreSettings';
import ManualOrder from './ManualOrder';
import POS from './POS';
import AboutSettings from './AboutSettings';

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('stats');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        recentGrowth: "+12%"
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({
        name: '',
        price: '',
        category: '',
        image: '',  // Primary image
        images: [], // Additional images
        stock: 99,
        description: ''
    });

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                navigate('/');
            } else {
                fetchData();
            }
        }
    }, [user, authLoading]);

    const fetchData = async () => {
        try {
            const pRes = await api.get('/products');
            // Sort products by newest first
            const sortedProducts = pRes.data.sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt || 0);
                const dateB = new Date(b.created_at || b.createdAt || 0);
                if (dateB - dateA !== 0) return dateB - dateA;
                return (b._id || b.id || "").toString().localeCompare((a._id || a.id || "").toString());
            });
            setProducts(sortedProducts);

            const oRes = await api.get('/orders');
            // Sort orders by newest first
            const sortedOrders = oRes.data.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
            setOrders(sortedOrders);

            const cRes = await api.get('/categories');
            setCategories(cRes.data);

            const totalS = oRes.data.reduce((sum, o) => sum + (o.total_amount || 0), 0);
            setStats({
                totalSales: totalS,
                totalOrders: oRes.data.length,
                totalProducts: pRes.data.length,
                recentGrowth: "+12%"
            });
        } catch (err) {
            console.error("Error fetching admin data", err);
        }
    };

    const handleAddOrUpdateProduct = async (e) => {
        e.preventDefault();
        // Exclude technical metadata from the request body
        const { _id, id, created_at, updated_at, ...productData } = newProduct;
        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct._id || editingProduct.id}`, productData);
                alert('Product Updated');
            } else {
                await api.post('/products', productData);
                alert('Product Added');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setNewProduct({ name: '', price: '', category: '', image: '', images: [], stock: 99, description: '' });
            fetchData();
        } catch (err) {
            alert('Action failed');
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Delete this product?')) {
            await api.delete(`/products/${id}`);
            fetchData();
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', newCategory);
            setNewCategory({ name: '', description: '' });
            fetchData();
        } catch (err) {
            alert('Failed to add category. Name might be duplicate.');
        }
    };

    const deleteCategory = async (id) => {
        if (window.confirm('Delete this category? This might affect products using it.')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchData();
            } catch (err) {
                alert('Action failed');
            }
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { order_status: status });
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const orderedOrders = orders.filter(o => o.order_status !== 'delivered' && o.order_status !== 'cancelled');
    const deliveredOrders = orders.filter(o => o.order_status === 'delivered');

    if (authLoading) return <div className="admin-loading">Verifying credentials...</div>;

    return (
        <div className="admin-container">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2>Admin Panel</h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
                        <TrendingUp size={20} /> Dashboard
                    </button>
                    <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
                        <Package size={20} /> Products
                    </button>
                    <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>
                        <FolderTree size={20} /> Categories
                    </button>
                    <button className={activeTab === 'manual-order' ? 'active' : ''} onClick={() => setActiveTab('manual-order')}>
                        📝 Manual Order
                    </button>
                    <button className={activeTab === 'pos' ? 'active' : ''} onClick={() => setActiveTab('pos')}>
                        🛒 POS System
                    </button>
                    <button className={activeTab === 'ordered' ? 'active' : ''} onClick={() => setActiveTab('ordered')}>
                        <Clock size={20} /> Ordered Products
                    </button>
                    <button className={activeTab === 'delivered' ? 'active' : ''} onClick={() => setActiveTab('delivered')}>
                        <CheckCircle size={20} /> Delivered Products
                    </button>
                    <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
                        <Edit size={20} /> Settings
                    </button>
                </nav>
            </aside>

            <main className="admin-main">
                {activeTab === 'stats' && (
                    <div className="stats-grid">
                        <div className="stat-card gold">
                            <div className="stat-info">
                                <span>Total Revenue</span>
                                <h3>{stats.totalSales.toFixed(0)}tk</h3>
                                <p className="growth">{stats.recentGrowth} <span>from last month</span></p>
                            </div>
                            <DollarSign className="stat-icon" size={24} />
                        </div>
                        <div className="stat-card blue">
                            <div className="stat-info">
                                <span>Total Orders</span>
                                <h3>{stats.totalOrders}</h3>
                                <p className="growth">+5% <span>from last month</span></p>
                            </div>
                            <ShoppingCart className="stat-icon" size={24} />
                        </div>
                        <div className="stat-card purple">
                            <div className="stat-info">
                                <span>Total Products</span>
                                <h3>{stats.totalProducts}</h3>
                                <p className="growth">Live in store</p>
                            </div>
                            <Package className="stat-icon" size={24} />
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="admin-section animate-fade">
                        <div className="section-header">
                            <h2>Product Management</h2>
                            <button className="btn-primary" onClick={() => {
                                setEditingProduct(null);
                                setNewProduct({ name: '', price: '', category: '', image: '', images: [], description: '' });
                                setIsModalOpen(true);
                            }}>
                                <Plus size={20} /> Add Product
                            </button>
                        </div>

                        <div className="admin-table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p._id || p.id}>
                                            <td className="product-cell">
                                                <img src={p.image || "https://via.placeholder.com/40"} alt="" />
                                                <span>{p.name}</span>
                                            </td>
                                            <td>{p.category}</td>
                                            <td>{p.price}tk</td>
                                            <td className="actions-cell">
                                                <button onClick={() => { setEditingProduct(p); setNewProduct(p); setIsModalOpen(true); }}><Edit size={16} /></button>
                                                <button className="del" onClick={() => deleteProduct(p._id || p.id)}><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <div className="admin-section animate-fade">
                        <div className="section-header">
                            <h2>Category Management</h2>
                        </div>

                        <div className="category-management-grid">
                            <div className="add-category-card">
                                <h3>Add New Category</h3>
                                <form onSubmit={handleAddCategory}>
                                    <input
                                        placeholder="Category Name (e.g. Electronics)"
                                        value={newCategory.name}
                                        onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                                        required
                                    />
                                    <textarea
                                        placeholder="Description (Optional)"
                                        value={newCategory.description}
                                        onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                                    />
                                    <button type="submit" className="btn-primary">Add Category</button>
                                </form>
                            </div>

                            <div className="admin-table-container">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Slug</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(cat => (
                                            <tr key={cat._id || cat.id}>
                                                <td><strong>{cat.name}</strong></td>
                                                <td>{cat.slug}</td>
                                                <td className="actions-cell">
                                                    <button className="del" onClick={() => deleteCategory(cat._id || cat.id)}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {(activeTab === 'ordered' || activeTab === 'delivered') && (
                    <div className="admin-section animate-fade">
                        <div className="section-header">
                            <h2>{activeTab === 'ordered' ? 'Ordered Products' : 'Delivered Products'}</h2>
                        </div>
                        <div className="admin-orders-list">
                            {(activeTab === 'ordered' ? orderedOrders : deliveredOrders).map(order => (
                                <div key={order._id || order.id} className="admin-order-card">
                                    <div className="order-main-info">
                                        <div className="order-id">
                                            <span>Order ID</span>
                                            <strong>#{order.tracking_id || (order._id || order.id).substring(0, 8)}</strong>
                                        </div>
                                        <div className="order-status-badge" data-status={order.order_status}>
                                            <select
                                                value={order.order_status || 'pending'}
                                                onChange={(e) => handleStatusUpdate(order._id || order.id, e.target.value)}
                                                className="status-select"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="order-details">
                                        <p><strong>Amount:</strong> {order.total_amount}tk</p>
                                        <p><strong>Customer:</strong> {order.shipping_address?.name || 'Guest'}</p>
                                        <p><strong>Address:</strong> {order.shipping_address?.address || 'N/A'}</p>
                                    </div>
                                    <div className="order-items-mini">
                                        {order.items?.map((item, idx) => (
                                            <span key={idx}>{item.name} (x{item.quantity})</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="admin-section animate-fade">
                        <div className="settings-tabs">
                            <button className="settings-tab-btn active">Hero Images</button>
                            <button className="settings-tab-btn">Footer</button>
                            <button className="settings-tab-btn">Stores</button>
                        </div>

                        <div className="settings-content">
                            <HeroSettings />
                            <FooterSettings />
                            <StoreSettings />
                        </div>
                    </div>
                )}
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="admin-modal">
                        <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                        <form onSubmit={handleAddOrUpdateProduct}>
                            <input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                            <input placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                            <input placeholder="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required />

                            <select
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id || cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Primary Image URL *</label>
                                <input
                                    placeholder="Primary Image URL"
                                    value={newProduct.image}
                                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                    required
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Additional Images (Optional)</label>
                                {(newProduct.images || []).map((img, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                                        <input
                                            value={img}
                                            onChange={e => {
                                                const updated = [...(newProduct.images || [])];
                                                updated[idx] = e.target.value;
                                                setNewProduct({ ...newProduct, images: updated });
                                            }}
                                            placeholder={`Image URL ${idx + 1}`}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = (newProduct.images || []).filter((_, i) => i !== idx);
                                                setNewProduct({ ...newProduct, images: updated });
                                            }}
                                            style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setNewProduct({ ...newProduct, images: [...(newProduct.images || []), ''] })}
                                    style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}
                                >
                                    + Add Image
                                </button>
                            </div>

                            <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{editingProduct ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
