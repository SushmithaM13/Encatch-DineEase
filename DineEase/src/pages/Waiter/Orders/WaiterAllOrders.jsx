import "./WaiterOrders.css";

export default function WaiterAllOrders() {
    const dummyOrders = {
    NEW: [
      { id: 101, table: 1, items: ["Pizza", "Coke"], time: "12:15 PM" },
      { id: 102, table: 4, items: ["Burger"], time: "12:22 PM" },
    ],
    ONGOING: [
      { id: 201, table: 5, items: ["Pasta"], time: "12:05 PM" },
        { id: 202, table: 2, items: ["Noodles"], time: "12:10 PM" },
    ],
    COMPLETED: [
      { id: 301, table: 3, items: ["Momos"], time: "11:40 AM" },
      { id: 302, table: 6, items: ["Soup"], time: "11:50 AM" },
    ],
  };
    const allOrders = [
    ...dummyOrders.NEW,
    ...dummyOrders.ONGOING,
    ...dummyOrders.COMPLETED,
  ];
    return (    
    <div className="waiter-orders-page">
      <h1 className="title">All Orders</h1> 
        <div className="orders-list">   
        {allOrders.map(order => (
          <div key={order.id} className="order-card">
            <h3>Order #{order.id}</h3>
            <p><b>Table:</b> {order.table}</p>
            <p><b>Items:</b> {order.items.join(", ")}</p>   
            <p><b>Time:</b> {order.time}</p>
          </div>
        ))}
        </div>
    </div>
    );
}