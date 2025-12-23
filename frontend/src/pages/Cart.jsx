import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Make sure you have installed lucide-react: npm i lucide-react
import { Trash2, Minus, Plus, ChevronLeft } from 'lucide-react';

const Cart = () => {
  // Initialize state with the structure we expect
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  
  // Hardcoded values for mockup. In a real app, these might come from the backend.
  const deliveryFee = 50.00; 
  const taxRate = 0.12;
  const freeDeliveryThreshold = 500.00;

  const BackendURL = 'http://localhost/Appzip/APPDEV/backend/index.php';

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    // Only show full-page loading on the initial fetch
    if (cart.items.length === 0) setLoading(true);
    
    try {
      const res = await fetch(`${BackendURL}?action=fetch_cart`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      
      if (data.type === 'error') throw new Error(data.message);

      // --- FIX FOR "NaN" ISSUE IS HERE ---
      // We map the backend's nested structure to our component's flat state structure.
      setCart({
        items: data.items || [],
        // Safely access subtotal and count from the 'totals' object
        subtotal: data.totals ? data.totals.subtotal : 0,
        count: data.totals ? data.totals.count : 0
      });

    } catch (err) {
      console.error(err.message);
      // Optionally set an error state here to display to the user
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, currentQuantity, change) => {
    const newQuantity = parseInt(currentQuantity) + change;
    // Prevent quantity from going below 1
    if (newQuantity < 1) return; 

    try {
      const formData = new FormData();
      formData.append(`qty[${productId}]`, newQuantity);

      await fetch(`${BackendURL}?action=update_cart`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      // Re-fetch cart to update totals from the backend
      await fetchCart();
    } catch (error) {
      console.error("Failed to update quantity", error);
      await fetchCart(); // Re-fetch to ensure UI is in sync
    }
  };

const removeItem = async (productId) => {
    // A simple confirm dialog before deletion
    if(!window.confirm("Are you sure you want to remove this item?")) return;

    try {
      // FIX: Send a POST request with JSON body instead of a GET request
      await fetch(`${BackendURL}?action=update_cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Tell backend we are sending JSON
        },
        body: JSON.stringify({ remove: productId }), // This matches $input['remove'] in your PHP
        credentials: 'include',
      });
      
      // Re-fetch cart to update UI immediately
      await fetchCart();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading your cart...</div>;
  }

  // Calculations for the summary box
  const subtotalNum = parseFloat(cart.subtotal) || 0;
  const taxNum = subtotalNum * taxRate;
  // Calculate delivery fee: 0 if subtotal > threshold, otherwise use the fixed fee
  const finalDeliveryFee = subtotalNum >= freeDeliveryThreshold ? 0 : deliveryFee;
  const totalNum = subtotalNum + taxNum + finalDeliveryFee;
  const amountToFreeDelivery = freeDeliveryThreshold - subtotalNum;


  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ChevronLeft size={20} />
          <span className="ml-1 font-medium">Back to Menu</span>
        </Link>

        {cart.items.length === 0 ? (
           <div className="text-center p-16 bg-white rounded-2xl shadow-sm">
             <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
             <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
             <Link to="/dashboard" className="bg-[#d5006d] text-white px-8 py-3 rounded-full font-bold hover:bg-[#b0005a] transition-colors shadow-md">
                Start Shopping
             </Link>
           </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* --- Left Column: Cart Items --- */}
            <div className="flex-grow space-y-4">
              {cart.items.map((item) => {
                 // Use item.image from backend if it exists, otherwise use placeholder
                 const imageUrl = item.image 
                ? `http://localhost/Appzip/APPDEV/backend/uploads/${item.image}`
                : "https://placehold.co/120x120/e2e8f0/a0aec0?text=No+Image";

                 return (
                <div key={item.product_id} className="bg-white p-4 md:p-6 rounded-2xl flex gap-4 md:gap-6 items-center shadow-sm relative">
                  {/* Product Image */}
                  <img 
                    src={imageUrl} 
                    alt={item.name} 
                    className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl bg-gray-100"
                  />
                  
                  {/* Product Details */}
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg md:text-xl text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-400 font-medium tracking-wider">IN STOCK: {item.stock}</p>
                    
                    {/* Mobile: Price & Quantity */}
                    <div className="mt-4 flex items-center justify-between md:hidden">
                       <span className="font-bold text-lg text-gray-800">₱{parseFloat(item.price).toFixed(2)}</span>
                       <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
                          <button onClick={() => updateQuantity(item.product_id, item.quantity, -1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={16}/></button>
                          <span className="mx-4 font-bold text-gray-700">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product_id, item.quantity, 1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-600 disabled:opacity-50" disabled={item.quantity >= item.stock}><Plus size={16}/></button>
                        </div>
                    </div>
                  </div>

                  {/* Desktop: Price & Quantity */}
                  <div className="hidden md:flex flex-col items-end gap-4">
                    <span className="font-bold text-xl text-gray-800">₱{parseFloat(item.price).toFixed(2)}</span>
                    
                    <div className="flex items-center bg-gray-100 rounded-full p-1 shadow-inner">
                      <button onClick={() => updateQuantity(item.product_id, item.quantity, -1)}  className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition text-gray-600 disabled:opacity-50" disabled={item.quantity <= 1}>
                        <Minus size={16} />
                      </button>
                      <span className="mx-4 font-bold w-6 text-center text-gray-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity, 1)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition text-gray-600 disabled:opacity-50" disabled={item.quantity >= item.stock}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  
                   {/* Remove Button */}
                   <button 
                      onClick={() => removeItem(item.product_id)}
                      className="text-gray-300 hover:text-red-500 transition absolute top-4 right-4 md:static md:text-gray-400 p-1"
                      title="Remove item"
                    >
                      <Trash2 size={22} />
                  </button>
                </div>
              )})}

               {/* Placeholder for "Complete Your Combo" section */}
               <div className="mt-8 bg-pink-50 p-6 rounded-2xl border border-pink-100">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-[#d5006d] p-1 rounded-md text-white shadow-sm"><Plus size={18}/></span> Complete Your Combo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-50 grayscale">
                     {[1,2,3].map(i => (
                       <div key={i} className="bg-white p-4 rounded-xl text-center shadow-sm">
                          <div className="h-28 bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                          <p className="font-semibold text-gray-700">Combo Item {i}</p>
                          <p className="text-sm text-gray-500">₱XXX.XX</p>
                       </div>
                     ))}
                  </div>
                  <p className="text-center text-sm text-gray-400 mt-4 font-medium">(Placeholder data - requires backend integration)</p>
               </div>
            </div>

            {/* --- Right Column: Order Summary --- */}
            <div className="w-full lg:w-[380px] flex-shrink-0">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm sticky top-8 border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-800 mb-6 tracking-wide uppercase">Order Summary</h2>
                
                <div className="space-y-4 text-gray-600 mb-6 pb-6 border-b border-gray-100 font-medium">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="text-gray-800">₱{subtotalNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (12%)</span>
                    <span className="text-gray-800">₱{taxNum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-gray-800">
                      {finalDeliveryFee === 0 ? <span className="text-green-600">FREE</span> : `₱${finalDeliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {/* Free Delivery Progress Bar */}
                  {amountToFreeDelivery > 0 ? (
                    <div>
                      <div className="text-xs text-center text-gray-500 font-semibold bg-gray-100 py-2 rounded-lg mb-2">
                        ADD <span className="text-[#d5006d]">₱{amountToFreeDelivery.toFixed(2)}</span> MORE FOR FREE DELIVERY!
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#d5006d] h-2 rounded-full transition-all duration-500" style={{ width: `${(subtotalNum / freeDeliveryThreshold) * 100}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-center text-green-700 font-bold bg-green-100 py-2 rounded-lg">
                      YOU'VE UNLOCKED FREE DELIVERY! 🎉
                    </div>
                  )}

                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-bold text-gray-800">Total Amount</span>
                  <span className="text-3xl font-extrabold text-gray-900">₱{totalNum.toFixed(2)}</span>
                </div>
               <Link 
                to="/checkout" 
                className="block w-full bg-[#d5006d] hover:bg-[#b0005a] text-white text-center font-bold text-xl py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                >
                  Checkout Now
                </Link>
                <p className="text-center text-gray-400 text-xs mt-4 flex items-center justify-center gap-1 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                  Secure checkout powered by DumKIN Pay
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;