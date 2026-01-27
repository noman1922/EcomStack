import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', description: '' });

    useEffect(() => {
        if (user?.role !== 'admin') {
            navigate('/');
        } else {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        const pRes = await api.get('/products');
        setProducts(pRes.data);
        const oRes = await api.get('/orders'); // Admin should get ALL orders. Backend needs update.
        setOrders(oRes.data);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        await api.post('/products', newProduct);
        alert('Product Added');
        setNewProduct({ name: '', price: '', category: '', image: '', description: '' });
        fetchData();
    };

    const handleStatusUpdate = async (id, status) => {
        // Need specific endpoint for status update
        await api.put(`/orders/${id}/status`, { order_status: status });
        fetchData();
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Panel</h1>
            <div className="admin-tabs">
                <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>Products</button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
            </div>

            {activeTab === 'products' && (
                <div className="admin-section">
                    <h2>Add Product</h2>
                    <form onSubmit={handleAddProduct} className="add-product-form">
                        <input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                        <input placeholder="Price" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                        <input placeholder="Category" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} required />
                        <input placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                        <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                        <button type="submit">Add Product</button>
                    </form>

                    <h2>Product List</h2>
                    <div className="admin-product-list">
                        {products.map(p => (
                            <div key={p.id} className="admin-product-item">
                                <span>{p.name} - ${p.price}</span>
                                <button onClick={async () => { await api.delete(`/products/${p.id || p._id}`); fetchData(); }}>Delete</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div className="admin-section">
                    <h2>Manage Orders</h2>
                    {orders.map(order => (
                        <div key={order.id} className="admin-order-item">
                            <div>
                                <strong>Order #{order.tracking_id}</strong> - {order.order_status}
                                <p>User ID: {order.user_id}</p>
                            </div>
                            <div className="order-actions">
                                <button onClick={() => handleStatusUpdate(order.id || order._id, 'shipped')}>Mark Shipped</button>
                                <button onClick={() => handleStatusUpdate(order.id || order._id, 'delivered')}>Mark Delivered</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
