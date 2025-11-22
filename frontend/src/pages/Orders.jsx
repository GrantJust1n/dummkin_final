import { useEffect, useState } from 'react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      if (data.type === 'error') throw new Error(data.message);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">#</th>
            <th className="border border-gray-300 p-2">Date</th>
            <th className="border border-gray-300 p-2">Status</th>
            <th className="border border-gray-300 p-2">Payment</th>
            <th className="border border-gray-300 p-2 text-right">Total</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? orders.map((order) => (
            <tr key={order.id}>
              <td className="border border-gray-300 p-2">{order.id}</td>
              <td className="border border-gray-300 p-2">{new Date(order.created_at).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2">{order.order_status}</td>
              <td className="border border-gray-300 p-2">{order.payment_status}</td>
              <td className="border border-gray-300 p-2 text-right">₱{parseFloat(order.total_amount).toFixed(2)}</td>
              <td className="border border-gray-300 p-2">
                <a href={`/order/${order.id}`} className="bg-blue-800 text-white px-3 py-1 rounded hover:bg-blue-900 text-sm">View</a>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className="border border-gray-300 p-2 text-center">No orders yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Orders;
