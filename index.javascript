// Shopping Cart Functionality
let cart = [];
let cartTotal = 0;

// DOM Elements
const cartIcon = document.getElementById('cartIcon');
const closeCart = document.getElementById('closeCart');
const shoppingCart = document.getElementById('shoppingCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTax = document.getElementById('cartTax');
const cartTotalElem = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const emptyCartMessage = document.getElementById('emptyCartMessage');

// Toggle Cart
cartIcon.addEventListener('click', function() {
    shoppingCart.classList.add('active');
    updateCartDisplay();
});

closeCart.addEventListener('click', function() {
    shoppingCart.classList.remove('active');
});

// Close cart when clicking outside
document.addEventListener('click', function(event) {
    if (!shoppingCart.contains(event.target) && !cartIcon.contains(event.target)) {
        shoppingCart.classList.remove('active');
    }
});

// Add to Cart functionality
function setupAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dishCard = this.closest('.dish-card');
            const dishName = dishCard.querySelector('.dish-name').textContent;
            const dishPrice = dishCard.querySelector('.dish-price').textContent;
            const quantity = parseInt(dishCard.querySelector('.quantity-display').textContent);
            
            // Extract numeric price
            const price = parseInt(dishPrice.replace(/[^0-9]/g, ''));
            
            addToCart(dishName, price, quantity);
            showNotification(`Added ${quantity} ${dishName} to cart!`);
            
            // Reset quantity to 1
            dishCard.querySelector('.quantity-display').textContent = '1';
        });
    });
}

// Add item to cart
function addToCart(name, price, quantity) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: quantity
        });
    }
    
    updateCart();
}

// Remove item from cart
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
    updateCart();
}

// Update item quantity
function updateCartItemQuantity(name, newQuantity) {
    const item = cart.find(item => item.name === name);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(name);
        } else {
            item.quantity = newQuantity;
        }
        updateCart();
    }
}

// Update cart
function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart display
    updateCartDisplay();
    
    // Save cart to localStorage
    saveCartToLocalStorage();
}

// Update cart display
function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItems.appendChild(emptyCartMessage);
    } else {
        emptyCartMessage.style.display = 'none';
        
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>₹ ${item.price} × ${item.quantity}</p>
                    <button class="remove-item" onclick="removeFromCart('${item.name}')">Remove</button>
                </div>
                <div class="item-controls">
                    <button class="item-quantity-btn" onclick="updateCartItemQuantity('${item.name}', ${item.quantity - 1})">-</button>
                    <span class="item-quantity">${item.quantity}</span>
                    <button class="item-quantity-btn" onclick="updateCartItemQuantity('${item.name}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-price">₹ ${itemTotal}</div>
            `;
            cartItems.appendChild(cartItem);
        });
    }
    
    // Calculate totals
    const tax = subtotal * 0.05;
    const total = subtotal + tax;
    
    cartSubtotal.textContent = `₹ ${subtotal}`;
    cartTax.textContent = `₹ ${Math.round(tax)}`;
    cartTotalElem.textContent = `₹ ${Math.round(total)}`;
}

// Show notification
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create new notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    notification.style.display = 'block';
    
    // Remove notification after animation
    setTimeout(() => {
        notification.remove();
    }, 2300);
}

// Checkout functionality
checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // In a real application, this would redirect to payment gateway
    // For demo, we'll show an alert
    const orderSummary = cart.map(item => 
        `${item.name} × ${item.quantity}: ₹ ${item.price * item.quantity}`
    ).join('\n');
    
    const total = parseInt(cartTotalElem.textContent.replace(/[^0-9]/g, ''));
    
    alert(`Order Summary:\n\n${orderSummary}\n\nTotal: ₹ ${total}\n\nProceeding to checkout...\n\nNote: This is a demo. In a real application, this would redirect to payment.`);
    
    // Clear cart after checkout
    cart = [];
    updateCart();
    shoppingCart.classList.remove('active');
});

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Call setupAddToCartButtons after creating dish cards
// Modify the showOrderPage function to include this:
// Add this line at the end of the showOrderPage function, after creating dish cards:
// setupAddToCartButtons();

// Load cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromLocalStorage();
    
    // Add setupAddToCartButtons call to showOrderPage function
    const originalShowOrderPage = showOrderPage;
    window.showOrderPage = function(foodCourtName) {
        originalShowOrderPage(foodCourtName);
        // Add a small delay to ensure DOM is ready
        setTimeout(setupAddToCartButtons, 100);
    };
});