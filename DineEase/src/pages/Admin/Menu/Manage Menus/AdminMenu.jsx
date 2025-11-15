/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Newspaper, PlusSquare, X, Plus, Minus } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminMenu.css";

export default function AdminMenu() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:8082/dine-ease/api/v1";
  const PROFILE_API = `${API_BASE}/staff/profile`;
  const MENU_API = `${API_BASE}/menu`;

  const [organizationId, setOrganizationId] = useState("");
  const [menus, setMenus] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // dropdowns
  const [categories, setCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [foodTypes, setFoodTypes] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [addons, setAddons] = useState([]);
  const [customizeGroups, setCustomizeGroups] = useState([]);

  const [newMenu, setNewMenu] = useState({
    organizationId: "",
    categoryId: "",
    itemName: "",
    description: "",
    image: null,
    itemTypeId: "",
    foodTypeId: "",
    cuisineTypeId: "",
    spiceLevel: 1,
    isAvailable: true,
    isRecommended: false,
    isBestseller: false,
    chefSpecial: false,
    preparationTime: 1,
    allergenInfo: "",
    variants: [],
    selectedAddons: [],
    customizationGroupNames: [],
  });

  // ---------- FETCH PROFILE ----------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Unauthorized: Please log in!");
          return;
        }

        const res = await fetch(PROFILE_API, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setOrganizationId(data.organizationId || data.organization?.id || "");
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to load profile");
      }
    };

    fetchProfile();
  }, [PROFILE_API]);

  // ---------- FETCH DROPDOWNS & MENUS ----------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [
          categoryRes,
          itemTypesRes,
          foodTypesRes,
          cuisinesRes,
          addonsRes,
          groupsRes,
        ] = await Promise.all([
          fetch(`${API_BASE}/menu-category/${organizationId}?page=0&size=10&sortBy=id&sortDir=desc`, { headers }),
          fetch(`${API_BASE}/menu/item-types?organizationId=${organizationId}&active=true`, { headers }),
          fetch(`${API_BASE}/menu/food-types?organizationId=${organizationId}`, { headers }),
          fetch(`${API_BASE}/menu/cuisine-types?organizationId=${organizationId}&active=true`, { headers }),
          fetch(`${API_BASE}/menu/addons/${organizationId}`, { headers }),
          fetch(`${API_BASE}/menu/customization-group/organization/${organizationId}/active`, { headers }),
        ]);

        const [categoryJson, itemTypesJson, foodTypesJson, cuisinesJson, addonsJson, groupsJson] =
          await Promise.all([
            categoryRes.json(),
            itemTypesRes.json(),
            foodTypesRes.json(),
            cuisinesRes.json(),
            addonsRes.json(),
            groupsRes.json(),
          ]);

        setCategories(categoryJson.content || []);
        setItemTypes(itemTypesJson.content || itemTypesJson || []);
        setFoodTypes(foodTypesJson.content || foodTypesJson || []);
        setCuisines(Array.isArray(cuisinesJson) ? cuisinesJson : cuisinesJson.content || []);
        setAddons(addonsJson.content || addonsJson || []);
        setCustomizeGroups(groupsJson.content || groupsJson || []);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
        toast.error("Failed to load dropdown data");
      }
    };

    if (organizationId) {
      fetchAll();
      fetchMenus();
    }
  }, [organizationId]);

  // ---------- FETCH MENUS ----------
  const fetchMenus = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${MENU_API}/organization/${organizationId}?page=0&size=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch menus");
      const data = await res.json();
      setMenus(Array.isArray(data) ? data : data.content || []);
    } catch (err) {
      console.error("Menus fetch error:", err);
      toast.error("Failed to load menus");
    } finally {
      setLoading(false);
    }
  };

  // ---------- IMAGE PREVIEW ----------
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setNewMenu({ ...newMenu, image: preview });
    }
  };

  // ---------- VARIANTS ----------
  const addVariant = () =>
    setNewMenu({
      ...newMenu,
      variants: [
        ...newMenu.variants,
        { variantName: "", variantType: "", quantityValue: "", quantityUnit: "", price: "", discountPrice: "", displayOrder: "", isDefault: false, isAvailable: true },
      ],
    });

  const removeVariant = (index) => {
    const updated = [...newMenu.variants];
    updated.splice(index, 1);
    setNewMenu({ ...newMenu, variants: updated });
  };
  {/* ---------- Auto-select all logic ---------- */ }
  useEffect(() => {
    // only run once when data is loaded
    if (addons.length > 0 && newMenu.selectedAddons.length === 0) {
      setNewMenu((prev) => ({
        ...prev,
        selectedAddons: addons,
      }));
    }

    if (customizeGroups.length > 0 && newMenu.customizationGroupNames.length === 0) {
      setNewMenu((prev) => ({
        ...prev,
        customizationGroupNames: customizeGroups.map(
          (g) => g.name || g.groupName
        ),
      }));
    }
  }, [addons, customizeGroups]);



  // ---------- SAVE MENU (ONLY ADD) ----------
  const handleSave = async (e) => {
    e.preventDefault();
    if (!newMenu.itemName) return toast.error("Item name is required!");

    try {
      const token = localStorage.getItem("token");
      const form = new FormData();

      form.append("organizationId", organizationId);
      form.append("itemName", newMenu.itemName);
      form.append("description", newMenu.description || "");
      if (imageFile) form.append("image", imageFile);

      // Append category, item type, food type, cuisine type
      const category = categories.find((c) => c.name === newMenu.categoryId);
      if (!category) return toast.error("Please select a valid Category!");
      form.append("categoryName", category.name);

      const itemType = itemTypes.find((it) => it.id.toString() === newMenu.itemTypeId.toString());
      if (!itemType) return toast.error("Please select a valid Item Type!");
      form.append("itemTypeName", itemType.name || itemType.itemTypeName);

      const foodType = foodTypes.find((f) => f.id.toString() === newMenu.foodTypeId.toString());
      if (!foodType) return toast.error("Please select a valid Food Type!");
      form.append("foodTypeName", foodType.name || foodType.foodTypeName);

      const cuisine = cuisines.find((c) => c.id.toString() === newMenu.cuisineTypeId.toString());
      if (!cuisine) return toast.error("Please select a valid Cuisine Type!");
      form.append("cuisineTypeName", cuisine.name || cuisine.cuisineTypeName);

      form.append("spiceLevel", newMenu.spiceLevel.toString());
      form.append("isAvailable", newMenu.isAvailable.toString());
      form.append("isRecommended", newMenu.isRecommended.toString());
      form.append("isBestseller", newMenu.isBestseller.toString());
      form.append("chefSpecial", newMenu.chefSpecial.toString());
      form.append("preparationTime", newMenu.preparationTime.toString());
      form.append("allergenInfo", newMenu.allergenInfo || "");

      // Variants
      newMenu.variants.forEach((v, i) => {
        form.append(`variants[${i}].variantName`, v.variantName || "");
        form.append(`variants[${i}].variantType`, v.variantType || "");
        form.append(`variants[${i}].price`, v.price?.toString() || "0");
        form.append(`variants[${i}].discountPrice`, v.discountPrice?.toString() || "0");
        form.append(`variants[${i}].isDefault`, v.isDefault.toString());
        form.append(`variants[${i}].isAvailable`, v.isAvailable.toString());
      });

      // Addons
      newMenu.selectedAddons.forEach((a, i) => {
        form.append(`addons[${i}].addonName`, a.addOnName || a.name);
        form.append(`addons[${i}].isDefault`, "false");
        form.append(`addons[${i}].maxQuantity`, "1");
      });



      // Customization groups
      // Customization group names
      newMenu.customizationGroupNames.forEach((g, i) => {
        form.append(`customizationGroupNames[${i}]`, g);
      });



      const res = await fetch(`${MENU_API}/add`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success("Menu added!");
      resetForm();
      fetchMenus();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Error saving menu: " + err.message);
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setImageFile(null);
    setNewMenu({
      organizationId,
      categoryId: "",
      itemName: "",
      description: "",
      image: null,
      itemTypeId: "",
      foodTypeId: "",
      cuisineTypeId: "",
      spiceLevel: 1,
      isAvailable: true,
      isRecommended: false,
      isBestseller: false,
      chefSpecial: false,
      preparationTime: 1,
      allergenInfo: "",
      variants: [],
      selectedAddons: [],
      customizationGroupNames: [],
    });
  };

  // ---------- UI ----------

  return (
    <div className="admin-menu-page">
      <ToastContainer />
      <h2 className="admin-menu-title">
        <Newspaper size={20} /> Menu Management
      </h2>

      <div className="admin-menu-controls">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search item..."
          className="admin-menu-search"
        />
        <div>
          <button
            className="admin-menu-add-btn"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <PlusSquare size={16} /> Add New Menu
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading menus...</p>
      ) : (
        <div className="admin-menu-grid">
          {menus.length === 0 ? (
            <p>No menu items yet.</p>
          ) : (
            menus
              .filter((m) =>
                m.itemName?.toLowerCase().includes(search.toLowerCase())
              )
              .map((menu) => (
                <div
                  key={menu.id}
                  className="admin-menu-card"
                  onClick={() => navigate(`/AdminDashboard/menu/${menu.id}`)}
                >
                  {menu.imageData ? (
                    <img
                      src={`data:image/jpeg;base64,${menu.imageData}`}
                      alt={menu.itemName}
                      className="admin-menu-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/no-image.png";
                      }}
                    />
                  ) : menu.imageUrl ? (
                    <img
                      src={menu.imageUrl.replace(
                        "C:\\dine-ease-backend\\dine-ease\\uploads\\",
                        "http://localhost:8082/dine-ease/uploads/"
                      )}
                      alt={menu.itemName}
                      className="admin-menu-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/no-image.png";
                      }}
                    />
                  ) : (
                    <div className="no-img">No Image</div>
                  )}
                  <h3 className="admin-menu-name">{menu.itemName}</h3>
                  <p className="admin-menu-type">{menu.itemType || "N/A"}</p>
                  <p className="admin-menu-desc">{menu.description}</p>
                  <p className="admin-menu-price">
                    ₹{" "}
                    {menu.variants && menu.variants.length > 0
                      ? Math.min(...menu.variants.map((v) => Number(v.price || 0)))
                      : "N/A"}
                  </p>
                </div>
              ))
          )}
        </div>
      )}
      {/* modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Add New Menu</h3>
              <button onClick={resetForm}><X size={18} /></button>
            </div>

            <form className="admin-modal-body" onSubmit={handleSave}>
              <label>Item Name *</label>
              <input
                type="text"
                value={newMenu.itemName}
                onChange={(e) => setNewMenu({ ...newMenu, itemName: e.target.value })}
                required
              />

              <label>Description</label>
              <textarea
                value={newMenu.description}
                onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
              />
              <div>
                <label>Category</label>
                <select
                  value={newMenu.categoryId}
                  onChange={(e) => setNewMenu({ ...newMenu, categoryId: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-grid-2">
                <div>
                  <label>Item Type</label>
                  <select
                    value={newMenu.itemTypeId}
                    onChange={(e) => setNewMenu({ ...newMenu, itemTypeId: e.target.value })}
                  >
                    <option value="">Select item type</option>
                    {itemTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>

                    ))}
                  </select>
                </div>

                <div>
                  <label>Food Type</label>
                  <select
                    value={newMenu.foodTypeId}
                    onChange={(e) => setNewMenu({ ...newMenu, foodTypeId: e.target.value })}
                  >
                    <option value="">Select food type</option>
                    {foodTypes.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.foodTypeName || f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Cuisine</label>
                  <select
                    value={newMenu.cuisineTypeId}
                    onChange={(e) => setNewMenu({ ...newMenu, cuisineTypeId: e.target.value })}
                  >
                    <option value="">Select cuisine</option>
                    {cuisines.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Spice Level</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newMenu.spiceLevel}
                    onChange={(e) => setNewMenu({ ...newMenu, spiceLevel: Number(e.target.value) })}
                  />
                </div>
              </div>

              <label>Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              {newMenu.image && <img src={newMenu.image} alt="preview" className="admin-menu-preview" />}

              <h4>Variants</h4>
              {newMenu.variants.map((v, i) => (
                <div key={i} className="admin-menu-variant-row">
                  <input
                    value={v.variantName}
                    placeholder="Variant Name (e.g., Half Plate / Full Plate)"
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].variantName = e.target.value;
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <select
                    value={v.variantType}
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].variantType = e.target.value;
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  >
                    <option value="">Select Variant Type</option>
                    <option value="SIZE">Size</option>
                    <option value="PORTION">Portion</option>
                    <option value="FLAVOR">Flavor</option>
                    <option value="QUANTITY">Quantity</option>
                  </select>
                  <input
                    type="number"
                    value={v.quantityValue}
                    placeholder="Quantity Value (e.g., 250 / 500)"
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].quantityValue = Number(e.target.value);
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <input
                    value={v.quantityUnit}
                    placeholder="Quantity Unit (e.g., g / ml / pcs / plate)"
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].quantityUnit = e.target.value;
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <input
                    type="number"
                    value={v.price}
                    placeholder="Price (e.g., 199)"
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].price = (e.target.value);
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <input
                    type="number"
                    value={v.discountPrice}
                    placeholder="Discount Price (optional, e.g., 179)"
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].discountPrice = Number(e.target.value);
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <input
                    type="number"
                    value={v.displayOrder}
                    placeholder="Display Order (e.g., 1, 2, 3)"
                    onChange={(e) => {
                      const updated = [...newMenu.variants];
                      updated[i].displayOrder = Number(e.target.value);
                      setNewMenu({ ...newMenu, variants: updated });
                    }}
                  />
                  <label>
                    Default{" "}
                    <input
                      type="checkbox"
                      checked={v.isDefault}
                      onChange={(e) => {
                        const updated = [...newMenu.variants];
                        updated[i].isDefault = e.target.checked;
                        setNewMenu({ ...newMenu, variants: updated });
                      }}
                    />
                  </label>
                  <label>
                    Available{" "}
                    <input
                      type="checkbox"
                      checked={v.isAvailable}
                      onChange={(e) => {
                        const updated = [...newMenu.variants];
                        updated[i].isAvailable = e.target.checked;
                        setNewMenu({ ...newMenu, variants: updated });
                      }}
                    />
                  </label>
                  <button type="button" onClick={() => removeVariant(i)}>
                    <Minus size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-menu-add-variant-btn"
                onClick={addVariant}
              >
                <Plus size={12} /> Add Variant
              </button>
              <div className="admin-menu-grid-2">
                <label>
                  <input
                    type="checkbox"
                    checked={newMenu.isAvailable}
                    onChange={(e) => setNewMenu({ ...newMenu, isAvailable: e.target.checked })}
                  />{" "}
                  Available
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={newMenu.isRecommended}
                    onChange={(e) => setNewMenu({ ...newMenu, isRecommended: e.target.checked })}
                  />{" "}
                  Recommended
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={newMenu.isBestseller}
                    onChange={(e) => setNewMenu({ ...newMenu, isBestseller: e.target.checked })}
                  />{" "}
                  Bestseller
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={newMenu.chefSpecial}
                    onChange={(e) => setNewMenu({ ...newMenu, chefSpecial: e.target.checked })}
                  />{" "}
                  Chef’s Special
                </label>
              </div>
              <label>Preparation Time (minutes)</label>
              <input
                type="number"
                min=""
                value={newMenu.preparationTime}
                onChange={(e) =>
                  setNewMenu({ ...newMenu, preparationTime: (e.target.value) })
                }
              />
              <label>Allergen Info</label>
              <input
                type="text"
                value={newMenu.allergenInfo}
                onChange={(e) => setNewMenu({ ...newMenu, allergenInfo: e.target.value })}
              />
              {/* ---------- Addons Section ---------- */}
              {/* ---------- Addons Section ---------- */}
              <h4>Addons</h4>
              <select
                className="admin-addon-select"
                value=""
                onChange={(e) => {
                  const selectedId = e.target.value;
                  if (!selectedId) return;

                  const selectedAddon = addons.find(
                    (a) => (a.id || a.addOnId).toString() === selectedId
                  );

                  if (
                    selectedAddon &&
                    !newMenu.selectedAddons.some(
                      (item) =>
                        (item.id || item.addOnId) === (selectedAddon.id || selectedAddon.addOnId)
                    )
                  ) {
                    setNewMenu({
                      ...newMenu,
                      selectedAddons: [...newMenu.selectedAddons, selectedAddon],
                    });
                  }
                }}
              >
                <option value="">Select Addon</option>
                {addons.map((a) => (
                  <option key={a.addOnId || a.id} value={a.id || a.addOnId}>
                    {a.addOnName || a.name}
                  </option>
                ))}
              </select>
              {/* Display selected Addons in a box */}
              <div className="admin-addon-section">
                <label>Selected Addons</label>
                <div className="admin-addon-box">
                  {newMenu.selectedAddons.length > 0 ? (
                    <div className="admin-addon-grid">
                      {newMenu.selectedAddons.map((a) => (
                        <span key={a.id || a.addOnId} className="admin-addon-tag">
                          {a.addOnName || a.name}
                          <button
                            type="button"
                            className="admin-addon-remove-btn"
                            onClick={() => {
                              const updated = newMenu.selectedAddons.filter(
                                (item) =>
                                  (item.id || item.addOnId) !== (a.id || a.addOnId)
                              );
                              setNewMenu({ ...newMenu, selectedAddons: updated });
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-addon-empty">No addons selected</p>
                  )}
                </div>
              </div>

              {/* ---------- Customization Groups Section ---------- */}
              <h4>Customization Groups</h4>
              <select
                className="admin-customize-select"
                value=""
                onChange={(e) => {
                  const selectedName = e.target.value;
                  if (!selectedName) return;

                  if (!newMenu.customizationGroupNames.includes(selectedName)) {
                    setNewMenu({
                      ...newMenu,
                      customizationGroupNames: [
                        ...newMenu.customizationGroupNames,
                        selectedName,
                      ],
                    });
                  }
                }}
              >
                <option value="">Select Customization Group</option>
                {customizeGroups.map((g) => (
                  <option key={g.id || g.customizationGroupId} value={g.name || g.groupName}>
                    {g.name || g.groupName}
                  </option>
                ))}
              </select>

              {/* Display selected Customization Groups in a box */}
              <div className="admin-customize-section">
                <label>Selected Customization Groups</label>
                <div className="admin-customize-box">
                  {newMenu.customizationGroupNames.length > 0 ? (
                    <div className="admin-customize-grid">
                      {newMenu.customizationGroupNames.map((name) => (
                        <span key={name} className="admin-customize-tag">
                          {name}
                          <button
                            type="button"
                            className="admin-customize-remove-btn"
                            onClick={() => {
                              const updated = newMenu.customizationGroupNames.filter(
                                (n) => n !== name
                              );
                              setNewMenu({ ...newMenu, customizationGroupNames: updated });
                            }}
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="admin-customize-empty">No customization groups selected</p>
                  )}
                </div>
              </div>
              <div className="admin-menu-modal-actions">
                <button type="submit" className="admin-menu-save-btn">
                  Save Menu
                </button>
                <button
                  type="button"
                  className="admin-menu-cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

