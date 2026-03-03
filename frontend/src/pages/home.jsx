import { useState, useEffect } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { getHome } from '../api'; 

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Use your computer's IP
  const API_URL = "https://hallow-backend.onrender.com";

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  useEffect(() => {
    setLoading(true);
    getHome()
      .then(data => {
        if (data.banners) setBanners(data.banners);
        if (data.featured_products) setFeatured(data.featured_products);
      })
      .catch(err => console.error("Home API error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Helper function to build correct image URLs
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    // Ensure there isn't a double slash between API_URL and path
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  return (
    <div className="home-container">
      <header className="hero-section">
        <div className="hero-content">
          <span className="badge">New Season Arrival</span>
          <h1>Quality Meets Style at HALLOW</h1>
          <p>Discover our curated collection of premium electronics and accessories.</p>
          <div className="hero-btns">
            <Link to="/catalog" className="cta-button">Shop Collection</Link>
            {/* <Link to="/catalog" className="secondary-button">View Deals</Link> */}
          </div>
        </div>
      </header>

      {/* 2. DYNAMIC BANNER SLIDER */}
      {banners.length > 0 && (
        <section className="banner-slider">
          {banners.map((bn, index) => (
            <div 
              key={bn.id || index} 
              className={`slide ${index === currentBanner ? 'active' : ''}`}
              style={{ 
                // FIXED: Using the helper function for clean URLs
                backgroundImage: `url(${getImageUrl(bn.image)})` 
              }}
            >
              <div className="slide-content">
                <h2>{bn.title || "Special Offer"}</h2>
                <Link to="/catalog" className="banner-btn">Shop Now</Link>
              </div>
            </div>
          ))}
          
          <div className="slider-dots">
            {banners.map((_, i) => (
              <span 
                key={i} 
                className={i === currentBanner ? 'dot active' : 'dot'}
                onClick={() => setCurrentBanner(i)}
              ></span>
            ))}
          </div>
        </section>
      )}

      {/* 3. TRENDING PRODUCTS */}
      <section className="featured-section">
        <div className="section-title">
          <h2>Trending Products</h2>
          <Link to="/catalog" className="view-all">View All Products →</Link>
        </div>
        {loading ? <p className="loading-text">Loading...</p> : (
          <div className="product-mini-grid">
            {featured.map(product => (
              <div key={product.id} className="home-product-card">
                {/* FIXED: Using the helper function here too */}
                <img src={getImageUrl(product.image)} alt={product.name} />
                <h4>{product.name}</h4>
                <p className="home-price">₹{Number(product.price).toFixed(2)}</p>
                <Link to="/catalog" className="details-link">Details</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}