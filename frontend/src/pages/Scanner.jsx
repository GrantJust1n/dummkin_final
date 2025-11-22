import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";

const BarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [data, setData] = useState("Not Found");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState(""); // New state for manual input

  const handleStartScan = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
    
      .then(() => setHasPermission(true))
      .catch(() => setError("Camera access was denied."));
  };
  
  const fetchProduct = async (barcode) => {
    try {
      setLoading(true);
      setError("");
      setProduct(null);
      const response = await fetch(`http://localhost/ims/backend/index.php?action=scan_barcode&barcode=${barcode}`);
      const result = await response.json();
      setLoading(false);

      if (result.type === "success" && result.data) {
        setProduct(result.data);
      } else {
        setError("Product not found.");
      }
    } catch (err) {
      setLoading(false);
      setError("Failed to fetch product.");
    }
  };

  const handleDetected = (result) => {
    if (result?.text && result.text !== data) {
      setData(result.text);
      fetchProduct(result.text);
    }
  };

  const handleSearch = () => {
    if (searchBarcode.trim() !== "") {
      setData(searchBarcode);
      fetchProduct(searchBarcode.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white shadow-md rounded-lg p-6 mt-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
          Inventory Barcode Scanner
        </h1>

        {/*manual ini HAHAHA */}
        <div className="mb-6 flex justify-center items-center gap-2">
          <input
            type="text"
            placeholder="Enter barcode manually"
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {!hasPermission ? (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-gray-600 text-center">
              To begin scanning, please allow camera access.
            </p>
            <button
              onClick={handleStartScan}
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Start Scanning
            </button>
          </div>
        ) : (
    <div className="flex flex-col items-center">
            <BarcodeScannerComponent
  width={400}
  height={300}
 onUpdate={(err, result) => {
  if (err) {
    if (err.name !== "NotFoundException" && err.name !== "NotFoundException2") {
      console.error("Scanner error:", err);
      setError("Scanner error occurred.");
    } else {
      // Clear error if no barcode found in frame
      setError("");
    }
  }

  if (result) {
    handleDetected(result);
  }
}}

/>

            <p className="mt-2 text-sm text-gray-500">Scanning barcode...</p>
          </div>
        )}

        {loading && (
          <p className="mt-4 text-blue-500 animate-pulse">🔍 Searching product...</p>
        )}

        {error && <p className="mt-4 text-red-500">{error}</p>}

{product && (
  <div className="mt-6 border-t pt-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
    {product.image_path ? (
      <img
        src={`http://localhost/ims/backend/uploads/${product.image_path}`}
        alt={product.pname}
        className="w-40 h-40 object-contain rounded-md shadow-md bg-white"
      />
    ) : (
      <div className="w-40 h-40 flex items-center justify-center bg-gray-200 rounded-md text-gray-400">
        No Image
      </div>
    )}
    <div className="flex-1">
      <h2 className="text-xl font-semibold mb-3 text-gray-700">Product Found:</h2>
      <div className="bg-gray-50 p-4 rounded shadow-sm space-y-2">
        <p><strong>📛 Name:</strong> {product.pname}</p>
        <p><strong>🔖 Barcode:</strong> {product.barcode}</p>
        <p><strong>💰 Price:</strong> {product.price ?? "N/A"}</p>
        <p><strong>📦 Stock:</strong> {product.stock_quantity}</p>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default BarcodeScanner;
