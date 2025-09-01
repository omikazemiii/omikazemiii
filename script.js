// Menu Data
const menuData = [
    {
        id: 1,
        name: "سالاد سزار",
        description: "سالاد تازه با سس سزار مخصوص، نان تست و پنیر پارمزان",
        price: 45000,
        category: "appetizers",
        icon: "🥗"
    },
    {
        id: 2,
        name: "سوپ قارچ",
        description: "سوپ گرم قارچ با خامه تازه و سبزیجات معطر",
        price: 35000,
        category: "appetizers",
        icon: "🍄"
    },
    {
        id: 3,
        name: "استیک گوشت",
        description: "استیک گوشت گوساله با سس قارچ و سیب زمینی سرخ شده",
        price: 180000,
        category: "main",
        icon: "🥩"
    },
    {
        id: 4,
        name: "مرغ کباب",
        description: "سینه مرغ کبابی با سبزیجات تازه و برنج پخته",
        price: 120000,
        category: "main",
        icon: "🍗"
    },
    {
        id: 5,
        name: "پاستا کاربونارا",
        description: "پاستا با سس خامه، بیکن و پنیر پارمزان",
        price: 95000,
        category: "main",
        icon: "🍝"
    },
    {
        id: 6,
        name: "کباب کوبیده",
        description: "کباب کوبیده با نان تازه و سبزیجات",
        price: 110000,
        category: "main",
        icon: "🍖"
    },
    {
        id: 7,
        name: "آب پرتقال تازه",
        description: "آب پرتقال طبیعی تازه فشرده شده",
        price: 25000,
        category: "drinks",
        icon: "🍊"
    },
    {
        id: 8,
        name: "چای سبز",
        description: "چای سبز داغ با عسل طبیعی",
        price: 15000,
        category: "drinks",
        icon: "🍵"
    },
    {
        id: 9,
        name: "کاپوچینو",
        description: "کاپوچینو ایتالیایی با فوم شیر",
        price: 35000,
        category: "drinks",
        icon: "☕"
    },
    {
        id: 10,
        name: "بستنی وانیلی",
        description: "بستنی وانیلی خانگی با توت فرنگی تازه",
        price: 40000,
        category: "desserts",
        icon: "🍨"
    },
    {
        id: 11,
        name: "کیک شکلاتی",
        description: "کیک شکلاتی مرطوب با گاناش شکلات",
        price: 55000,
        category: "desserts",
        icon: "🍰"
    },
    {
        id: 12,
        name: "پودینگ کارامل",
        description: "پودینگ کارامل با سس کارامل خانگی",
        price: 45000,
        category: "desserts",
        icon: "🍮"
    }
];

// Global Variables
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const menuGrid = document.getElementById('menuGrid');
const cartSidebar = document.getElementById('cartSidebar');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const totalPrice = document.getElementById('totalPrice');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const searchInput = document.getElementById('searchInput');
const categoryBtns = document.querySelectorAll('.category-btn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Cart toggle
    cartToggle.addEventListener('click', toggleCart);
    closeCart.addEventListener('click', toggleCart);

    // Search functionality
    searchInput.addEventListener('input', handleSearch);

    // Category filtering
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            updateCategoryButtons();
            renderMenu();
        });
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartSidebar.contains(e.target) && !cartToggle.contains(e.target)) {
            cartSidebar.classList.remove('open');
        }
    });
}

// Render Menu Items
function renderMenu() {
    const filteredItems = menuData.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredItems.length === 0) {
        menuGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>موردی یافت نشد</h3>
                <p>لطفاً عبارت جستجوی دیگری را امتحان کنید</p>
            </div>
        `;
        return;
    }

    menuGrid.innerHTML = filteredItems.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <div class="menu-item-image">
                <span style="font-size: 4rem;">${item.icon}</span>
            </div>
            <div class="menu-item-content">
                <h3 class="menu-item-title">${item.name}</h3>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-footer">
                    <span class="menu-item-price">${formatPrice(item.price)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${item.id})">
                        <i class="fas fa-plus"></i>
                        افزودن
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to Cart
function addToCart(itemId) {
    const item = menuData.find(item => item.id === itemId);
    const existingItem = cart.find(cartItem => cartItem.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }

    updateCart();
    showNotification(`${item.name} به سبد خرید اضافه شد`);
}

// Remove from Cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCart();
}

// Update Item Quantity
function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCart();
        }
    }
}

// Update Cart Display
function updateCart() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-shopping-cart"></i>
                <h3>سبد خرید خالی است</h3>
                <p>لطفاً از منو انتخاب کنید</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">
                    <span>${item.icon}</span>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update total price
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalPrice.textContent = formatPrice(total);
}

// Toggle Cart Sidebar
function toggleCart() {
    cartSidebar.classList.toggle('open');
}

// Handle Search
function handleSearch() {
    searchQuery = searchInput.value;
    renderMenu();
}

// Update Category Buttons
function updateCategoryButtons() {
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === currentCategory) {
            btn.classList.add('active');
        }
    });
}

// Format Price
function formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Checkout Function
function checkout() {
    if (cart.length === 0) {
        showNotification('سبد خرید خالی است');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    showNotification(`سفارش شما با مبلغ ${formatPrice(total)} ثبت شد`);
    
    // Clear cart
    cart = [];
    updateCart();
    toggleCart();
}

// Add checkout event listener
document.querySelector('.checkout-btn').addEventListener('click', checkout);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cartSidebar.classList.remove('open');
    }
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
});

// Add loading animation
function showLoading() {
    menuGrid.innerHTML = '<div class="loading"></div>';
}

// Simulate loading (optional)
// setTimeout(() => {
//     showLoading();
//     setTimeout(renderMenu, 1000);
// }, 100);