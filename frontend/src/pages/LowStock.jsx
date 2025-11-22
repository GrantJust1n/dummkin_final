import React, { useState, useEffect } from 'react';

function LowStockProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLowStock = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost/ims/backend/index.php?action=low_stock');
      if (!response.ok) throw new Error('Failed to fetch low stock products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Request notification permission once
  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Poll every 2 seconds
  useEffect(() => {
    fetchLowStock();
    const interval = setInterval(fetchLowStock, 2000); // 2000ms = 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Show notification when products update and permission granted
  useEffect(() => {
    if (products.length > 0 && Notification.permission === 'granted') {
      new Notification('Low Stock Alert', {
        body: `${products.length} product(s) running low on stock.`,
      });
    }
  }, [products]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Low Stock Products</h2>
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.pid}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <img
                src={`http://localhost/ims/backend/uploads/${product.image_path}`}
                alt={product.pname}
                className="w-full h-60 object-contain rounded mb-2"
              />
              <h3 className="text-lg font-semibold">{product.pname}</h3>
              <p className="text-sm text-gray-600">Category: {product.pcategory}</p>
              <p className="text-sm text-gray-600">
                Warehouse: {product.warehouse_name ?? product.warehouse}
              </p>
              <p className="text-sm font-medium text-red-600">
                Stock: {product.stock_quantity}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No low stock products found.</p>
      )}
    </div>
  );
}

export default LowStockProducts;
