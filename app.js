// Global State
let menuData = null;
let currentCategory = 'all';
let searchQuery = '';

// DOM Elements
const categoryContainer = document.getElementById('category-container');
const menuContainer = document.getElementById('menu-container');
const restaurantNameEl = document.getElementById('restaurant-name');
const searchInput = document.getElementById('search-input');
const noResultsEl = document.getElementById('no-results');
const themeToggleBtn = document.getElementById('theme-toggle');

// Modal Elements
const modal = document.getElementById('product-modal');
const modalPanel = document.getElementById('modal-panel');
const modalContentContainer = document.getElementById('modal-content-container');
const closeModalBtn = document.getElementById('close-modal');
const modalBackdrop = document.getElementById('modal-backdrop');

// Format Currency
const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    document.getElementById('current-year').textContent = new Date().getFullYear();
    fetchData();
    setupEventListeners();
});

// Fetch Data
async function fetchData() {
    try {
        // Simulating network request for data.json
        const response = await fetch('data.json');
        menuData = await response.json();
        
        // Remove skeletons
        document.querySelectorAll('.menu-skeleton').forEach(el => el.remove());
        
        renderHeader();
        renderCategories();
        renderMenu();
    } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
        menuContainer.innerHTML = '<div class="col-span-full text-center py-10 text-red-500">Menü yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyin.</div>';
    }
}

// Render Header
function renderHeader() {
    restaurantNameEl.textContent = menuData.restaurantName;
    document.title = `${menuData.restaurantName} - QR Menü`;
}

// Render Categories
function renderCategories() {
    categoryContainer.innerHTML = '';
    
    // Add "All" category
    const allBtn = createCategoryButton({ id: 'all', name: 'Tümü', icon: 'fa-solid fa-layer-group' });
    categoryContainer.appendChild(allBtn);
    setActiveCategory('all');

    menuData.categories.forEach(category => {
        const btn = createCategoryButton(category);
        categoryContainer.appendChild(btn);
    });
}

function createCategoryButton(category) {
    const btn = document.createElement('button');
    btn.className = `category-btn flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 snap-center
        ${currentCategory === category.id 
            ? 'bg-brand-500 text-white shadow-md active' 
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`;
    btn.dataset.id = category.id;
    
    btn.innerHTML = `<i class="${category.icon}"></i> <span>${category.name}</span>`;
    
    btn.addEventListener('click', () => {
        currentCategory = category.id;
        updateCategoryButtons();
        renderMenu();
        // Scroll slightly to make sure filtered items trigger animation
        window.scrollBy({ top: 1, behavior: 'instant' }); 
        window.scrollBy({ top: -1, behavior: 'auto' });
    });
    
    return btn;
}

function updateCategoryButtons() {
    const buttons = categoryContainer.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        if (btn.dataset.id === currentCategory) {
            btn.className = `category-btn active flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 snap-center bg-brand-500 text-white shadow-md`;
        } else {
            btn.className = `category-btn flex items-center space-x-2 px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 snap-center bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700`;
        }
    });
}

function setActiveCategory(id) {
    currentCategory = id;
    updateCategoryButtons();
}

// Render Menu Items
function renderMenu() {
    menuContainer.innerHTML = '';
    let filteredItems = menuData.items;

    // Filter by category
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => item.categoryId === currentCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
        );
    }

    if (filteredItems.length === 0) {
        noResultsEl.classList.remove('hidden');
        noResultsEl.classList.add('flex');
    } else {
        noResultsEl.classList.add('hidden');
        noResultsEl.classList.remove('flex');
        
        filteredItems.forEach((item, index) => {
            const card = createMenuCard(item, index);
            menuContainer.appendChild(card);
        });
    }
}

function createMenuCard(item, index) {
    const card = document.createElement('div');
    // Compute animation delay for staggered entrance
    const delay = (index % 10) * 0.05;
    
    card.className = `menu-card group bg-white dark:bg-dark-card rounded-[2rem] p-3 shadow-sm border border-gray-100 dark:border-dark-border cursor-pointer flex flex-col h-full animate-slide-up select-none`;
    card.style.animationDelay = `${delay}s`;
    
    // Fallback image if none provided
    const imageUrl = item.image || 'https://via.placeholder.com/600x400/eeeeee/aaaaaa?text=Resim+Yok';
    
    let tagsHtml = '';
    if (item.tags && item.tags.length > 0) {
        tagsHtml = `<div class="absolute top-3 left-3 flex flex-wrap gap-1 z-10">
            ${item.tags.map(tag => `<span class="px-2.5 py-1 text-xs font-bold bg-white/90 dark:bg-black/80 backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-full shadow-sm">${tag}</span>`).join('')}
        </div>`;
    }
    
    card.innerHTML = `
        <div class="relative w-full h-48 mb-4 rounded-2xl menu-card-img-wrapper z-0 bg-gray-100 dark:bg-gray-800">
            ${tagsHtml}
            <img src="${imageUrl}" alt="${item.name}" loading="lazy" class="w-full h-full object-cover rounded-2xl absolute inset-0 transition-opacity duration-300" onload="this.classList.add('loaded')">
            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div class="px-2 flex-grow flex flex-col">
            <div class="flex justify-between items-start mb-2 gap-2">
                <h3 class="text-lg font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">${item.name}</h3>
                <span class="text-brand-500 dark:text-brand-400 font-extrabold text-lg whitespace-nowrap">${formatPrice(item.price)}</span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">${item.description}</p>
            <div class="mt-auto pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center text-xs font-medium text-brand-500 dark:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity transition-transform transform translate-y-2 group-hover:translate-y-0 duration-300">
                Detayları Gör <i class="fa-solid fa-arrow-right ml-1"></i>
            </div>
        </div>
    `;

    // Click event to open modal
    card.addEventListener('click', () => openModal(item));

    return card;
}

// Modal Logic
function openModal(item) {
    // Populate Data
    const imageUrl = item.image || 'https://via.placeholder.com/800x600/eeeeee/aaaaaa?text=Resim+Yok';
    
    let tagsHtml = '';
    if (item.tags && item.tags.length > 0) {
        tagsHtml = `<div class="flex flex-wrap gap-2 mb-4">
            ${item.tags.map(tag => `<span class="px-3 py-1 text-xs font-bold bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full">${tag}</span>`).join('')}
        </div>`;
    }

    modalContentContainer.innerHTML = `
        <div class="w-full h-64 sm:h-72 relative bg-gray-100 dark:bg-gray-800">
            <img src="${imageUrl}" alt="${item.name}" class="w-full h-full object-cover">
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
            <h2 class="absolute bottom-4 left-6 right-6 text-2xl sm:text-3xl font-extrabold text-white drop-shadow-md">${item.name}</h2>
        </div>
        <div class="p-6">
            ${tagsHtml}
            <div class="flex justify-between items-center mb-6">
                <span class="text-3xl font-extrabold text-brand-500">${formatPrice(item.price)}</span>
                <button class="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 transition-all">
                    <i class="fa-regular fa-heart text-xl"></i>
                </button>
            </div>
            <h4 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">İçindekiler / Detay</h4>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed text-base">${item.description}</p>
        </div>
    `;

    // Show Modal
    modal.classList.remove('pointer-events-none');
    
    // Animate In
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0');
        modalPanel.classList.remove('translate-y-full', 'sm:translate-y-4', 'sm:scale-95');
        document.body.classList.add('modal-open');
    });
}

function closeModal() {
    // Animate Out
    modal.classList.add('opacity-0');
    modalPanel.classList.add('translate-y-full', 'sm:translate-y-4', 'sm:scale-95');
    document.body.classList.remove('modal-open');

    // Hide after animation (300ms)
    setTimeout(() => {
        modal.classList.add('pointer-events-none');
        modalContentContainer.innerHTML = '';
    }, 300);
}

// Event Listeners setup
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderMenu();
    });

    // Theme Toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Modal Close
    closeModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // Prevent clicks inside modal from closing it
    modalPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Mobile swipe down to close modal (simple implementation)
    let startY = 0;
    const modalHandle = document.getElementById('modal-handle');
    
    modalHandle.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    }, {passive: true});

    modalHandle.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        if (diffY > 50) { // threshold
            closeModal();
        }
    }, {passive: true});
}

// Theme Handlers
function initTheme() {
    // Check local storage or system preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}
