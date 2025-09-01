// Digital Menu JavaScript
class DigitalMenu {
    constructor() {
        this.cart = [];
        this.cartTotal = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCartDisplay();
        this.animateMenuItems();
    }

    setupEventListeners() {
        // Category filter buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.filterByCategory(e.target.dataset.category));
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => this.searchMenu(e.target.value));

        // Add to cart buttons
        const addBtns = document.querySelectorAll('.add-btn');
        addBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.addToCart(e));
        });

        // Cart toggle
        const cartToggle = document.getElementById('cartToggle');
        cartToggle.addEventListener('click', () => this.toggleCart());

        // Cart close
        const cartClose = document.getElementById('cartClose');
        cartClose.addEventListener('click', () => this.closeCart());

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.addEventListener('click', () => this.checkout());

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartPanel = document.getElementById('cartPanel');
            const cartToggle = document.getElementById('cartToggle');
            if (!cartPanel.contains(e.target) && !cartToggle.contains(e.target)) {
                this.closeCart();
            }
        });
    }

    filterByCategory(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Show/hide menu sections
        const menuCategories = document.querySelectorAll('.menu-category');
        menuCategories.forEach(section => {
            if (category === 'all' || section.dataset.category === category) {
                section.classList.remove('hidden');
                this.animateMenuItems(section);
            } else {
                section.classList.add('hidden');
            }
        });
    }

    searchMenu(query) {
        const menuItems = document.querySelectorAll('.menu-item');
        const searchTerm = query.toLowerCase().trim();

        menuItems.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm) || searchTerm === '') {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        // Show all categories if searching
        if (searchTerm) {
            document.querySelectorAll('.menu-category').forEach(section => {
                section.classList.remove('hidden');
            });
        }
    }

    addToCart(event) {
        event.preventDefault();
        event.stopPropagation();

        const menuItem = event.target.closest('.menu-item');
        const title = menuItem.querySelector('h3').textContent;
        const description = menuItem.querySelector('p').textContent;
        const priceText = menuItem.querySelector('.price').textContent;
        const price = this.extractPrice(priceText);
        const image = menuItem.querySelector('img').src;

        // Check if item already exists in cart
        const existingItem = this.cart.find(item => item.title === title);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                title,
                description,
                price,
                priceText,
                image,
                quantity: 1
            });
        }

        this.updateCartDisplay();
        this.animateAddToCart(event.target);
        this.showNotification(`${title} به سبد خرید اضافه شد`);
    }

    extractPrice(priceText) {
        // Extract numeric value from Persian price text
        const numbers = priceText.match(/[\d,]+/);
        if (numbers) {
            return parseInt(numbers[0].replace(/,/g, ''));
        }
        return 0;
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');

        // Update cart count
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

        // Update cart total
        this.cartTotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = this.formatPrice(this.cartTotal);

        // Update cart items
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>سبد خرید شما خالی است</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item" data-title="${item.title}">
                    <div class="cart-item-info">
                        <h4>${item.title}</h4>
                        <p>${item.priceText}</p>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="menu.updateQuantity('${item.title}', -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="menu.updateQuantity('${item.title}', 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-btn" onclick="menu.removeFromCart('${item.title}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Update checkout button state
        const checkoutBtn = document.getElementById('checkoutBtn');
        checkoutBtn.disabled = this.cart.length === 0;
    }

    updateQuantity(title, change) {
        const item = this.cart.find(item => item.title === title);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                this.removeFromCart(title);
            } else {
                this.updateCartDisplay();
            }
        }
    }

    removeFromCart(title) {
        this.cart = this.cart.filter(item => item.title !== title);
        this.updateCartDisplay();
        this.showNotification(`${title} از سبد خرید حذف شد`);
    }

    toggleCart() {
        const cartPanel = document.getElementById('cartPanel');
        cartPanel.classList.toggle('active');
    }

    closeCart() {
        const cartPanel = document.getElementById('cartPanel');
        cartPanel.classList.remove('active');
    }

    checkout() {
        if (this.cart.length === 0) return;

        const orderSummary = this.cart.map(item => 
            `${item.title} × ${item.quantity} = ${this.formatPrice(item.price * item.quantity)}`
        ).join('\n');

        const message = `سفارش شما:\n\n${orderSummary}\n\nمجموع: ${this.formatPrice(this.cartTotal)}\n\nآیا تایید می‌کنید؟`;

        if (confirm(message)) {
            this.showNotification('سفارش شما با موفقیت ثبت شد!');
            this.cart = [];
            this.updateCartDisplay();
            this.closeCart();
        }
    }

    formatPrice(price) {
        return price.toLocaleString('fa-IR') + ' تومان';
    }

    animateAddToCart(button) {
        button.style.transform = 'scale(1.2) rotate(180deg)';
        setTimeout(() => {
            button.style.transform = '';
        }, 300);
    }

    animateMenuItems(container = document) {
        const menuItems = container.querySelectorAll('.menu-item');
        menuItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate');
        });
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: linear-gradient(135deg, #00b894, #00a085);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 184, 148, 0.3);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 500;
            z-index: 2000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.menu = new DigitalMenu();
});

// Add smooth scrolling for category navigation
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        if (category !== 'all') {
            const targetSection = document.querySelector(`[data-category="${category}"]`);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'S' to focus search
    if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Press 'C' to toggle cart
    if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        window.menu.toggleCart();
    }
    
    // Press Escape to close cart
    if (e.key === 'Escape') {
        window.menu.closeCart();
    }
});

// Add touch gestures for mobile
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;
    
    // Swipe up to open cart (on mobile)
    if (diff > 50 && window.innerWidth <= 768) {
        window.menu.toggleCart();
    }
});

// Add price range filter (bonus feature)
function addPriceFilter() {
    const priceRanges = [
        { min: 0, max: 50000, label: 'زیر ۵۰ هزار تومان' },
        { min: 50000, max: 100000, label: '۵۰ تا ۱۰۰ هزار تومان' },
        { min: 100000, max: 200000, label: '۱۰۰ تا ۲۰۰ هزار تومان' },
        { min: 200000, max: Infinity, label: 'بالای ۲۰۰ هزار تومان' }
    ];

    // This can be implemented later if needed
}

// Add favorites functionality
function toggleFavorite(element) {
    element.classList.toggle('favorite');
    const icon = element.querySelector('i');
    if (element.classList.contains('favorite')) {
        icon.className = 'fas fa-heart';
        icon.style.color = '#ff6b6b';
    } else {
        icon.className = 'far fa-heart';
        icon.style.color = '';
    }
}