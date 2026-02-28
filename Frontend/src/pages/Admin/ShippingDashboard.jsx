import React, { useState, useEffect } from "react";
import shippingService from "../../services/shipping.service";
import orderService from "../../services/order.service";

const ShippingDashboard = () => {
    const [shippings, setShippings] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [newShipping, setNewShipping] = useState({
        courierService: "",
        trackingNumber: "",
        shippingMethod: "Standard"
    });
    const [calculatedCost, setCalculatedCost] = useState(null);

    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [updateStatus, setUpdateStatus] = useState("");

    useEffect(() => {
        fetchShippings();
        fetchOrders(); // We need orders to populate the Create Shipping dropdown
    }, []);

    const fetchShippings = async () => {
        setLoading(true);
        try {
            const res = await shippingService.getAllShippings();
            setShippings(Array.isArray(res.data) ? res.data : []);
            setMessage("");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to load shipping data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        // Fetch orders and filter those with "Paid" status so they can be shipped
        try {
            const res = await orderService.getAllOrders();
            if (Array.isArray(res.data)) {
                // Only Paid orders can be shipped
                setOrders(res.data.filter(order => order.orderStatus === "Paid"));
            }
        } catch (err) {
            console.error("Failed to load orders", err);
        }
    };

    const handleCalculateCost = async () => {
        if (!selectedOrderId) return;
        const o = orders.find(o => String(o.orderId) === String(selectedOrderId));
        if (!o) return;

        try {
            const res = await shippingService.calculateShippingCost(newShipping.shippingMethod, o.shippingAddress);
            setCalculatedCost(res.data.cost);
        } catch (err) {
            setMessage("Failed to calculate cost");
        }
    };

    const handleCreateShipping = async () => {
        if (!selectedOrderId || !newShipping.courierService || !newShipping.trackingNumber) {
            setMessage("Please fill all fields to create shipping.");
            return;
        }

        try {
            await shippingService.createShipping(selectedOrderId, newShipping);
            setMessage("Shipping created successfully");
            setShowCreateModal(false);
            setNewShipping({ courierService: "", trackingNumber: "", shippingMethod: "Standard" });
            setCalculatedCost(null);
            fetchShippings();
            fetchOrders();
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to create shipping.");
        }
    };

    const handleUpdateStatus = async () => {
        try {
            await shippingService.updateShippingStatus(selectedShipping.id, updateStatus);
            setMessage("Shipping status updated successfully");
            setShowUpdateModal(false);
            fetchShippings();
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to update shipping status.");
        }
    };

    const filteredShippings = filterStatus === "All"
        ? shippings
        : shippings.filter(s => s.shippingStatus === filterStatus);

    return (
        <div className="container py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Shipping Dashboard</h2>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    Create Shipping
                </button>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            <div className="admin-card p-4 shadow-sm mb-4">
                <div className="d-flex mb-3 align-items-center">
                    <label className="me-2 fw-bold">Filter By Status:</label>
                    <select
                        className="form-select w-auto"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="All">All</option>
                        <option value="Shipped">Shipped</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>

                {loading ? (
                    <div>Loading shipping data...</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Shipping ID</th>
                                    <th>Order ID</th>
                                    <th>Courier</th>
                                    <th>Tracking Number</th>
                                    <th>Cost</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredShippings.map((shipping) => (
                                    <tr key={shipping.id}>
                                        <td>#{shipping.id}</td>
                                        <td>#{shipping.orderId}</td>
                                        <td>{shipping.courierService}</td>
                                        <td>{shipping.trackingNumber}</td>
                                        <td>${shipping.shippingCost}</td>
                                        <td>
                                            <span className={`badge ${shipping.shippingStatus === 'Delivered' ? 'bg-success' :
                                                    shipping.shippingStatus === 'In Transit' ? 'bg-primary' : 'bg-info'
                                                }`}>
                                                {shipping.shippingStatus}
                                            </span>
                                        </td>
                                        <td>
                                            {shipping.shippingStatus !== 'Delivered' && (
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => {
                                                        setSelectedShipping(shipping);
                                                        setUpdateStatus(shipping.shippingStatus === "Shipped" ? "In Transit" : "Delivered");
                                                        setShowUpdateModal(true);
                                                    }}
                                                >
                                                    Update Status
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredShippings.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center">No shipping records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Shipping Modal */}
            {showCreateModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create Shipping</h5>
                                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Select Order (Paid only)</label>
                                    <select
                                        className="form-select"
                                        value={selectedOrderId}
                                        onChange={(e) => {
                                            setSelectedOrderId(e.target.value);
                                            setCalculatedCost(null);
                                        }}
                                    >
                                        <option value="">-- Select Order --</option>
                                        {orders.map(o => (
                                            <option key={o.orderId} value={o.orderId}>
                                                Order #{o.orderId} - {o.shippingAddress}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Courier Service</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newShipping.courierService}
                                        onChange={(e) => setNewShipping({ ...newShipping, courierService: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Tracking Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newShipping.trackingNumber}
                                        onChange={(e) => setNewShipping({ ...newShipping, trackingNumber: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Shipping Method</label>
                                    <select
                                        className="form-select"
                                        value={newShipping.shippingMethod}
                                        onChange={(e) => {
                                            setNewShipping({ ...newShipping, shippingMethod: e.target.value });
                                            setCalculatedCost(null);
                                        }}
                                    >
                                        <option value="Standard">Standard</option>
                                        <option value="Express">Express</option>
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <button className="btn btn-outline-info btn-sm" onClick={handleCalculateCost} disabled={!selectedOrderId}>
                                        Calculate Cost
                                    </button>
                                    {calculatedCost !== null && (
                                        <span className="ms-3 fw-bold">Cost: ${calculatedCost}</span>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleCreateShipping}>Confirm Shipping</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showUpdateModal && selectedShipping && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Update Shipping Status</h5>
                                <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p><strong>Order ID:</strong> #{selectedShipping.orderId}</p>
                                <p><strong>Current Status:</strong> {selectedShipping.shippingStatus}</p>
                                <div className="mb-3">
                                    <label className="form-label">New Status</label>
                                    <select
                                        className="form-select"
                                        value={updateStatus}
                                        onChange={(e) => setUpdateStatus(e.target.value)}
                                    >
                                        {selectedShipping.shippingStatus === "Shipped" && (
                                            <option value="In Transit">In Transit</option>
                                        )}
                                        {selectedShipping.shippingStatus === "In Transit" && (
                                            <option value="Delivered">Delivered</option>
                                        )}
                                        {/* For strict correctness, we only let them step forward */}
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Close</button>
                                <button type="button" className="btn btn-success" onClick={handleUpdateStatus}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShippingDashboard;
