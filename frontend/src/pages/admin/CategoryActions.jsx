import React from "react";

export default function CategoryActions({ setEditingCategory }) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">Category Manager</h1>

      <button
        onClick={() => setEditingCategory(null)}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        + Add Category
      </button>
    </div>
  );
}
