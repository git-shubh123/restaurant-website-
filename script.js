// ==========================
// Food Data
// ==========================
const foodData = [
    { id: 1, name: "Margherita Pizza", price: 12.99, category: "pizza", image: "img/food/p1.jpg", description: "Classic pizza with tomato sauce, mozzarella, and basil" },
    { id: 2, name: "Pepperoni Pizza", price: 14.99, category: "pizza", image: "img/category/pizza.jpg", description: "Pizza topped with pepperoni and mozzarella cheese" },
    { id: 3, name: "Cheeseburger", price: 9.99, category: "burger", image: "img/food/b1.jpg", description: "Juicy beef burger with cheese, lettuce, and tomato" },
    { id: 4, name: "Chicken Burger", price: 10.99, category: "burger", image: "img/category/burger.jpg", description: "Grilled chicken breast with special sauce" },
    { id: 5, name: "Club Sandwich", price: 8.99, category: "sandwich", image: "img/food/s1.jpg", description: "Triple-decker sandwich with turkey, bacon, and vegetables" },
    { id: 6, name: "Veggie Sandwich", price: 7.99, category: "sandwich", image: "img/category/sandwich.jpg", description: "Fresh vegetables with hummus and sprouts" }
];

// ==========================
// Cart Variables
// ==========================
let cart = [];
const cartLink = document.getElementById('cartLink');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const checkoutBtn = document.getElementById('checkoutBtn');

// ==========================
// Initialization
// ==========================
document.addEventListener('DOMContentLoaded', function () {
    loadCartFromLocalStorage();
    updateCartUI();

    if (cartLink) cartLink.addEventListener('click', e => { e.preventDefault(); openCart(); });
    if (closeCart) closeCart.addEventListener('click', closeCartModal);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    window.addEventListener('click', event => { if (event.target === cartModal) closeCartModal(); });

    // Load menu page if element exists
    const menuFoods = document.getElementById('menuFoods');
    if (menuFoods) {
        displayMenuItems("all");
        setupFilterButtons();
    }

    // Load featured foods (for home page)
    const featuredFoods = document.getElementById('featuredFoods');
    if (featuredFoods) displayFeaturedFoods();
});

// ==========================
// Featured Foods (Home Page)
// ==========================
function displayFeaturedFoods() {
    const featuredFoods = document.getElementById('featuredFoods');
    featuredFoods.innerHTML = '';
    const featuredItems = foodData.slice(0, 3);

    featuredItems.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${food.image}" alt="${food.name}">
            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <span class="price">$${food.price.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${food.id}">Add to Cart</button>
            </div>
        `;
        featuredFoods.appendChild(foodCard);
    });

    addCartButtonEvents();
}

// ==========================
// Menu Page Logic
// ==========================
function displayMenuItems(category) {
    const menuFoods = document.getElementById('menuFoods');
    if (!menuFoods) return;

    menuFoods.innerHTML = '';
    const filtered = category === 'all' ? foodData : foodData.filter(food => food.category === category);

    filtered.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${food.image}" alt="${food.name}">
            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <span class="price">$${food.price.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${food.id}">Add to Cart</button>
            </div>
        `;
        menuFoods.appendChild(foodCard);
    });

    addCartButtonEvents();
}

function setupFilterButtons() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            displayMenuItems(category);
        });
    });
}

// ==========================
// Cart Functions
// ==========================
function addCartButtonEvents() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const foodId = parseInt(this.getAttribute('data-id'));
            addToCart(foodId);
        });
    });
}

function addToCart(foodId) {
    const food = foodData.find(item => item.id === foodId);
    if (!food) return;

    const existing = cart.find(item => item.id === foodId);
    if (existing) existing.quantity += 1;
    else cart.push({ ...food, quantity: 1 });

    saveCartToLocalStorage();
    updateCartUI();
    alert(`${food.name} added to cart!`);
}

function removeFromCart(foodId) {
    cart = cart.filter(item => item.id !== foodId);
    saveCartToLocalStorage();
    updateCartUI();
}

function updateQuantity(foodId, change) {
    const item = cart.find(i => i.id === foodId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(foodId);
    else {
        saveCartToLocalStorage();
        updateCartUI();
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const el = document.createElement('div');
        el.className = 'cart-item';
        el.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="item-price">$${item.price.toFixed(2)} each</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <p class="item-total">$${itemTotal.toFixed(2)}</p>
            <button class="remove-item" data-id="${item.id}">×</button>
        `;
        cartItems.appendChild(el);
    });

    cartTotal.textContent = total.toFixed(2);

    document.querySelectorAll('.quantity-btn.minus').forEach(b => b.addEventListener('click', e => updateQuantity(parseInt(e.target.getAttribute('data-id')), -1)));
    document.querySelectorAll('.quantity-btn.plus').forEach(b => b.addEventListener('click', e => updateQuantity(parseInt(e.target.getAttribute('data-id')), 1)));
    document.querySelectorAll('.remove-item').forEach(b => b.addEventListener('click', e => removeFromCart(parseInt(e.target.getAttribute('data-id')))));
}

function openCart() { cartModal.style.display = 'flex'; }
function closeCartModal() { cartModal.style.display = 'none'; }

// ==========================
// Checkout Flow
// ==========================
function askForAddressAndContact() {
    let infoModal = document.getElementById('infoModal');
    if (!infoModal) {
        infoModal = document.createElement('div');
        infoModal.id = 'infoModal';
        infoModal.className = 'cart-modal';
        infoModal.innerHTML = `
            <div class="cart-content" style="width:90%;max-width:500px;">
                <div class="cart-header">
                    <h2>Enter Delivery Details</h2>
                    <span class="close-btn" id="closeInfo">&times;</span>
                </div>
                <div class="cart-body" style="padding:20px;">
                    <form id="infoForm" style="display:flex;flex-direction:column;gap:15px;">
                        <input type="text" id="fullName" placeholder="Full Name" required>
                        <input type="text" id="contactNumber" placeholder="Contact Number" required>
                        <textarea id="deliveryAddress" placeholder="Delivery Address" rows="3" required></textarea>
                        <button type="submit" class="btn-primary" style="background:#007bff;">Place Order</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(infoModal);

        document.getElementById('closeInfo').addEventListener('click', () => infoModal.style.display = 'none');
        window.addEventListener('click', e => { if (e.target === infoModal) infoModal.style.display = 'none'; });

        document.getElementById('infoForm').addEventListener('submit', e => {
            e.preventDefault();
            const name = document.getElementById('fullName').value.trim();
            const contact = document.getElementById('contactNumber').value.trim();
            const address = document.getElementById('deliveryAddress').value.trim();
            if (!name || !contact || !address) return alert('Please fill all details.');
            infoModal.style.display = 'none';
            placeFinalOrder(name, contact, address);
        });
    }
    infoModal.style.display = 'flex';
}

function checkout() {
    if (cart.length === 0) return alert('Your cart is empty!');
    askForAddressAndContact();
}

function placeFinalOrder(name, contact, address) {
    const order = {
        items: [...cart],
        total: parseFloat(cartTotal.textContent),
        customer: { name, contact, address },
        timestamp: new Date().toISOString()
    };
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    generateBillPreview(order);
    cart = [];
    saveCartToLocalStorage();
    updateCartUI();
    closeCartModal();
    alert('✅ Your order has been placed successfully!');
}

// ==========================
// Bill Generation
// ==========================
function generateBillPreview(order) {
    let content = `
=====================================
          FOODIE DELIGHT
      ORDER RECEIPT & BILL
=====================================
Date: ${new Date(order.timestamp).toLocaleString()}

Items:
-------------------------------------
`;
    order.items.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        content += `${item.name}
  Price: $${item.price.toFixed(2)} x ${item.quantity} = $${itemTotal}
-------------------------------------
`;
    });

    content += `
Customer Details:
-------------------------------------
Name: ${order.customer.name}
Contact: ${order.customer.contact}
Address: ${order.customer.address}

-------------------------------------
Total Amount: $${order.total.toFixed(2)}

=====================================
    Thank you for your order!
=====================================
`;

    showBillPreview(content, order);
}

function showBillPreview(content, order) {
    let billModal = document.getElementById('billModal');
    if (!billModal) {
        billModal = document.createElement('div');
        billModal.id = 'billModal';
        billModal.className = 'cart-modal';
        billModal.innerHTML = `
            <div class="cart-content" style="width:90%;max-width:700px;">
                <div class="cart-header">
                    <h2>Order Bill Preview</h2>
                    <span class="close-btn" id="closeBill">&times;</span>
                </div>
                <div class="cart-body" style="padding:20px;">
                    <div id="billPreview" style="white-space:pre-wrap;font-family:monospace;background:#f8f9fa;padding:20px;border-radius:5px;margin-bottom:20px;max-height:400px;overflow-y:auto;"></div>
                    <div class="cart-footer" style="display:flex;gap:10px;justify-content:center;">
                        <button class="btn-primary" id="downloadTxt" style="background:#28a745;">Download as TXT</button>
                        <button class="btn-primary" id="downloadPdf" style="background:#dc3545;">Download as PDF</button>
                        <button class="btn-primary" id="closeBillBtn">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(billModal);

        document.getElementById('closeBill').addEventListener('click', () => billModal.style.display = 'none');
        document.getElementById('closeBillBtn').addEventListener('click', () => billModal.style.display = 'none');
        document.getElementById('downloadTxt').addEventListener('click', () => downloadBillAsTxt(content, order));
        document.getElementById('downloadPdf').addEventListener('click', () => downloadBillAsPdf(content, order));
        window.addEventListener('click', e => { if (e.target === billModal) billModal.style.display = 'none'; });
    }
    document.getElementById('billPreview').textContent = content;
    billModal.style.display = 'flex';
}

// ==========================
// Download Functions
// ==========================
function downloadBillAsTxt(content, order) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function downloadBillAsPdf(content, order) {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Bill</title><style>body{font-family:monospace;margin:20px;}</style></head><body><pre>${content}</pre><script>window.onload=function(){window.print();}</script></body></html>`);
    w.document.close();
}

// ==========================
// Local Storage
// ==========================
function saveCartToLocalStorage() { localStorage.setItem('cart', JSON.stringify(cart)); }
function loadCartFromLocalStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) cart = JSON.parse(saved);
}
