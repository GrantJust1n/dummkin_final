import React, { useEffect, useState } from "react";
import CategoryTable from "./CategoryTable";
import CategoryForm from "./CategoryForm";
import CategoryActions from "./CategoryActions";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(
        "http://localhost/Appzip/APPDEV/backend/index.php?action=admin_get_categories"
      );

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-5 space-y-5">
      {/* Add Category Button */}
      <CategoryActions setEditingCategory={setEditingCategory} />

      {/* Add / Edit Category Form */}
      <CategoryForm
        editingCategory={editingCategory}
        setEditingCategory={setEditingCategory}
        onUpdate={fetchCategories}
      />

      {/* Table List */}
      <CategoryTable
        categories={categories}
        onEdit={setEditingCategory}
        onUpdate={fetchCategories}
      />
    </div>
  );
}
