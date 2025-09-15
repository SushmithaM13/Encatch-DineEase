import React, { useState, useEffect } from "react";
import "./FoodItems.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const Items = () => {
  // Load from localStorage if present
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("foodItems");
    return saved ? JSON.parse(saved) : [];
  });

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    rating: "",
    available: true,
  });

  // Save items whenever they change
  useEffect(() => {
    localStorage.setItem("foodItems", JSON.stringify(items));
  }, [items]);

  const handleToggle = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: !item.available } : item
      )
    );
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      price: item.price,
      rating: item.rating,
      available: item.available,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return;

    if (editingItem) {
      // update
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? {
                ...it,
                name: form.name,
                price: Number(form.price),
                rating: Number(form.rating),
                available: form.available,
              }
            : it
        )
      );
    } else {
      // create
      setItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: form.name,
          price: Number(form.price),
          rating: Number(form.rating) || 0,
          available: form.available,
        },
      ]);
    }

    setForm({ name: "", price: "", rating: "", available: true });
    setEditingItem(null);
    setShowModal(false);
  };

  return (
    <div className="items-page">
      <div className="header">
        <h2>Food Items</h2>
        <button
          className="add-btn"
          onClick={() => {
            setEditingItem(null);
            setForm({ name: "", price: "", rating: "", available: true });
            setShowModal(true);
          }}
        >
          + Add Item
        </button>
      </div>

      <div className="items-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className={`item-card ${!item.available ? "not-available" : ""}`}
          >
            <div className="item-header">
              <h3>{item.name}</h3>
              <span className="price">₹{item.price}</span>
            </div>

            <p className="rating">⭐ {item.rating || "N/A"}</p>

            <label className="switch">
              <input
                type="checkbox"
                checked={item.available}
                onChange={() => handleToggle(item.id)}
              />
              <span className="slider round"></span>
            </label>

            <div className="card-actions">
              <button
                className="icon-btn edit"
                onClick={() => handleEditClick(item)}
              >
                <FaEdit />
              </button>
              <button
                className="icon-btn delete"
                onClick={() => handleDelete(item.id)}
              >
                <FaTrash />
              </button>
            </div>

            <p className="status">
              {item.available ? "Available" : "Not Available"}
            </p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editingItem ? "Edit Item" : "Add New Item"}</h3>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              type="number"
              placeholder="Rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
            <label className="modal-switch">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) =>
                  setForm({ ...form, available: e.target.checked })
                }
              />
              Available
            </label>
            <button className="save-btn" onClick={handleSave}>
              {editingItem ? "Update" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
