import React, { useState } from "react";

export default function AddToCartModal({ product, onClose }) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) return null;
const handleAddToCart = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  setLoading(true);
  try {
const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=add_to_cart", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  credentials: "include",
  body: new URLSearchParams({
    product_id: product.id,
    quantity: 1,
  }),
});



    const textResponse = await res.text();
    console.log("Raw Server Response:", textResponse); 

    let data;
    try {
      data = JSON.parse(textResponse);
    } catch (jsonError) {
      throw new Error("Server returned invalid JSON");
    }

    if (data.success) {
      setAdded(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      alert(data.message || "Failed to add item");
    }
  } catch (err) {
    console.error("Add to cart error:", err);
    alert("Error: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    // FIXED POSITION: Bottom-Right corner
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 w-80 border border-gray-50">
        
        {/* If successfully added, show success message */}
        {added ? (
          <div className="flex flex-col items-center justify-center py-2 text-green-500">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="font-bold text-gray-800">Added to Cart!</p>
          </div>
        ) : (
          /* Confirmation State (Matches your screenshot) */
          <>
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Add to cart?</h3>
              <p className="text-gray-500 text-sm mt-1">{product.name}</p>
            </div>

            <div className="flex justify-end gap-3">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>

              {/* Add Button */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={loading}
                className="px-6 py-2 rounded-full bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition-colors shadow-sm disabled:bg-gray-300"
              >
                {loading ? "..." : "Add"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 