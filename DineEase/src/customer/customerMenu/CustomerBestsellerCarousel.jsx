import Slider from "react-slick";
import "./CustomerBestsellerCarousel.css";

const CustomerBestsellerCarousel = ({ items = [], onItemSelect }) => {
  const bestsellers = items.filter((item) => item.isBestseller);

  const getImageUrl = (item) => {
    if (item.imageData) return `data:image/jpeg;base64,${item.imageData}`;
    else if (item.imageUrl) {
      const filename = item.imageUrl.split("\\").pop();
      return `http://localhost:8082/dine-ease/uploads/menu-image/${filename}`;
    }
    return "/no-image.jpg";
  };

  const getDefaultVariantPrice = (item) => {
    if (!item?.variants?.length) return 0;
    const defaultVariant = item.variants.find((v) => v.isDefault);
    if (defaultVariant) {
      return defaultVariant.finalPrice > 0
        ? defaultVariant.finalPrice
        : defaultVariant.price;
    }
    const firstVariant = item.variants[0];
    return firstVariant.finalPrice > 0 ? firstVariant.finalPrice : firstVariant.price;
  };

  if (bestsellers.length === 0) return null;

  const settings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 3,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3500,
  pauseOnHover: true,
  swipeToSlide: true,
  arrows: true,
  centerMode: false, // shows 3 full cards, no partials
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        centerMode: false,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        centerMode: false,
      },
    },
  ],
  accessibility: true,
};

  return (
    <div className="carousel-container" role="region" aria-label="Bestseller Items">
      <h2 className="carousel-title" tabIndex="0">🔥 Bestseller Items</h2>
      <Slider {...settings}>
        {bestsellers.map((item) => (
          <div
            key={item.id}
            className="carousel-card"
            onClick={() => onItemSelect(item.id)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') onItemSelect(item.id);
            }}
            aria-label={`View details for ${item.itemName}, price ₹${getDefaultVariantPrice(item)}`}
          >
            <div className="carousel-img-wrap">
              <img
                src={getImageUrl(item)}
                alt={item.itemName}
                className="carousel-img"
                loading="lazy"
                onError={(e) => (e.target.src = "/no-image.jpg")}
              />
              <div className="carousel-overlay">
    <h3>{item.itemName}</h3>
  </div>
  <span className="carousel-price-tag">₹{getDefaultVariantPrice(item)}</span>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CustomerBestsellerCarousel;
