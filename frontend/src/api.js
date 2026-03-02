<<<<<<< HEAD

const BASE = 'https://hallow-backend.onrender.com';

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Token ${token}`;
  return h;
}

// --- HOME PAGE ---
export async function getHome() {
  const res = await fetch(`${BASE}/`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to load home data');
  return data;
}

// --- AUTHENTICATION ---

export async function register(body) {
  const res = await fetch(`${BASE}/auth/register/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.username?.[0] || data.password?.[0] || data.email?.[0] || 'Registration failed');
  return data;
}

export async function login(body) {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.non_field_errors?.[0] || 'Login failed');
  }
  return data; 
}

export async function otpSend(identifier) {
  const isEmail = identifier.includes('@');
  const payload = isEmail ? { email: identifier } : { phone: identifier };

  const res = await fetch(`${BASE}/auth/otp/send/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.phone?.[0] || data.email?.[0] || 'Failed to send OTP');
  return data;
}

export async function otpVerify(phone, otp) {
  const res = await fetch(`${BASE}/auth/otp/verify/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ phone, otp }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Invalid OTP');
  return data;
}

// --- PRODUCTS ---
export async function getProducts() {
  const res = await fetch(`${BASE}/products/`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

// --- CART ---
export async function getCart(token) {
  const res = await fetch(`${BASE}/cart/`, { headers: headers(token) });
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

export async function cartAdd(token, productId, quantity = 1) {
  const res = await fetch(`${BASE}/cart/add/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.product_id?.[0] || data.quantity?.[0] || 'Failed to add');
  return data;
}

export async function cartUpdate(token, itemId, quantity) {
  const res = await fetch(`${BASE}/cart/update/${itemId}/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.quantity?.[0] || 'Failed to update quantity');
  return data;
}

export async function cartRemove(token, itemId) {
  const res = await fetch(`${BASE}/cart/remove/${itemId}/`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!res.ok) throw new Error('Failed to remove');
}

// --- ORDERS ---
export async function orderSummary(token, orderData) {
  const res = await fetch(`${BASE}/orders/summary/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(orderData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to create order');
  return data;
}

export async function getOrders(token) {
  const res = await fetch(`${BASE}/orders/`, { headers: headers(token) });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}
=======

const BASE = 'https://hallow-backend.onrender.com';

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Token ${token}`;
  return h;
}

// --- HOME PAGE ---
export async function getHome() {
  const res = await fetch(`${BASE}/`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to load home data');
  return data;
}

// --- AUTHENTICATION ---

export async function register(body) {
  const res = await fetch(`${BASE}/auth/register/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.username?.[0] || data.password?.[0] || data.email?.[0] || 'Registration failed');
  return data;
}

export async function login(body) {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });
  
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || data.non_field_errors?.[0] || 'Login failed');
  }
  return data; 
}

export async function otpSend(identifier) {
  const isEmail = identifier.includes('@');
  const payload = isEmail ? { email: identifier } : { phone: identifier };

  const res = await fetch(`${BASE}/auth/otp/send/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.phone?.[0] || data.email?.[0] || 'Failed to send OTP');
  return data;
}

export async function otpVerify(phone, otp) {
  const res = await fetch(`${BASE}/auth/otp/verify/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ phone, otp }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Invalid OTP');
  return data;
}

// --- PRODUCTS ---
export async function getProducts() {
  const res = await fetch(`${BASE}/products/`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

// --- CART ---
export async function getCart(token) {
  const res = await fetch(`${BASE}/cart/`, { headers: headers(token) });
  if (!res.ok) throw new Error('Failed to load cart');
  return res.json();
}

export async function cartAdd(token, productId, quantity = 1) {
  const res = await fetch(`${BASE}/cart/add/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.product_id?.[0] || data.quantity?.[0] || 'Failed to add');
  return data;
}

export async function cartUpdate(token, itemId, quantity) {
  const res = await fetch(`${BASE}/cart/update/${itemId}/`, {
    method: 'PATCH',
    headers: headers(token),
    body: JSON.stringify({ quantity }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.quantity?.[0] || 'Failed to update quantity');
  return data;
}

export async function cartRemove(token, itemId) {
  const res = await fetch(`${BASE}/cart/remove/${itemId}/`, {
    method: 'DELETE',
    headers: headers(token),
  });
  if (!res.ok) throw new Error('Failed to remove');
}

// --- ORDERS ---
export async function orderSummary(token, orderData) {
  const res = await fetch(`${BASE}/orders/summary/`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(orderData),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to create order');
  return data;
}

export async function getOrders(token) {
  const res = await fetch(`${BASE}/orders/`, { headers: headers(token) });
  if (!res.ok) throw new Error('Failed to load orders');
  return res.json();
}
>>>>>>> af81378 (Fix: Added WhiteNoise for CSS and updated Render API URL in frontend)
