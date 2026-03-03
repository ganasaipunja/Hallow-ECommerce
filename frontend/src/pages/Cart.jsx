import { useState, useEffect } from 'react'
import './Cart.css';
import { useNavigate } from 'react-router-dom'
import { getCart, cartRemove, orderSummary, cartUpdate } from '../api'

export default function Cart({ token }) {
  // UPDATED: Use your computer's IP instead of 127.0.0.1
  const API_URL = "https://hallow-backend.onrender.com";
  
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const [address, setAddress] = useState({ street: '', city: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Helper function for clean Image URLs
  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  function loadCart() {
    getCart(token)
      .then(setItems)
      .catch(() => setError('Failed to load cart'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCart()
  }, [token])

  async function handleRemove(itemId) {
    setError('')
    try {
      await cartRemove(token, itemId)
      setItems(prev => prev.filter(i => i.id !== itemId))
    } catch {
      setError('Failed to remove')
    }
  }

  async function handleUpdateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) return; 
    setError('');
    try {
      await cartUpdate(token, itemId, newQuantity);
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (err) {
      setError('Failed to update quantity');
    }
  }

  async function handleCheckout() {
    if (!address.street || !address.city || !address.pincode) {
        setError('Please fill in all shipping details');
        return;
    }
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        street: address.street,
        city: address.city,
        pincode: address.pincode,
        paymentMethod: paymentMethod
      };
      await orderSummary(token, payload);
      navigate('/orders');
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  }

  const total = items.reduce((sum, i) => sum + Number(i.product?.price || 0) * i.quantity, 0)

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Shopping Cart</h1>
      {error && <p className="error" style={{ color: 'red', background: '#fee', padding: '10px', borderRadius: '4px' }}>{error}</p>}
      
      {items.length === 0 ? (
        <div className="card"><p>Your cart is empty.</p></div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '20px' }}>
            {items.map((i) => (
              <div key={i.id} className="cart-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 2 }}>
                  <div style={{ width: '60px', height: '60px', marginRight: '1rem', background: '#f9f9f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <img 
                      // FIXED: Using helper function for the IP-based image path
                      src={getImageUrl(i.product?.image)} 
                      alt={i.product?.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                    />
                  </div>
                  <strong>{i.product?.name}</strong>
                </div>

                <div style={{ flex: 1, textAlign: 'center' }}>
                  <button onClick={() => handleUpdateQuantity(i.id, i.quantity - 1)}>-</button>
                  <span style={{ margin: '0 12px' }}>{i.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(i.id, i.quantity + 1)}>+</button>
                </div>

                <div style={{ flex: 1, textAlign: 'right' }}>
                  <strong>₹{(Number(i.product?.price || 0) * i.quantity).toFixed(2)}</strong>
                  <br />
                  <button onClick={() => handleRemove(i.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          {/* SHIPPING SECTION */}
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Shipping Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Street Address</label>
                <input 
                  type="text" 
                  placeholder="Flat No, Street, Area"
                  value={address.street} 
                  onChange={e => setAddress({...address, street: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>City</label>
                  <input 
                    type="text" 
                    value={address.city} 
                    onChange={e => setAddress({...address, city: e.target.value})} 
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Pincode</label>
                  <input 
                    type="text" 
                    value={address.pincode} 
                    onChange={e => setAddress({...address, pincode: e.target.value})} 
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT SECTION */}
          <div className="card" style={{ marginBottom: '20px', padding: '20px' }}>
            <h3 style={{ marginTop: 0 }}>Payment Method</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'cod'} 
                  onChange={() => setPaymentMethod('cod')} 
                /> 
                Cash on Delivery
              </label>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'online'} 
                  onChange={() => setPaymentMethod('online')} 
                /> 
                Online Payment
              </label>
            </div>
          </div>

          <div style={{ textAlign: 'right', padding: '20px', background: '#f4f4f4', borderRadius: '8px' }}>
            <p style={{ fontSize: '1.4rem', margin: '0 0 15px 0' }}>
              <strong>Total Amount: ₹{total.toFixed(2)}</strong>
            </p>
            <button 
              className="primary" 
              onClick={handleCheckout} 
              disabled={submitting}
              style={{ padding: '12px 30px', fontSize: '1.1rem', cursor: 'pointer' }}
            >
              {submitting ? 'Processing...' : 'Confirm & Place Order'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}