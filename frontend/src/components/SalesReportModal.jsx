import { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Printer, Download } from 'lucide-react';
import './SalesReportModal.css';

const SalesReportModal = ({ onClose }) => {
    const [salesData, setSalesData] = useState({
        pos: { count: 0, revenue: 0 },
        manual: { count: 0, revenue: 0 },
        online: { count: 0, revenue: 0 },
        totalDeliveryCharges: 0,
        totalRevenue: 0
    });
    const [dateRange, setDateRange] = useState('all'); // 'today', 'week', 'month', 'all'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSalesData();
    }, [dateRange]);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/sales-report?range=${dateRange}`);
            setSalesData(res.data);
        } catch (err) {
            console.error('Error fetching sales data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="sales-report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header no-print">
                    <h2>📊 Sales Report</h2>
                    <div className="header-actions">
                        <button onClick={handlePrint} className="btn-icon">
                            <Printer size={20} />
                        </button>
                        <button onClick={onClose} className="btn-close">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="date-filter no-print">
                    <button
                        className={dateRange === 'today' ? 'active' : ''}
                        onClick={() => setDateRange('today')}
                    >
                        Today
                    </button>
                    <button
                        className={dateRange === 'week' ? 'active' : ''}
                        onClick={() => setDateRange('week')}
                    >
                        This Week
                    </button>
                    <button
                        className={dateRange === 'month' ? 'active' : ''}
                        onClick={() => setDateRange('month')}
                    >
                        This Month
                    </button>
                    <button
                        className={dateRange === 'all' ? 'active' : ''}
                        onClick={() => setDateRange('all')}
                    >
                        All Time
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Loading sales data...</div>
                ) : (
                    <div className="report-content">
                        <div className="report-header-print">
                            <h1>EcomStack Sales Report</h1>
                            <p>Generated: {new Date().toLocaleString()}</p>
                            <p>Period: {dateRange === 'today' ? 'Today' : dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : 'All Time'}</p>
                        </div>

                        <div className="sales-summary">
                            <div className="summary-card total">
                                <h3>Total Revenue</h3>
                                <p className="amount">{salesData.totalRevenue.toFixed(2)}tk</p>
                            </div>
                        </div>

                        <div className="sales-breakdown">
                            <h3>Sales Breakdown</h3>

                            <div className="breakdown-card pos">
                                <div className="card-header">
                                    <span className="icon">📍</span>
                                    <h4>POS Sales</h4>
                                </div>
                                <div className="card-stats">
                                    <div className="stat">
                                        <span className="label">Orders</span>
                                        <span className="value">{salesData.pos.count}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Revenue</span>
                                        <span className="value">{salesData.pos.revenue.toFixed(2)}tk</span>
                                    </div>
                                </div>
                            </div>

                            <div className="breakdown-card manual">
                                <div className="card-header">
                                    <span className="icon">📝</span>
                                    <h4>Manual Orders</h4>
                                </div>
                                <div className="card-stats">
                                    <div className="stat">
                                        <span className="label">Orders</span>
                                        <span className="value">{salesData.manual.count}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Revenue</span>
                                        <span className="value">{salesData.manual.revenue.toFixed(2)}tk</span>
                                    </div>
                                </div>
                            </div>

                            <div className="breakdown-card online">
                                <div className="card-header">
                                    <span className="icon">🌐</span>
                                    <h4>Online Orders</h4>
                                </div>
                                <div className="card-stats">
                                    <div className="stat">
                                        <span className="label">Orders</span>
                                        <span className="value">{salesData.online.count}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="label">Revenue</span>
                                        <span className="value">{salesData.online.revenue.toFixed(2)}tk</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="delivery-charges">
                            <h3>Delivery Charges</h3>
                            <p className="amount">{salesData.totalDeliveryCharges.toFixed(2)}tk</p>
                            <small>Total delivery fees collected</small>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesReportModal;
