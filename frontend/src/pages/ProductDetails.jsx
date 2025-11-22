import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost/APPDEV/backend/index.php?action=fetch_product_details&id=${id}`);
      if (!res.ok) throw new Error('Failed to fetch product');
      const data = await res.json();
      if (data.type === 'error') throw new Error(data.message);
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'http://localhost/APPDEV/backend/index.php?action=add_to_cart';
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'product_id';
    idInput.value = id;
    const qtyInput = document.createElement('input');
    qtyInput.type = 'hidden';
    qtyInput.name = 'quantity';
    qtyInput.value = quantity;
    form.appendChild(idInput);
    form.appendChild(qtyInput);
    document.body.appendChild(form);
    form.submit();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Product not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-gray-500 mb-2">Category: {product.category_name || ''}</div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="text-2xl font-bold mb-4">₱{parseFloat(product.price).toFixed(2)}</div>
          <div className="mb-4">Stock: {product.quantity}</div>
          <p className="text-gray-600 mb-4 whitespace-pre-line">{product.description}</p>
        </div>
        <div>
          <form onSubmit={(e) => { e.preventDefault(); addToCart(); }}>
            <label className="block mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              max={product.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>
            <a href="/shop" className="block mt-4 text-gray-600 hover:text-gray-800">Continue Shopping</a>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
