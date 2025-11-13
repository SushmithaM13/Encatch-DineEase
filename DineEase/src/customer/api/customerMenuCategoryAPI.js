export const fetchMenuCategories = async (orgId) => {
  const baseUrl = `http://localhost:8082/dine-ease/api/v1/menu-category/${orgId}`;
  let page = 0;
  const size = 10; // backend default page size
  let allCategories = [];
  let hasMore = true;

  try {
    while (hasMore) {
      const res = await fetch(`${baseUrl}?page=${page}&size=${size}&sortBy=id&sortDir=desc`);

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();
      const content = data.content || [];

      allCategories = [...allCategories, ...content];

      // Stop if we got less than one full page
      hasMore = content.length === size;
      page++;
    }

    return allCategories;
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    throw new Error("Failed to fetch menu categories. Please try again later.");
  }
};


