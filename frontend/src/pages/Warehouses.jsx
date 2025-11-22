import React, { useEffect, useState } from "react";
import axios from "axios";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          "http://localhost/ims/backend/index.php?action=fetch_warehouses_with_products"
        );
        setWarehouses(response.data);
      } catch (err) {
        setError("Failed to load warehouses.");
        console.error("Error fetching warehouses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouses(); // Automatically fetch on component mount
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Warehouses & Products</h2>

      {loading && <p className="text-gray-500">Loading warehouses...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && warehouses.length === 0 && (
        <p className="text-gray-600">No warehouses found.</p>
      )}

      <div className="space-y-10">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="border rounded-xl p-6 shadow-sm bg-white">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{warehouse.name}</h3>
              <p className="text-sm text-gray-500">{warehouse.address}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {warehouse.products.map((product) => (
                <div
                  key={product.pid}
                  className="border rounded-xl p-4 shadow hover:shadow-md transition duration-300 ease-in-out"
                >
                  <div className="w-full h-48 flex justify-center items-center bg-gray-50 rounded overflow-hidden mb-3">
                    <img
                      src={`http://localhost/ims/backend/uploads/${product.image_path}`}
                      alt={product.pname}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  </div>
                  <h3 className="text-center font-medium text-gray-800">{product.pname}</h3>
                  <p className="text-center text-sm text-gray-500">
                    Stock: {product.stock_quantity}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Warehouses;
