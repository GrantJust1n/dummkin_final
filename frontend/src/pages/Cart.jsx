import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Cart = () => {
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
      const res = await fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_cart');
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

  const updateCart = (updates) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://localhost/APPDEV/backend/index.php?action=update_cart';
    updates.forEach(update => {
      const idInput = document.createElement('input');
      idInput.type = 'hidden';
      idInput.name = `qty[${update.product_id}]`;
      idInput.value = update.quantity;
      form.appendChild(idInput);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const removeFromCart = (productId) => {
    window.location.href = `http://localhost/Appzip/APPDEV/backend/index.php?action=update_cart&remove=${productId}`;
  };

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cart Items</h1>

      <form action="http://localhost/Appzip/APPDEV/backend/index.php?action=update_cart" method="POST">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Product</th>
              <th className="border border-gray-300 p-2 text-right">Price</th>
              <th className="border border-gray-300 p-2 text-right">Quantity</th>
              <th className="border border-gray-300 p-2 text-right">Line Total</th>
              <th className="border border-gray-300 p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.length > 0 ? cart.items.map((item) => {
              const lineTotal = parseFloat(item.price) * parseInt(item.quantity);
              return (
                <tr key={item.product_id}>
                  <td className="border border-gray-300 p-2">
                    <strong>{item.name}</strong><br />
                    <span className="text-gray-500">In stock: {item.stock}</span>
                  </td>
                  <td className="border border-gray-300 p-2 text-right">₱{parseFloat(item.price).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-right">
                    <input
                      type="number"
                      name={`qty[${item.product_id}]`}
                      min="0"
                      max={item.stock}
                      defaultValue={item.quantity}
                      className="w-16 text-center border rounded"
                    />
                  </td>
                  <td className="border border-gray-300 p-2 text-right">₱{lineTotal.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2">
                    <a
                      href={`http://localhost/APPDEV/backend/index.php?action=update_cart&remove=${item.product_id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                    >
                      Remove
                    </a>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="5" className="border border-gray-300 p-2 text-center">Your cart is empty.</td>
              </tr>
            )}
          </tbody>
        </table>

        {cart.items.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div>
              <a href="/shop" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">Continue Shopping</a>
            </div>
            <div className="text-right">
              <div>Items: {cart.count}</div>
              <div><strong>Subtotal: ₱{parseFloat(cart.subtotal).toFixed(2)}</strong></div>
              <div className="mt-4">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2">Update Cart</button>
                <a href="/checkout" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Checkout</a>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default Cart;
