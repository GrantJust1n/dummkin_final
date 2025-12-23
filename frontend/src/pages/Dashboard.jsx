import React, { useContext, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import CategoryProducts from "../Components/CategoryProduct";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastProduct, setToastProduct] = useState(null);

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  // --- SLIDER SETUP ---------------------------------
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Main Slider Banners (Left Large Block)
  const adBanners = [
    {
      id: 1,
      image: "banner11.png", 
      title: "You 'Kin Do It!",
      subtitle: "Start your day right",
      // Gradient matching the left side of your reference image
      bgClass: "bg-gradient-to-r from-orange-400 to-pink-500"
    },
    {
      id: 2,
      image: "banner22.png",
      title: "Sweet Treats",
      subtitle: "Discover new favorites",
      bgClass: "bg-gradient-to-r from-pink-500 to-orange-400"
    },
    {
      id: 3,
      image: "banner3.png",
      title: "Perfect Pairings",
      subtitle: "Coffee & Donuts",
      bgClass: "bg-gradient-to-r from-orange-500 to-red-500"
    }
  ];

 
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) =>
        prevIndex === adBanners.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // Slower interval for better readability

    return () => clearInterval(interval);
  }, [adBanners.length]);


  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return true;
    return product.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const confirmAddToCart = async (product) => {
    try {
      const res = await fetch(
        "http://localhost/Appzip/APPDEV/backend/index.php?action=add_to_cart",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ product_id: product.id, quantity: 1 }),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data.success) alert(data.message || "Failed to add to cart");
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setToastProduct(null);
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_products");
        const data = await res.json();
        if (data.success) setProducts(data.products);
        else setProducts([]);
      } catch (err) {
        console.error("Error loading products:", err);
      }
      setLoading(false);
    };
    loadProducts();
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-4">Welcome to Donut Delights!</h1>
        <p className="text-lg">
          Please <Link to="/login" className="text-orange-500 font-semibold">login</Link> or <Link to="/register" className="text-orange-500 font-semibold">register</Link> to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      
      {/* --- NEW BANNER SECTION: BENTO GRID STYLE --- */}
      <div className="w-full bg-[#FFF7F5] py-8">
        {/* Changed grid layout to md:grid-cols-3 to create the Large Left / Stacked Right effect */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-4 px-4 h-auto md:h-[500px]">
          
          {/* 1. LEFT LARGE BLOCK (SLIDESHOW) - Spans 2 columns */}
          <div className={`md:col-span-2 relative rounded-3xl overflow-hidden shadow-xl group transition-all duration-500 ${adBanners[currentAdIndex].bgClass}`}>
            {/* Background Image */}
            <img 
              src={`http://localhost/Appzip/APPDEV/backend/uploads/${adBanners[currentAdIndex].image}`}   
              alt="Main Banner" 
              className="absolute right-0 top-0 h-full w-2/3 object-contain object-right opacity-90 transition-transform duration-700 ease-in-out group-hover:scale-105"
            />
            
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent"></div>

            {/* Text Content */}
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 max-w-sm z-10">
               <h1 className="text-5xl font-black text-white leading-tight drop-shadow-lg mb-4">
                 {adBanners[currentAdIndex].title}
               </h1>
               <p className="text-white text-xl font-medium mb-6 drop-shadow-md">
                 {adBanners[currentAdIndex].subtitle}
               </p>
               <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 hover:scale-105 transition transform">
                 Order Now →
               </button>
            </div>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-10 flex gap-2 z-20">
              {adBanners.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-2 rounded-full transition-all duration-300 ${idx === currentAdIndex ? 'bg-white w-8' : 'bg-white/50 w-2'}`}
                />
              ))}
            </div>
          </div>

          {/* 2. RIGHT COLUMN (STACKED BLOCKS) - Spans 1 column */}
          <div className="md:col-span-1 flex flex-col gap-4 h-full">
            
            {/* Top Block: "Get 25% Off" style */}
            <div className="flex-1 rounded-3xl bg-orange-500 relative overflow-hidden shadow-lg group">
              <div className="absolute inset-0 bg-[url('http://localhost/Appzip/APPDEV/backend/uploads/prod_6930538a89d8a6.47305563.png')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition"></div>
              <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
                <span className="bg-white text-orange-600 text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">LIMITED TIME</span>
                <h2 className="text-3xl font-black leading-none mb-1">Get 25% Off</h2>
                <p className="text-orange-100 text-sm">Sip, bite, and save on all donuts!</p>
              </div>
            </div>

            {/* Bottom Block: "Happy Hour" style */}
            <div className="flex-1 rounded-3xl bg-pink-500 relative overflow-hidden shadow-lg group">
              {/* Using another image from your list as background decoration */}
              <img 
                src="http://localhost/Appzip/APPDEV/backend/uploads/prod_693051175ca030.27129765.png" 
                alt="Donut decoration"
                className="absolute -bottom-4 -right-4 w-32 h-32 object-contain opacity-50 rotate-12 group-hover:scale-110 transition"
              />
              <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
                <h2 className="text-3xl font-black leading-none mb-1">Happy Hour!</h2>
                <p className="text-pink-100 font-semibold mb-2">2 PM - 6 PM</p>
                <p className="text-sm opacity-90">Discounted iced drinks every afternoon.</p>
              </div>
            </div>

          </div>

        </div>
      </div>
      {/* ------------------------------- */}

      <CategoryProducts />

      {/* Product Grid Section */}
      <div className="max-w-6xl mx-auto mt-16 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {searchQuery ? `Search results for "${searchQuery}"` : "All Menu Items"}
          </h2>
          <p className="text-gray-500">{filteredProducts.length} items</p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-3xl shadow hover:shadow-xl transition p-4">
                  <div className="relative">
                    <img
                      src={`http://localhost/Appzip/APPDEV/backend/uploads/${p.image_path}`}
                      alt={p.name}
                      className="w-full h-40 object-cover rounded-2xl"
                    />
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">POPULAR</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <span className="text-pink-600 font-bold">${p.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{p.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-xs text-gray-400">{p.calories ?? "200"} kcal</p>
                    <button onClick={() => setToastProduct(p)} className="bg-pink-100 text-pink-600 rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-pink-200">+</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">No products found matching "{searchQuery}"</div>
            )}
          </div>
        )}

        {toastProduct && (
          <div className="fixed bottom-6 right-6 bg-white shadow-xl rounded-2xl p-4 w-80 z-50 animate-fade-in">
            <h3 className="font-bold text-gray-800">Add to cart?</h3>
            <p className="text-sm text-gray-600 mt-1">{toastProduct.name}</p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setToastProduct(null)} className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm">Cancel</button>
              <button onClick={() => confirmAddToCart(toastProduct)} className="px-3 py-1 rounded-full bg-pink-500 text-white hover:bg-pink-600 text-sm">Add</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}