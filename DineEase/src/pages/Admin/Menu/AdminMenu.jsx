import { useEffect, useState } from "react";
import {
  Newspaper,
  MoreVertical,
  Edit3,
  Trash2,
  PlusSquare,
  X,
} from "lucide-react";
import "./menu.css";

export default function AdminMenu() {
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [vegFilter, setVegFilter] = useState(false);
  const [nonVegFilter, setNonVegFilter] = useState(false);

  const [newMenu, setNewMenu] = useState({
    dishName: "",
    cost: "",
    description: "",
    type: "veg",
    imageUrl: "",
    category: "Food",
    subCategory: "",
    reviews: [],
  });

  /* =====================
     Load menus safely
  ===================== */
  const loadMenus = () => {
    try {
      const stored = localStorage.getItem("menuItems");
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        return parsed.map((menu) => ({
          dishName: menu.dishName ?? "",
          cost: String(menu.cost ?? ""),
          description: menu.description ?? "",
          type: menu.type === "nonveg" ? "nonveg" : "veg",
          imageUrl: menu.imageUrl ?? "",
          category: menu.category ?? "Food",
          subCategory: menu.subCategory ?? "",
          reviews: Array.isArray(menu.reviews) ? menu.reviews : [],
        }));
      }

      return [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    setMenus(loadMenus());
  }, []);

  /* =====================
     Delete menu
  ===================== */
  const handleDelete = (index) => {
    const updated = [...menus];
    updated.splice(index, 1);
    setMenus(updated);
    localStorage.setItem("menuItems", JSON.stringify(updated));
    setMenuOpenIndex(null);
  };

  /* =====================
     Save menu
  ===================== */
  const handleSave = () => {
    if (!newMenu.dishName || !newMenu.cost || !newMenu.imageUrl) {
      alert("Please fill all fields and upload an image.");
      return;
    }

    const updated = [...menus];

    if (editingIndex !== null) {
      updated[editingIndex] = { ...newMenu };
    } else {
      updated.push({ ...newMenu });
    }

    setMenus(updated);
    localStorage.setItem("menuItems", JSON.stringify(updated));

    setNewMenu({
      dishName: "",
      cost: "",
      description: "",
      type: "veg",
      imageUrl: "",
      category: "Food",
      subCategory: "",
      reviews: [],
    });
    setEditingIndex(null);
    setShowModal(false);
  };

  /* =====================
     Edit menu
  ===================== */
  const handleEdit = (index) => {
    setNewMenu({ ...menus[index] });
    setEditingIndex(index);
    setShowModal(true);
    setMenuOpenIndex(null);
  };

  /* =====================
     Image Upload
  ===================== */
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMenu({ ...newMenu, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  /* =====================
     Stars Renderer
  ===================== */
  const renderStars = (rating) => {
    return (
      <div className="review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? "star filled" : "star"}>
            ★
          </span>
        ))}
      </div>
    );
  };

  /* =====================
     Filter menus
  ===================== */
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.dishName
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter =
      (!vegFilter && !nonVegFilter) ||
      (vegFilter && menu.type === "veg") ||
      (nonVegFilter && menu.type === "nonveg");

    return matchesSearch && matchesFilter;
  });

  /* =====================
     Render
  ===================== */
  return (
    <div className="admin-menu-page">
      <h2 className="page-title">
        <Newspaper size={22} style={{ marginRight: "8px" }} /> Menu Management
      </h2>

      <div className="menu-header">
        <input
          type="text"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <button
          className="add-btn"
          onClick={() => {
            setNewMenu({
              dishName: "",
              cost: "",
              description: "",
              type: "veg",
              imageUrl: "",
              category: "Food",
              subCategory: "",
              reviews: [],
            });
            setEditingIndex(null);
            setShowModal(true);
          }}
        >
          <PlusSquare size={18} /> Add Menu
        </button>
      </div>

      {/* Filters */}
      <div className="filter-switches">
        <label className="switch">
          <input
            type="checkbox"
            checked={vegFilter}
            onChange={() => setVegFilter(!vegFilter)}
          />
          <span className="slider veg"></span>
          <span className="switch-label">Veg</span>
        </label>

        <label className="switch">
          <input
            type="checkbox"
            checked={nonVegFilter}
            onChange={() => setNonVegFilter(!nonVegFilter)}
          />
          <span className="slider nonveg"></span>
          <span className="switch-label">Non-Veg</span>
        </label>
      </div>

      {filteredMenus.length === 0 ? (
        <p className="empty-message">No menus found.</p>
      ) : (
        <div className="menu-grid">
          {filteredMenus.map((menu, index) => (
            <div key={index} className="menu-card">
              {menu.imageUrl && (
                <img
                  src={menu.imageUrl}
                  alt={menu.dishName}
                  className="menu-img"
                />
              )}
              <h3 className="menu-name">{menu.dishName}</h3>
              <p className="menu-cost">₹ {menu.cost}</p>
              <p className="menu-desc">{menu.description}</p>
              <p className={`menu-type ${menu.type}`}>
                {menu.type === "veg" ? "Veg" : "Non-Veg"}
              </p>
              <p className="category">
                {menu.category} → {menu.subCategory || "General"}
              </p>

              {/* Display ALL reviews */}
              <div className="reviews">
                {menu.reviews.length > 0 ? (
                  menu.reviews.map((review, i) => (
                    <div key={i} className="review-block">
                      {renderStars(review.rating)}
                      <p className="review-comment">"{review.comment}"</p>
                    </div>
                  ))
                ) : (
                  <p className="review-comment">No reviews yet</p>
                )}
              </div>

              {/* Dropdown menu */}
              <div className="menu-wrapper">
                <button
                  className="menu-btn"
                  onClick={() =>
                    setMenuOpenIndex(menuOpenIndex === index ? null : index)
                  }
                >
                  <MoreVertical size={20} />
                </button>

                {menuOpenIndex === index && (
                  <div className="menu-dropdown">
                    <button onClick={() => handleEdit(index)}>
                      <Edit3 size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(index)}>
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingIndex !== null ? "Edit Menu" : "Add New Menu"}</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingIndex(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <input
              type="text"
              placeholder="Dish Name"
              value={newMenu.dishName}
              onChange={(e) =>
                setNewMenu({ ...newMenu, dishName: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Cost"
              value={newMenu.cost}
              onChange={(e) =>
                setNewMenu({ ...newMenu, cost: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              value={newMenu.description}
              onChange={(e) =>
                setNewMenu({ ...newMenu, description: e.target.value })
              }
            />
            <select
              value={newMenu.type}
              onChange={(e) =>
                setNewMenu({
                  ...newMenu,
                  type: e.target.value,
                })
              }
            >
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
            </select>

            {/* Category */}
            <select
              value={newMenu.category}
              onChange={(e) =>
                setNewMenu({ ...newMenu, category: e.target.value })
              }
            >
              <option value="Food">Food</option>
              <option value="Drink">Drink</option>
              <option value="Dessert">Dessert</option>
              <option value="Starter">Starter</option>
              <option value="Main Course">Main Course</option>
            </select>

            {/* SubCategory */}
            <input
              type="text"
              placeholder="Subcategory (e.g., Plain Rice, Cold Drink)"
              value={newMenu.subCategory}
              onChange={(e) =>
                setNewMenu({ ...newMenu, subCategory: e.target.value })
              }
            />

            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {newMenu.imageUrl && (
              <img src={newMenu.imageUrl} alt="Preview" className="menu-img" />
            )}

            <button className="save-btn" onClick={handleSave}>
              {editingIndex !== null ? "Update Menu" : "Save Menu"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
