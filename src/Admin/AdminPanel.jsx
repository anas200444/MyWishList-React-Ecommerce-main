import React, { useState, useEffect } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";

export function AdminPanel() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollectionRef = collection(db, "orders"); // assuming you have an "orders" collection
        const ordersSnapshot = await getDocs(ordersCollectionRef);
        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Admin Panel - User Orders</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User Name</th>
            <th>Product Names</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.userName}</td> {/* Assuming orders contain a userName field */}
              <td>
                {order.products.map((product) => product.name).join(", ")} {/* Assuming order contains products array */}
              </td>
              <td>${order.totalPrice}</td> {/* Assuming order contains totalPrice */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
