import React from "react";

export default function CategoryTable({ categories, onEdit, onUpdate }) {
  const toggleStatus = async (id, current) => {
    const payload = {
      id: id,
      to: current ? 0 : 1, // if active → deactivate, else activate
    };

    await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_toggle_category", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    onUpdate();
  };

  return (
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2">ID</th>
          <th className="p-2">Name</th>
          <th className="p-2">Status</th>
          <th className="p-2">Actions</th>
        </tr>
      </thead>

      <tbody>
        {categories.map((cat) => (
          <tr key={cat.id} className="border-t">
            <td className="p-2">{cat.id}</td>
            <td className="p-2">{cat.name}</td>
            <td className="p-2">
              <span className={cat.is_active ? "text-green-600" : "text-red-500"}>
                {cat.is_active ? "Active" : "Inactive"}
              </span>
            </td>
            <td className="p-2 space-x-3">
              <button
                onClick={() => onEdit(cat)}
                className="text-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => toggleStatus(cat.id, cat.is_active)}
                className="text-yellow-600"
              >
                Toggle
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
