import { useState } from "react";

const Product = () => {
  
  const [products, setProducts] = useState([]);


  const handleSubmit = (event) => {
    event.preventDefault(); 
    fetch("http://localhost/ims/backend/index.php") 
      .then((response) => response.json())
      .then((data) => setProducts(data)) 
      .catch((error) => console.error("Error fetching data:", error));
  };

  return (
    <div className="flex flex-col items-center justify-center pt-2">
      <form onSubmit={handleSubmit}>
      <button class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 2.5a2.5 2.5 0 0 0-2.5-2.5h-16A2.5 2.5 0 0 0 1 2.5v19A2.5 2.5 0 0 0 3.5 24h16A2.5 2.5 0 0 0 22 21.5v-19zM12 17l3.5-3.5m0 0L12 10l-3.5 3.5M12 17V7"/>
    </svg>
    Show product
</button>

      </form>

     
      <ul>
      <h2 className="font-bold text-base">Product List</h2>
        {products.length > 0 ? (
          products.map((product) => (
            <li key={product.product_id}>
              {product.name} - {product.description} SKU: {product.sku}, Quantity: {product.quantity}, Category: {product.category_id}
            </li>
          ))
        ) : (
          <p>Press to show the products</p>
        )}
      </ul>
    </div>
  );
};

export default Product;
