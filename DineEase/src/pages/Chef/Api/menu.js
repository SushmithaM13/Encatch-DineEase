// src/api/menu.js
export const getMenuItems = async () => {
  return [
    // Starters
    {
      name: 'Spring Rolls',
      price: 5.99,
      desc: 'Crispy rolls filled with fresh vegetables',
      status: 'In Stock',
      category: 'Starters',
      img: 'https://herbsandflour.com/wp-content/uploads/2023/10/Crispy-Vegetable-Spring-Rolls-Recipe.jpg'
    },
    {
      name: 'Chicken Wings',
      price: 6.99,
      desc: 'Spicy grilled chicken wings with dipping sauce',
      status: 'Out of Stock',
      category: 'Starters',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLLs4olCCUhtlWLdZwHaGWiYexPo0azRSOPA&s'
    },

    // Main Course
    {
      name: 'Grilled Salmon',
      price: 24.99,
      desc: 'Fresh Atlantic salmon with herbs and lemon butter sauce',
      status: 'In Stock',
      category: 'Main Course',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk1BBovn0Ea0nW-fDMZ4XxdPNPWuEYKit_9Q&s'
    },
    {
      name: 'Vegetarian Pasta',
      price: 16.99,
      desc: 'Penne pasta with seasonal vegetables in a creamy sauce',
      status: 'In Stock',
      category: 'Main Course',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDh_JNeDTKKhAOCNbtwoCZBESHgSYicFb3xQ&s'
    },

    // Vegetarian
    {
      name: 'Paneer Butter Masala',
      price: 12.99,
      desc: 'Cottage cheese cooked in rich tomato gravy',
      status: 'In Stock',
      category: 'Vegetarian',
      img: 'https://www.vegrecipesofindia.com/wp-content/uploads/2020/01/paneer-butter-masala-5.jpg'
    },
    {
      name: 'Veg Biryani',
      price: 10.99,
      desc: 'Aromatic basmati rice with mixed vegetables',
      status: 'Out of Stock',
      category: 'Vegetarian',
      img: 'https://www.madhuseverydayindian.com/wp-content/uploads/2022/11/easy-vegetable-biryani.jpg'
    },

    // Non-Vegetarian
    {
      name: 'Chicken Biryani',
      price: 13.99,
      desc: 'Flavorful basmati rice with tender chicken pieces',
      status: 'In Stock',
      category: 'Non-Vegetarian',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP8l2kuZDANQExDsYteLg0NEUEjLkjudABRg&s'
    },
    {
      name: 'Mutton Curry',
      price: 15.99,
      desc: 'Spicy and rich mutton curry',
      status: 'In Stock',
      category: 'Non-Vegetarian',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRecCY9u1fALWGvuyYHwt-hgdeLAcLZ9MBpWg&s'
    },

    // Beverages
    {
      name: 'Lemonade',
      price: 3.99,
      desc: 'Refreshing homemade lemonade',
      status: 'In Stock',
      category: 'Beverages',
      img: 'https://i2.wp.com/lmld.org/wp-content/uploads/2022/04/Lemonade-4.jpg'
    },
    {
      name: 'Cold Coffee',
      price: 4.99,
      desc: 'Iced coffee with cream and chocolate syrup',
      status: 'Out of Stock',
      category: 'Beverages',
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlDV-BacSH0ZGindSL60uNgamV6RTRy5hmPw&s'
    },

    // Desserts
    {
      name: 'Chocolate Cake',
      price: 8.99,
      desc: 'Rich chocolate cake with ganache frosting',
      status: 'Out of Stock',
      category: 'Desserts',
      img: 'https://static.toiimg.com/thumb/53096885.cms?imgsize=1572013&width=800&height=800'
    },
    {
      name: 'Ice Cream Sundae',
      price: 4.99,
      desc: 'Vanilla ice cream with chocolate and nuts',
      status: 'In Stock',
      category: 'Desserts',
      img: 'https://cookienameddesire.com/wp-content/uploads/2018/05/brownie-sundae.jpg'
    }
  ];
};
