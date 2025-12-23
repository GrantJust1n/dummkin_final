import React, { useEffect, useState } from "react";
import AddToCartModal from "./AddToCartModal";

export default function CategoryProducts() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            fetchProductsByCategory(data.categories[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Category fetch error:", err);
        setError("Failed to load categories.");
      });
  }, []);

  const fetchProductsByCategory = async (categoryId) => {
    setSelectedCategoryId(categoryId);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_products_by_category&category_id=${categoryId}`
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("Product fetch error:", err);
      setError("Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 px-6">
      {/* CATEGORY PILLS */}
      {categories.length > 0 && (
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-orange-600 text-center uppercase">
            Explore Our Aromatic Flavors
          </h2>
          <div className="w-24 h-1 bg-pink-500 mx-auto rounded-full mt-3 mb-6"></div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => fetchProductsByCategory(cat.id)}
                className={`px-6 py-2 rounded-full text-base font-semibold border-none outline-none ${
                  selectedCategoryId === cat.id
                    ? "bg-orange-500 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-orange-100"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS GRID */}
      {loading && <p className="text-center text-gray-500">Loading products...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl shadow-md p-4 flex flex-col justify-between"
              style={{ transform: 'none', transition: 'none' }} // Force static behavior
            >
              <div>
                <div className="relative">
                  <img
                    src={`http://localhost/Appzip/APPDEV/backend/uploads/${p.image_path}`}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-2xl"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                </div>

                <div className="flex justify-between items-center mt-4">
                  <h3 className="font-bold text-gray-800">{p.name}</h3>
                  <span className="text-pink-600 font-bold">
                    ₱{Number(p.price).toFixed(2)}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                  {p.description}
                </p>
              </div>

              {/* ACTION BUTTON in CategoryProducts.jsx */}
              <button
                type="button"
                className="mt-4 w-full bg-pink-500 text-white py-3 rounded-full font-bold text-base"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedProduct(p);
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedProduct && (
        <AddToCartModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdded={() => console.log("Added to cart")}
        />
      )}
    </div>
  );
}