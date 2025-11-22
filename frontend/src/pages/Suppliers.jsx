import React, { useEffect, useState } from 'react';

const SuppliersWithProducts = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost/ims/backend/index.php?action=fetch_suppliers_with_products')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch suppliers with products');
        return res.json();
      })
      .then((data) => setSuppliers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading suppliers and products...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Suppliers and Their Products</h2>

      {suppliers.length === 0 ? (
        <p className="text-gray-500">No suppliers found.</p>
      ) : (
        suppliers.map((supplier) => (
          <div key={supplier.id} className="mb-8 border rounded-lg p-4 shadow">
            <h3 className="text-xl font-semibold">{supplier.name}</h3>
            <p className="text-gray-600">{supplier.contact_email} • {supplier.phone_number}</p>
            <p className="text-gray-600 mb-4">{supplier.address}</p>

            {supplier.products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {supplier.products.map((product) => (
                  <div
                    key={product.pid}
                    className="border rounded-xl p-3 shadow-sm bg-white"
                  >
                    <img
                      src={`http://localhost/ims/backend/${product.image_url}`}
                      alt={product.pname}
                      className="w-full h-40 object-contain rounded mb-2"
                    />
                    <p className="font-medium text-center">{product.pname}</p>
                    <p className="text-sm text-center text-gray-500">Stock: {product.stock_quantity}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products supplied yet.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SuppliersWithProducts;
