import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const OrderView = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost/APPDEV/backend/index.php?action=fetch_order_details&id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch order');
      const data = await res.json();
      if (data.type === 'error') throw new Error(data.message);
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Order #{order.id}</h1>

      <div className="border rounded p-4 mb-6">
        <div><strong>Status:</strong> {order.order_status} (Payment: {order.payment_status})</div>
        <div className="text-gray-500">Placed: {new Date(order.created_at).toLocaleString()}</div>
        <div><strong>Total:</strong> ₱{parseFloat(order.total_amount).toFixed(2)}</div>
        <div><strong>Shipping:</strong> {order.shipping_address}</div>
        <div><strong>Payment Method:</strong> {order.payment_method}</div>
      </div>

      <div className="border rounded p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Product</th>
              <th className="border p-2 text-right">Qty</th>
              <th className="border p-2 text-right">Unit Price</th>
              <th className="border p-2 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.product_id}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2 text-right">₱{parseFloat(item.unit_price).toFixed(2)}</td>
                <td className="border p-2 text-right">₱{parseFloat(item.total_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderView;
