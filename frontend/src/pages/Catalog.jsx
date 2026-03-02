import { useState, useEffect } from 'react'
import './Catalog.css';
import { Link, useSearchParams } from 'react-router-dom'
import { getProducts, cartAdd } from '../api'

export default function Catalog({ token }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('search')?.toLowerCase() || '';
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingId, setAddingId] = useState(null)
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const API_URL = "http://127.0.0.1:8000";

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  useEffect(() => {
    getProducts()
      .then(data => {
        // Sort newest first on the frontend as a backup
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setProducts(sorted);
      })
      .catch(() => setError('Failed to load products'))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['All', ...new Set(products
    .map(p => p.category)
    .filter(cat => cat && cat.trim() !== "")
  )].sort();

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleAdd(productId) {
    if (!token) return
    setAddingId(productId)
    try {
      await cartAdd(token, productId, 1)
      alert("Added to cart!");
    } catch (err) {
      setError('Failed to add to cart')
    } finally {
      setAddingId(null)
    }
  }

  // Check for New Arrivals (48h)
  const isNew = (date) => {
    const added = new Date(date);
    const now = new Date();
    return (now - added) / (1000 * 60 * 60) < 48;
  };

  if (loading) return <div className="container loading-state"><p>Loading Admin Catalog...</p></div>

  return (
    <div className="container">
      
      {/* --- DETAIL VIEW (SPOTLIGHT) --- */}
      {selectedProduct && (
        <div className="product-detail-section">
          <div className="detail-card">
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>×</button>
            <div className="detail-split">
              <div className="detail-left">
                <img 
                  src={getImageUrl(selectedProduct.image)} 
                  alt={selectedProduct.name} 
                  className={selectedProduct.stock <= 0 ? 'oos-img' : ''}
                />
              </div>
              <div className="detail-right">
                <span className="category-tag">{selectedProduct.category || 'General'}</span>
                <h1>{selectedProduct.name}</h1>
                
                {/* Stock Warnings */}
                {selectedProduct.stock <= 0 ? (
                  <p className="stock-alert error">Out of Stock</p>
                ) : selectedProduct.stock <= 5 ? (
                  <p className="stock-alert warning">Hurry! Only {selectedProduct.stock} left in stock.</p>
                ) : (
                  <p className="stock-alert success">In Stock</p>
                )}

                <p className="detail-price">₹{Number(selectedProduct.price).toFixed(2)}</p>
                <div className="divider"></div>
                <p className="detail-desc">{selectedProduct.description || "No description provided."}</p>
                
                <div className="detail-action">
                  {token ? (
                    <button 
                      className="primary detail-add-btn" 
                      onClick={() => handleAdd(selectedProduct.id)} 
                      disabled={addingId === selectedProduct.id || selectedProduct.stock <= 0}
                    >
                      {selectedProduct.stock <= 0 ? 'Unavailable' : addingId === selectedProduct.id ? 'Adding...' : 'Add to Cart'}
                    </button>
                  ) : (
                    <Link to="/login" className="login-link-box">Login to Buy</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="catalog-layout">
        <aside className="sidebar">
          <h3 className="sidebar-title">Store Categories</h3>
          <ul className="category-list">
            {categories.map(cat => (
              <li key={cat} className={`category-item ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                {cat} <span className="arrow">›</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="main-content">
          <h2 className="section-title">{selectedCategory}</h2>
          
          <div className="minimal-grid">
            {filteredProducts.map((p) => (
              <div key={p.id} className="minimal-card">
                <div className={`minimal-image-wrapper ${p.stock <= 0 ? 'oos-wrapper' : ''}`} onClick={() => handleProductClick(p)}>
                  
                  {/* Badges */}
                  {p.stock <= 0 ? (
                    <span className="badge badge-oos">OUT OF STOCK</span>
                  ) : p.stock <= 5 ? (
                    <span className="badge badge-low">LOW STOCK</span>
                  ) : isNew(p.created_at) ? (
                    <span className="badge badge-new">NEW</span>
                  ) : null}

                  <img src={getImageUrl(p.image)} alt={p.name} />
                  <div className="image-overlay">View Details</div>
                </div>
                <div className="minimal-info">
                  <h3>{p.name}</h3>
                  <span className="minimal-price">₹{Number(p.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}