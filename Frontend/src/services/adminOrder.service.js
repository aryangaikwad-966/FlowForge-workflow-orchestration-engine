import axios from "axios";
import authHeader from "./auth-header";

const ORDER_API_URL = "http://localhost:8080/api/orders";

const getAllOrders = () => {
    return axios.get(ORDER_API_URL, { headers: authHeader() });
};

const getOrdersByStatus = (status) => {
    return axios.get(ORDER_API_URL + "/filter/" + status, { headers: authHeader() });
};

const updateOrderStatus = (orderId, newStatus) => {
    return axios.put(ORDER_API_URL + "/" + orderId + "/status", newStatus, {
        headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
        }
    });
};

const cancelAnyOrder = (orderId) => {
    return axios.put(ORDER_API_URL + "/" + orderId + "/cancel/admin", {}, { headers: authHeader() });
};

const adminOrderService = {
    getAllOrders,
    getOrdersByStatus,
    updateOrderStatus,
    cancelAnyOrder,
};

export default adminOrderService;
