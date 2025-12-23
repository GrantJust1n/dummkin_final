import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { FaPaperPlane, FaTimes, FaMinus, FaCommentDots, FaMagic } from "react-icons/fa";

export default function AiChatWidget() {
  const { user } = useContext(AuthContext);
  
  // 1. DECLARE ALL HOOKS FIRST (Unconditionally)
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("AI_CHAT_HISTORY");
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  // Save history
  useEffect(() => {
    localStorage.setItem("AI_CHAT_HISTORY", JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5055/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          user_id: user?.id || null,
        }),
      });

      const data = await res.json();
      const aiReply = data.answer || "Sorry, I couldn't reach the bakery!";
      setMessages((prev) => [...prev, { role: "assistant", text: aiReply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "My brain is offline. Check the Python server!" }]);
    } finally {
      setLoading(false);
    }
  };

  // 2. NOW PERFORM THE SECURITY CHECK
  // If user is NOT logged in, return null here (after hooks)
  if (!user) {
    return null; 
  }

  // 3. RENDER THE WIDGET
  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden animate-fade-in-up mb-4">
          
          <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <FaMagic className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">DumKIN Buddy</h3>
                <div className="flex items-center gap-1.5 opacity-90">
                  <span className="w-2 h-2 bg-green-400 rounded-full border border-white/50 animate-pulse"></span>
                  <span className="text-xs font-medium">Always Freshly Baked</span>
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition">
                <FaMinus className="text-xs" />
              </button>
              <button onClick={() => { setIsOpen(false); setMessages([]); }} className="p-2 hover:bg-white/20 rounded-full transition">
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {messages.length === 0 && (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center mx-4 mt-8">
                <p className="text-gray-800 font-medium mb-1">Hellow! I'm DumKIN Buddy.</p>
                <p className="text-gray-500 text-sm">Ready to help you find the perfect treat today! 🍩☕</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-orange-500 text-white rounded-2xl rounded-br-none"
                      : "bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for recommendations..."
                className="w-full bg-gray-100 border-0 rounded-full py-3 pl-5 pr-12 text-sm text-gray-700 focus:ring-2 focus:ring-orange-300 focus:bg-white transition-all outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-orange-400 hover:bg-orange-500 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <FaPaperPlane className="text-sm translate-x-[-1px] translate-y-[1px]" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LAUNCHER BUTTON */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce"
        >
          <span className="absolute right-full mr-4 bg-white text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Need help? Chat with AI!
          </span>
          <FaCommentDots className="text-3xl" />
          <span className="absolute top-0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
          </span>
        </button>
      )}
    </div>
  );
}