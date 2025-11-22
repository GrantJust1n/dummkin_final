import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [search, category]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (category) params.append('category', category);
      const res = await fetch(`http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_products&${params}`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      const res = await fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=add_to_cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.type === 'success') {
        alert('Added to cart!');
      } else {
        alert(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      alert('Error adding to cart');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shop</h1>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading products...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {products.length > 0 ? products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-lg">
            <div className="text-gray-500 text-sm mb-2">{product.category_name || ''}</div>
            <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-3">{product.description}</p>
            <p className="text-lg font-bold mb-2">₱{parseFloat(product.price).toFixed(2)}</p>
            <p className="text-gray-500 text-sm mb-4">Stock: {product.quantity}</p>
            <div className="flex gap-2">
              <Link
                to={`/product/${product.id}`}
                className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm"
              >
                View
              </Link>
              <button
                onClick={() => addToCart(product.id)}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Add to Cart
              </button>
            </div>
          </div>
        )) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default Shop;
