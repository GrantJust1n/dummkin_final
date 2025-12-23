import React, { useEffect, useState } from "react";

export default function CategoryForm({ editingCategory, setEditingCategory, onUpdate }) {
  const [name, setName] = useState("");
  const [description] = useState(""); // Optional if you add later

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    }
  }, [editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isEditing = !!editingCategory;

    const payload = {
      id: isEditing ? editingCategory.id : undefined,
      name,
      description,
      is_active: 1,
    };

    const action = isEditing
      ? "admin_update_category"
      : "admin_create_category";

    await fetch(`http://localhost/Appzip/APPDEV/backend/index.php?action=${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setName("");
    setEditingCategory(null);
    onUpdate();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded space-y-3 w-96 bg-white">
      <h2 className="text-xl font-semibold">
        {editingCategory ? "Edit Category" : "Add Category"}
      </h2>

      <input
        type="text"
        placeholder="Category name"
        className="w-full border p-2 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        {editingCategory ? "Update Category" : "Add Category"}
      </button>
    </form>
  );
}
