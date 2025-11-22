import React, { useEffect, useState } from 'react';

function CategoryProducts() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch categories and load the first one by default
  useEffect(() => {
    fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          fetchProductsByCategory(data[0].id); // Auto-load first category
        }
      })
      .catch((err) => {
        console.error('Category fetch error:', err);
        setError('Failed to load categories.');
      });
  }, []);

  // Fetch products when category is selected
  const fetchProductsByCategory = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_products_by_category&category_id=${categoryId}`
      );
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Product fetch error:', err);
      setError('Failed to load products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Show pills only after loading first category */}
      {selectedCategoryId && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-3 text-gray-700">Categories</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => fetchProductsByCategory(category.id)}
                className={`whitespace-nowrap px-5 py-2 rounded-full border text-sm transition font-medium ${
                  selectedCategoryId === category.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-100 text-gray-800 hover:bg-blue-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCategoryId && (
        <>
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Products</h3>

          {loading && <div className="text-gray-500 mb-4">Loading products...</div>}
          {error && <div className="text-red-500 mb-4">{error}</div>}

          {!loading && products.length === 0 && !error && (
            <div className="text-gray-600">No products found in this category.</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.pid}
                className="border rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="w-full aspect-square bg-gray-50 flex items-center justify-center rounded-lg overflow-hidden mb-4">
                  <img
                    src={`http://localhost/Appzip/APPDEV/backend/uploads/${product.image_path}`}
                    alt={product.pname}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <p className="text-center font-semibold text-gray-800">{product.pname}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CategoryProducts;
