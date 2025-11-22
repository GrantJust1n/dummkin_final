import React, { useEffect, useState } from 'react';

const Checkout = () => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost/APPDEV/backend/index.php?action=fetch_cart');
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      if (data.type === 'error') throw new Error(data.message);
      setCart(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (cart.items.length === 0) {
    window.location.href = '/cart';
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded p-4">
          <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
          <form action="http://localhost/APPDEV/backend/index.php?action=place_order" method="POST">
            <label className="block mb-2">Shipping Address</label>
            <textarea
              name="shipping_address"
              rows="4"
              className="w-full p-2 border rounded mb-4"
              required
            />
            <label className="block mb-2">Payment Method</label>
            <select name="payment_method" className="w-full p-2 border rounded mb-4" required>
              <option value="cod">Cash on Delivery</option>
              <option value="paymongo">PayMongo</option>
            </select>
            <input type="hidden" name="csrf" value={Math.random().toString(36)} />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Place Order</button>
            <a href="/cart" className="ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 inline-block">Back to Cart</a>
          </form>
        </div>
        <div className="border rounded p-4">
          <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Item</th>
                <th className="border p-2 text-right">Qty</th>
                <th className="border p-2 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.product_id}>
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2 text-right">{item.quantity}</td>
                  <td className="border p-2 text-right">₱{(parseFloat(item.price) * parseInt(item.quantity)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th colSpan="2" className="border p-2 text-right">Subtotal</th>
                <th className="border p-2 text-right">₱{parseFloat(cart.subtotal).toFixed(2)}</th>
              </tr>
              <tr>
                <th colSpan="2" className="border p-2 text-right">Shipping</th>
                <th className="border p-2 text-right">₱0.00</th>
              </tr>
              <tr>
                <th colSpan="2" className="border p-2 text-right">Total</th>
                <th className="border p-2 text-right">₱{parseFloat(cart.subtotal).toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
