import React, { useEffect, useState } from 'react';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    pname: '',
    pcategory: '',
    stock_quantity: '',
    barcode: '',
    warehouse: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // Track editing product ID

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=fetch_products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, image: e.target.files[0] || null }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { pname, pcategory, stock_quantity, barcode, warehouse, image } = form;
    if (!pname || !pcategory || !stock_quantity || !barcode || !warehouse) {
      setError('Please fill all fields.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pname', pname);
      formData.append('pcategory', pcategory);
      formData.append('stock_quantity', stock_quantity);
      formData.append('barcode', barcode);
      formData.append('warehouse', warehouse);
      if (image) formData.append('image', image);

      const res = await fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=insert_product', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.type === 'success') {
        fetchProducts();
        setForm({
          pname: '',
          pcategory: '',
          stock_quantity: '',
          barcode: '',
          warehouse: '',
          image: null,
        });
        document.getElementById('imageInput').value = '';
      } else {
        setError(data.message || 'Failed to add product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { pname, pcategory, stock_quantity, barcode, warehouse, image } = form;
    if (!pname || !pcategory || !stock_quantity || !barcode || !warehouse) {
      setError('Please fill all fields.');
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('pid', editingProduct);
      formData.append('pname', pname);
      formData.append('pcategory', pcategory);
      formData.append('stock_quantity', stock_quantity);
      formData.append('barcode', barcode);
      formData.append('warehouse', warehouse);
      if (image) formData.append('image', image);

      const res = await fetch('http://localhost/Appzip/APPDEV/backend/index.php?action=update_product', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.type === 'success') {
        fetchProducts();
        setForm({
          pname: '',
          pcategory: '',
          stock_quantity: '',
          barcode: '',
          warehouse: '',
          image: null,
        });
        setEditingProduct(null);
        document.getElementById('imageInput').value = '';
      } else {
        setError(data.message || 'Failed to update product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (product) => {
    setEditingProduct(product.pid);
    setForm({
      pname: product.pname,
      pcategory: product.pcategory,
      stock_quantity: product.stock_quantity,
      barcode: product.barcode,
      warehouse: product.warehouse,
      image: null,
    });
    document.getElementById('imageInput').value = '';
  };

  const handleDelete = async (pid) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost/ims/backend/index.php?action=delete_product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid }),
      });
      const data = await res.json();

      if (data.type === 'success') {
        fetchProducts();
      } else {
        setError(data.message || 'Failed to delete product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reduceStock = async (pid, amount = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost/ims/backend/index.php?action=reduce_stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, amount }),
      });
      const data = await res.json();
      if (data.type === 'success') {
        fetchProducts();
      } else {
        setError(data.message || 'Failed to reduce stock');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Inventory</h1>

      <form
        onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
        className="mb-8 space-y-4 border p-4 rounded shadow"
      >
        <h2 className="text-xl font-semibold">
          {editingProduct ? 'Edit Product' : 'Add Product'}
        </h2>

        <input
          type="text"
          name="pname"
          placeholder="Product Name"
          value={form.pname}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="pcategory"
          placeholder="Category ID"
          value={form.pcategory}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="number"
          name="stock_quantity"
          placeholder="Stock Quantity"
          value={form.stock_quantity}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          min="0"
          required
        />
        <input
          type="text"
          name="barcode"
          placeholder="Barcode"
          value={form.barcode}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="warehouse"
          placeholder="Warehouse ID"
          value={form.warehouse}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        <input
          type="file"
          id="imageInput"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading
            ? editingProduct
              ? 'Updating...'
              : 'Adding...'
            : editingProduct
            ? 'Update Product'
            : 'Add Product'}
        </button>

        {editingProduct && (
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null);
              setForm({
                pname: '',
                pcategory: '',
                stock_quantity: '',
                barcode: '',
                warehouse: '',
                image: null,
              });
              document.getElementById('imageInput').value = '';
              setError(null);
            }}
            className="ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
        )}

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      <section>
        <h2 className="text-xl font-semibold mb-4">Existing Products</h2>

        {loading && <p>Loading products...</p>}
        {error && !loading && <p className="text-red-600">{error}</p>}

        {!loading && products.length === 0 && <p>No products found.</p>}

        {!loading && products.length > 0 && (
          <table className="w-full border-collapse border border-gray-300 rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">Image</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Stock</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Barcode</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Warehouse</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(
                ({
                  pid,
                  pname,
                  pcategory,
                  stock_quantity,
                  barcode,
                  warehouse,
                  image_path,
                }) => {
                  const imageUrl = image_path
                    ? `http://localhost/ims/backend/uploads/${image_path}`
                    : 'http://localhost/ims/backend/uploads/default.png';

                  return (
                    <tr key={pid} className="border-t">
                      <td className="border border-gray-300 px-3 py-2">
                        <img
                          src={imageUrl}
                          alt={pname}
                          className="h-12 w-12 object-cover rounded"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">{pname}</td>
                      <td className="border border-gray-300 px-3 py-2">{pcategory}</td>
                      <td className="border border-gray-300 px-3 py-2">{stock_quantity}</td>
                      <td className="border border-gray-300 px-3 py-2">{barcode}</td>
                      <td className="border border-gray-300 px-3 py-2">{warehouse}</td>
                      <td className="border border-gray-300 px-3 py-2 space-x-2">
                        <button
                          onClick={() => reduceStock(pid, 1)}
                          disabled={loading || stock_quantity === 0}
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          title="Reduce stock by 1"
                        >
                          -1 Stock
                        </button>
                        <button
                          onClick={() =>
                            editProduct({ pid, pname, pcategory, stock_quantity, barcode, warehouse })
                          }
                          disabled={loading}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(pid)}
                          disabled={loading}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Inventory;
