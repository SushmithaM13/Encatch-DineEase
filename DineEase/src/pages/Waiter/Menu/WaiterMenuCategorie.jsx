
import { useEffect, useState } from "react";
import "./WaiterMenuCategorie.css";

import { fetchMenuCategories } from "../api/WaiterMenuCategoriesApi";

export default function WaiterMenuCategorie({
    organizationId,
    selectedCategory,
    setSelectedCategory,
}) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const loadCats = async () => {
            if (!organizationId) return;

            try {
                const data = await fetchMenuCategories(organizationId);

                //  SORT IN ASCENDING ORDER
                const sorted = (data || []).sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                setCategories(sorted);
            } catch {
                console.error("Failed loading categories");
            }
        };

        loadCats();
    }, [organizationId]);


    return (
        <div className="waiter-menu-category-scroll">
            {/* =================== ALL ITEMS CIRCLE =================== */}
            <div
                className={`waiter-menu-category-circle ${selectedCategory === null ? "active" : ""
                    }`}
                onClick={() => setSelectedCategory(null)}
            >
                <div className="waiter-menu-category-cat-circle-img">
                    <div className="waiter-menu-category-cat-circle-no-img">
                        All
                    </div>
                </div>
                <p className="waiter-menu-category-cat-circle-name">All Items</p>
            </div>

            {/* =================== CATEGORY LIST =================== */}
            {categories.map((cat) => (
                <div
                    key={cat.id}
                    className={`waiter-menu-category-circle ${selectedCategory?.id === cat.id ? "active" : ""
                        }`}
                    onClick={() =>
                        setSelectedCategory(selectedCategory?.id === cat.id ? null : cat)
                    }
                >
                    <div className="waiter-menu-category-cat-circle-img">
                        {cat.imageData ? (
                            <img
                                src={`data:image/jpeg;base64,${cat.imageData}`}
                                alt={cat.name}
                            />
                        ) : (
                            <div className="waiter-menu-category-cat-circle-no-img">No Img</div>
                        )}
                    </div>

                    <p className="waiter-menu-category-cat-circle-name">{cat.name}</p>
                </div>
            ))}
        </div>
    );
}
