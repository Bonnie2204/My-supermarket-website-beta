// ---------- CART STATE ----------
let cart = []; // each item: { name: string, price: number, id: unique, quantity: number }
let nextId = 1;

// DOM elements
const cartItemsContainer = document.getElementById('cartItemsList');
const cartTotalSpan = document.getElementById('cartTotal');
const cartCountSpan = document.getElementById('cartCount');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const themeBtn = document.getElementById('themeBtn');

// Helper: update entire cart UI
function updateCartUI() {
  // update cart count (total quantity)
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountSpan.innerText = `(${totalItems})`;

  // update total price
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalSpan.innerText = totalPrice.toFixed(0);

  // render cart items list
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<div class="empty-cart-msg">🛒 Cart is empty. Add milk, bread & more!</div>`;
    return;
  }

  cartItemsContainer.innerHTML = '';
  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.setAttribute('data-id', item.id);

    // left side: name + price + qty
    const detailsSpan = document.createElement('span');
    detailsSpan.style.flex = '3';
    detailsSpan.innerHTML = `<strong>${escapeHtml(item.name)}</strong> &nbsp;| ${item.price} Ksh &nbsp;✖️ ${item.quantity} = <b>${item.price * item.quantity} Ksh</b>`;

    // action buttons group
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'cart-item-actions';

    const incrementBtn = document.createElement('button');
    incrementBtn.innerText = '+';
    incrementBtn.style.background = '#2b7a3e';
    incrementBtn.style.padding = '0.2rem 0.8rem';
    incrementBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateQuantity(item.id, item.quantity + 1);
    });

    const decrementBtn = document.createElement('button');
    decrementBtn.innerText = '−';
    decrementBtn.style.background = '#b5651e';
    decrementBtn.style.padding = '0.2rem 0.8rem';
    decrementBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (item.quantity > 1) {
        updateQuantity(item.id, item.quantity - 1);
      } else {
        removeItemFromCart(item.id);
      }
    });

    const removeBtn = document.createElement('button');
    removeBtn.innerText = '✖ Remove';
    removeBtn.style.background = '#b91c1c';
    removeBtn.style.padding = '0.2rem 0.9rem';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeItemFromCart(item.id);
    });

    actionsDiv.appendChild(decrementBtn);
    actionsDiv.appendChild(incrementBtn);
    actionsDiv.appendChild(removeBtn);

    itemDiv.appendChild(detailsSpan);
    itemDiv.appendChild(actionsDiv);
    cartItemsContainer.appendChild(itemDiv);
  });
}

// helper to escape HTML
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// update item quantity
function updateQuantity(id, newQuantity) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex !== -1) {
    if (newQuantity <= 0) {
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = newQuantity;
    }
    updateCartUI();
    saveCartToLocal();
  }
}

// remove item entirely
function removeItemFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCartUI();
  saveCartToLocal();
}

// add product logic (merging if same name)
function addProductToCart(productName, productPrice) {
  // check if item with same name exists
  const existing = cart.find(item => item.name === productName);
  if (existing) {
    existing.quantity += 1;
    updateCartUI();
    saveCartToLocal();
    showMiniToast(`➕ ${productName} added (now ${existing.quantity})`);
  } else {
    const newItem = {
      id: nextId++,
      name: productName,
      price: productPrice,
      quantity: 1
    };
    cart.push(newItem);
    updateCartUI();
    saveCartToLocal();
    showMiniToast(`✨ ${productName} added to cart!`);
  }
}

// simple toast-like notification (non-intrusive)
let toastTimeout = null;
function showMiniToast(message) {
  let toastEl = document.getElementById('dynamicToast');
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.id = 'dynamicToast';
    toastEl.style.position = 'fixed';
    toastEl.style.bottom = '20px';
    toastEl.style.left = '50%';
    toastEl.style.transform = 'translateX(-50%)';
    toastEl.style.backgroundColor = '#2c3e2f';
    toastEl.style.color = 'white';
    toastEl.style.padding = '10px 24px';
    toastEl.style.borderRadius = '50px';
    toastEl.style.fontWeight = 'bold';
    toastEl.style.zIndex = '9999';
    toastEl.style.boxShadow = '0 8px 18px rgba(0,0,0,0.2)';
    toastEl.style.backdropFilter = 'blur(6px)';
    toastEl.style.fontSize = '0.9rem';
    document.body.appendChild(toastEl);
  }
  toastEl.innerText = message;
  toastEl.style.opacity = '1';
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.style.opacity = '0';
    setTimeout(() => {
      if (toastEl.parentNode) toastEl.style.display = 'none';
      toastEl.style.display = 'block';
    }, 300);
  }, 1800);
}

// clear all cart
function clearCart() {
  if (cart.length > 0) {
    cart = [];
    updateCartUI();
    saveCartToLocal();
    showMiniToast('🗑️ Cart cleared!');
  } else {
    showMiniToast('Cart is already empty');
  }
}

// checkout handler
function handleCheckout() {
  if (cart.length === 0) {
    showMiniToast('⚠️ Your cart is empty. Add some fresh items first!');
    return;
  }
  const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const itemNames = cart.map(i => `${i.name} x${i.quantity}`).join(', ');
  alert(`✅ Thank you for shopping at BNG ENTERPRISES!\n\n🛍️ Items: ${itemNames}\n💰 Total Amount: Ksh ${total.toFixed(0)}\n\n🚚 Your order will be delivered soon. Karibu tena!`);
  // optional: reset cart after checkout? user might expect reset? but normally it's purchase, let's give option to clear or keep? 
  // better UX: ask if they want to start fresh after checkout.
  const resetAfter = confirm("Would you like to empty your cart after this purchase? (Click OK to clear cart, Cancel to keep items)");
  if (resetAfter) {
    cart = [];
    updateCartUI();
    saveCartToLocal();
    showMiniToast('🧾 Cart reset. Ready for new shopping!');
  } else {
    showMiniToast('🛒 Cart preserved. Keep shopping!');
  }
}

// LocalStorage persistence
function saveCartToLocal() {
  try {
    const toStore = {
      cart: cart,
      nextId: nextId
    };
    localStorage.setItem('bng_cart_data', JSON.stringify(toStore));
  } catch(e) { console.warn(e); }
}

function loadCartFromLocal() {
  const saved = localStorage.getItem('bng_cart_data');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.cart && Array.isArray(parsed.cart)) {
        cart = parsed.cart;
        nextId = parsed.nextId || (cart.length ? Math.max(...cart.map(c=>c.id),0)+1 : 1);
        updateCartUI();
      } else {
        cart = [];
        updateCartUI();
      }
    } catch(e) { cart = []; updateCartUI(); }
  } else {
    cart = [];
    updateCartUI();
  }
}

// DARK MODE LOGIC
function initTheme() {
  const savedTheme = localStorage.getItem('bng_theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    themeBtn.innerText = '☀️ Light Mode';
  } else {
    document.body.classList.remove('dark');
    themeBtn.innerText = '🌙 Dark Mode';
  }
}

function toggleTheme() {
  if (document.body.classList.contains('dark')) {
    document.body.classList.remove('dark');
    localStorage.setItem('bng_theme', 'light');
    themeBtn.innerText = '🌙 Dark Mode';
  } else {
    document.body.classList.add('dark');
    localStorage.setItem('bng_theme', 'dark');
    themeBtn.innerText = '☀️ Light Mode';
  }
}

// Set up event listeners for all "Add to Cart" buttons dynamically (including existing + future)
function bindAddButtons() {
  const addButtons = document.querySelectorAll('.addBtn');
  addButtons.forEach(btn => {
    // remove previous listener to avoid duplicates (just in case)
    btn.removeEventListener('click', addHandler);
    btn.addEventListener('click', addHandler);
  });
}

function addHandler(e) {
  e.stopPropagation();
  const button = e.currentTarget;
  const price = parseInt(button.getAttribute('data-price'));
  const name = button.getAttribute('data-name');
  if (!isNaN(price) && name) {
    addProductToCart(name, price);
  } else {
    // fallback: try to find parent card data
    const card = button.closest('.card');
    if (card) {
      const nameFromCard = card.getAttribute('data-name') || card.querySelector('h3')?.innerText.replace(/[^a-zA-Z\s]/g, '').trim();
      const priceFromCard = parseInt(card.getAttribute('data-price'));
      if (nameFromCard && !isNaN(priceFromCard)) {
        addProductToCart(nameFromCard, priceFromCard);
      }
    }
  }
}

// Event Listeners
clearCartBtn.addEventListener('click', clearCart);
checkoutBtn.addEventListener('click', handleCheckout);
themeBtn.addEventListener('click', toggleTheme);

// Initialize app
loadCartFromLocal();
bindAddButtons();
initTheme();