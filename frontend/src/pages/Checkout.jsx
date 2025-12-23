import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, Truck, ChevronLeft, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], subtotal: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // NEW: State for Success Toast
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    address: '',
    payment_method: 'cod', // Default to COD
    notes: ''
  });

  // Calculation Constants (Must match Cart.jsx)
  const deliveryFee = 50.00; 
  const taxRate = 0.12;
  const freeDeliveryThreshold = 500.00;
  
  const BackendURL = 'http://localhost/Appzip/APPDEV/backend/index.php';

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${BackendURL}?action=fetch_cart`, { credentials: 'include' });
      const data = await res.json();
      
      if (data.items && data.items.length === 0) {
        alert("Your cart is empty!");
        navigate('/dashboard'); // Redirect if empty
        return;
      }
      
      // Fix structure just like in Cart.jsx
      setCart({
        items: data.items || [],
        subtotal: data.totals ? parseFloat(data.totals.subtotal) : 0,
        count: data.totals ? data.totals.count : 0
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if(!formData.address.trim()) {
        alert("Please enter a shipping address.");
        return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${BackendURL}?action=place_order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const result = await res.json();

      if (result.success) {
        // 1. Show the Toast
        setShowSuccessToast(true);
        
        // 2. Wait 3 seconds, then redirect
        setTimeout(() => {
            navigate('/dashboard'); 
        }, 3000);

      } else {
        alert(result.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading Checkout...</div>;

  // Calculate Totals
  const subtotalNum = cart.subtotal;
  const taxNum = subtotalNum * taxRate;
  const finalDeliveryFee = subtotalNum >= freeDeliveryThreshold ? 0 : deliveryFee;
  const totalNum = subtotalNum + taxNum + finalDeliveryFee;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-8 relative"> 
      {/* Added 'relative' to parent so toast positions correctly relative to viewport/page */}
      
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <button onClick={() => navigate('/cart')} className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition">
          <ChevronLeft size={20} /> <span className="ml-1 font-medium">Back to Cart</span>
        </button>
        
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
            
          {/* LEFT: Shipping & Payment Form */}
          <div className="flex-grow">
            <form id="checkout-form" onSubmit={placeOrder} className="space-y-6">
              
              {/* Shipping Address Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="text-[#d5006d]" /> Shipping Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                    <textarea
                      name="address"
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d5006d] focus:border-transparent outline-none transition"
                      placeholder="Street, Barangay, City, Province"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                    <input
                      type="text"
                      name="notes"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#d5006d] outline-none"
                      placeholder="e.g. Please ring the doorbell"
                      value={formData.notes}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="text-[#d5006d]" /> Payment Method
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition ${formData.payment_method === 'cod' ? 'border-[#d5006d] bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="cod" 
                      checked={formData.payment_method === 'cod'} 
                      onChange={handleInputChange}
                      className="text-[#d5006d] focus:ring-[#d5006d]" 
                    />
                    <span className="font-bold text-gray-700">Cash on Delivery</span>
                  </label>

                  <label className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-3 transition ${formData.payment_method === 'paymongo' ? 'border-[#d5006d] bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="paymongo" 
                      checked={formData.payment_method === 'paymongo'} 
                      onChange={handleInputChange} 
                      className="text-[#d5006d] focus:ring-[#d5006d]"
                    />
                    <span className="font-bold text-gray-700">E-Wallet / Card</span>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h3>
              
              {/* Items List (Small view) */}
              <div className="max-h-60 overflow-y-auto mb-6 space-y-3 custom-scrollbar">
                {cart.items.map((item) => (
                  <div key={item.product_id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 w-10 h-10 rounded-md flex items-center justify-center text-xs text-gray-500 font-bold">
                           {item.quantity}x
                        </div>
                        <span className="text-gray-700 font-medium truncate w-32">{item.name}</span>
                    </div>
                    <span className="text-gray-900 font-semibold">₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{subtotalNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (12%)</span>
                  <span>₱{taxNum.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{finalDeliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₱${finalDeliveryFee.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-200">
                <span className="text-lg font-bold text-gray-800">Total</span>
                <span className="text-2xl font-extrabold text-[#d5006d]">₱{totalNum.toFixed(2)}</span>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={submitting}
                className="w-full bg-[#d5006d] hover:bg-[#b0005a] text-white font-bold py-4 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {submitting ? 'Processing...' : (
                  <>Place Order <CheckCircle size={20} /></>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                 <Truck size={14} /> Guaranteed delivery within 45 mins
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- SUCCESS TOAST NOTIFICATION --- */}
      {showSuccessToast && (
          <div className="fixed bottom-6 right-6 bg-green-500 shadow-2xl rounded-2xl p-5 w-80 z-50 animate-bounce-in flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-2">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Order Placed!</h3>
              <p className="text-green-50 text-sm">Thank you for your purchase.</p>
              <p className="text-green-100 text-xs mt-1">Redirecting to dashboard...</p>
            </div>
          </div>
        )}
      {/* ---------------------------------- */}

    </div>
  );
};

export default Checkout;