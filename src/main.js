import './style.css'

// Initial State for Configurator
const configState = {
  model: 'taycan',
  basePrice: 150000,
  headlights: false,
  spoiler: false,
  spoilerPrice: 4500,
  sound: false,
  soundPrice: 2500,
  totalPrice: 150000
};

// Initial State for Shopping Cart
let cart = [];

// Initialize Animations
const observerOptions = {
  threshold: 0.1
};

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, observerOptions);

// Header Scroll Effect
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Smooth Scroll for Nav Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
});

// Parallax Effect for Hero
window.addEventListener('scroll', () => {
  const heroBg = document.querySelector('.hero-bg');
  const scrollValue = window.scrollY;
  if (heroBg) {
    heroBg.style.transform = `scale(${1 + scrollValue * 0.0005}) translateY(${scrollValue * 0.2}px)`;
  }
});

// Initialize elements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Reveal animations
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(el => revealObserver.observe(el));

  // Initialize Configurator preview color
  updateConfiguratorColor('#D5001C');
  calculateConfigPrice();

  // Bind Event Listeners
  initMobileNav();
  initConfigurator();
  initCartAndShop();
  initModals();
  initCreditCardVisuals();
});

// Mobile Navigation Toggle
function initMobileNav() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const links = document.querySelectorAll('.nav-links a');

  // Create a backdrop overlay for closing menu by outside click
  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  function openMenu() {
    toggleBtn.classList.add('active');
    navLinks.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    toggleBtn.classList.remove('active');
    navLinks.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      if (toggleBtn.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    links.forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });

    backdrop.addEventListener('click', () => closeMenu());
  }
}

// --- PORSCHE CONFIGURATOR LOGIC ---

function initConfigurator() {
  const modelBtns = document.querySelectorAll('.model-btn');
  const toggleHeadlights = document.getElementById('toggle-headlights');
  const toggleSpoiler = document.getElementById('toggle-spoiler');
  const toggleSound = document.getElementById('toggle-sound');
  const carImage = document.getElementById('custom-car-image');

  // Model Selection
  modelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      configState.model = btn.dataset.model;
      configState.basePrice = parseFloat(btn.dataset.basePrice);

      document.getElementById('spec-accel').innerText = btn.dataset.accel;
      document.getElementById('spec-speed').innerText = btn.dataset.speed;
      document.getElementById('spec-power').innerText = btn.dataset.power;

      carImage.style.opacity = '0';
      setTimeout(() => {
        carImage.src = btn.dataset.img;
        carImage.style.opacity = '1';
      }, 300);

      calculateConfigPrice();
    });
  });

  // Addon Cards - Headlights DRL (UI toggle only, no image overlay)
  const addonHeadlightsLabel = document.getElementById('addon-headlights-label');
  if (toggleHeadlights) {
    toggleHeadlights.addEventListener('change', (e) => {
      configState.headlights = e.target.checked;
      const drlBars = document.querySelectorAll('.drl-bar');

      if (configState.headlights) {
        addonHeadlightsLabel && addonHeadlightsLabel.classList.add('addon-active');
        drlBars.forEach(bar => bar.classList.add('drl-on'));
      } else {
        addonHeadlightsLabel && addonHeadlightsLabel.classList.remove('addon-active');
        drlBars.forEach(bar => bar.classList.remove('drl-on'));
      }
    });
  }

  // Addon Cards - Spoiler (UI toggle only, no image overlay)
  const addonSpoilerLabel = document.getElementById('addon-spoiler-label');
  if (toggleSpoiler) {
    toggleSpoiler.addEventListener('change', (e) => {
      configState.spoiler = e.target.checked;
      if (configState.spoiler) {
        addonSpoilerLabel && addonSpoilerLabel.classList.add('addon-active');
      } else {
        addonSpoilerLabel && addonSpoilerLabel.classList.remove('addon-active');
      }
      calculateConfigPrice();
    });
  }

  // Addon Cards - Sound
  const addonSoundLabel = document.getElementById('addon-sound-label');
  if (toggleSound) {
    toggleSound.addEventListener('change', (e) => {
      configState.sound = e.target.checked;
      if (configState.sound) {
        addonSoundLabel && addonSoundLabel.classList.add('addon-active');
      } else {
        addonSoundLabel && addonSoundLabel.classList.remove('addon-active');
      }
      calculateConfigPrice();
    });
  }
}

// Configurator Helpers
function updateConfiguratorColor(hex) {
  document.documentElement.style.setProperty('--car-tint-color', hex);
  const customAura = document.querySelector('.car-glowing-auras');
  if (customAura) {
    customAura.style.background = `radial-gradient(circle, ${hex}55 0%, transparent 70%)`;
  }
}



function calculateConfigPrice() {
  let total = configState.basePrice;
  if (configState.spoiler) total += configState.spoilerPrice;
  if (configState.sound) total += configState.soundPrice;
  configState.totalPrice = total;

  document.getElementById('config-total-price').innerText = `$${total.toLocaleString()}`;
}

// --- BOUTIQUE AND SHOPPING CART LOGIC ---
function initCartAndShop() {
  // Elements
  const cartDrawer = document.getElementById('cart-drawer');
  const floatingCartBtn = document.getElementById('floating-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const checkoutBtn = document.getElementById('checkout-btn');
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

  // Open/Close Cart Left Drawer
  floatingCartBtn.addEventListener('click', () => {
    cartDrawer.classList.add('open');
  });

  closeCartBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
  });

  // Close when clicking overlay
  cartDrawer.addEventListener('click', (e) => {
    if (e.target === cartDrawer) {
      cartDrawer.classList.remove('open');
    }
  });

  // Add items from cards
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.shop-card');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const img = card.dataset.img;

      addItemToCart(id, name, price, img);

      // Open cart drawer immediately for premium UX feedback
      cartDrawer.classList.add('open');

      // Visual button feedback
      const originalText = btn.innerText;
      btn.innerText = 'تمت الإضافة ✓';
      btn.classList.add('success-state');
      setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove('success-state');
      }, 1500);
    });
  });

  // Checkout trigger
  checkoutBtn.addEventListener('click', () => {
    cartDrawer.classList.remove('open');
    openCheckoutModal();
  });
}

function addItemToCart(id, name, price, img) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, name, price, img, quantity: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const cartContainer = document.getElementById('cart-items-container');
  const cartCountEl = document.getElementById('cart-count');
  const cartFloatBadge = document.getElementById('cart-floating-badge');
  const subtotalEl = document.getElementById('cart-subtotal');
  const checkoutBtn = document.getElementById('checkout-btn');

  // Clear container
  cartContainer.innerHTML = '';

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart-message">
        <p>سلتك فارغة حالياً. تصفح سلع بوتيك بورش الرائعة وأضف لطلبك.</p>
      </div>
    `;
    cartCountEl.innerText = '0';
    cartFloatBadge.innerText = '0';
    subtotalEl.innerText = '$0';
    checkoutBtn.disabled = true;
    return;
  }

  let totalQty = 0;
  let subtotal = 0;

  cart.forEach(item => {
    totalQty += item.quantity;
    subtotal += item.price * item.quantity;

    // Build item DOM
    const itemRow = document.createElement('div');
    itemRow.className = 'cart-item-row';
    itemRow.innerHTML = `
      <div class="cart-item-preview glass">
        <!-- Render CSS mockup shape or icon fallback -->
        <span class="preview-mini-icon">🛍️</span>
      </div>
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <span class="cart-item-price">$${(item.price * item.quantity).toLocaleString()}</span>
        <div class="qty-control">
          <button class="qty-btn minus-qty" data-id="${item.id}">-</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn plus-qty" data-id="${item.id}">+</button>
        </div>
      </div>
      <button class="remove-item-btn" data-id="${item.id}">&times;</button>
    `;
    cartContainer.appendChild(itemRow);
  });

  cartCountEl.innerText = totalQty;
  cartFloatBadge.innerText = totalQty;
  subtotalEl.innerText = `$${subtotal.toLocaleString()}`;
  checkoutBtn.disabled = false;

  // Re-bind quantity buttons
  document.querySelectorAll('.minus-qty').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const item = cart.find(x => x.id === id);
      if (item.quantity > 1) {
        item.quantity -= 1;
      } else {
        cart = cart.filter(x => x.id !== id);
      }
      updateCartUI();
    });
  });

  document.querySelectorAll('.plus-qty').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      const item = cart.find(x => x.id === id);
      item.quantity += 1;
      updateCartUI();
    });
  });

  document.querySelectorAll('.remove-item-btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const id = e.target.dataset.id;
      cart = cart.filter(x => x.id !== id);
      updateCartUI();
    });
  });
}

// --- MODALS OPEN/CLOSE AND SUBMISSIONS ---
function initModals() {
  const testDriveBtn = document.getElementById('book-test-drive-btn');
  const testDriveModal = document.getElementById('testdrive-modal');
  const closeTestdriveBtn = document.getElementById('close-testdrive-btn');
  const testDriveForm = document.getElementById('testdrive-form');

  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutBtn = document.getElementById('close-checkout-btn');
  const payForm = document.getElementById('pay-form');

  const successModal = document.getElementById('success-modal');
  const closeSuccessBtn = document.getElementById('close-success-btn');
  const successDoneBtn = document.getElementById('success-done-btn');

  // Test Drive Modal Trigger
  if (testDriveBtn) {
    testDriveBtn.addEventListener('click', () => {
      testDriveModal.classList.add('open');
      // Set chosen model title
      let modelTitle = 'بورش تايكان الكهربائية';
      if (configState.model === 'cayenne') modelTitle = 'بورش كايين الفاخرة';
      if (configState.model === '911') modelTitle = 'بورش 911 GT3 RS الأسطورية';

      const spoilerDesc = configState.spoiler ? ' + مع الجناح الكربوني' : '';
      document.getElementById('td-model-selected').value = `${modelTitle}${spoilerDesc}`;
    });
  }

  closeTestdriveBtn.addEventListener('click', () => {
    testDriveModal.classList.remove('open');
  });

  // Checkout close
  closeCheckoutBtn.addEventListener('click', () => {
    checkoutModal.classList.remove('open');
  });

  // Success closed
  closeSuccessBtn.addEventListener('click', () => {
    successModal.classList.remove('open');
  });
  successDoneBtn.addEventListener('click', () => {
    successModal.classList.remove('open');
  });

  // Close modals when clicking overlay
  const modals = [testDriveModal, checkoutModal, successModal];
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // Test Drive Form Submission
  testDriveForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal = document.getElementById('td-name').value;
    const phoneVal = document.getElementById('td-phone').value;
    const dateVal = document.getElementById('td-date').value;
    const timeVal = document.getElementById('td-time').value;
    const showroomVal = document.getElementById('td-showroom').value;
    const carVal = document.getElementById('td-model-selected').value;

    const refCode = 'PR-' + Math.floor(10000 + Math.random() * 90000);

    // Populate ticket info
    document.getElementById('t-ref').innerText = refCode;
    document.getElementById('t-name').innerText = nameVal;
    document.getElementById('t-car').innerText = carVal;
    document.getElementById('t-branch').innerText = showroomVal;
    document.getElementById('t-datetime').innerText = `${dateVal} في ${timeVal}`;

    // Update success title & content
    document.getElementById('success-title').innerText = 'تم حجز تجربة القيادة الفخمة!';
    document.getElementById('success-message').innerText = 'لقد قمنا بحجز موعد تجربة بورش القيادية الخاصة بك وتأكيد البيانات. يرجى إحضار تذكرة الحجز الموضحة أدناه عند زيارتنا.';
    document.getElementById('ticket-container').classList.remove('hide');

    // Close form modal, open success modal
    testDriveModal.classList.remove('open');
    successModal.classList.add('open');

    // Reset Form
    testDriveForm.reset();
  });

  // Checkout Payment Form Submission
  payForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameVal = document.getElementById('ship-name').value;
    const totalSpent = document.getElementById('checkout-total-price').innerText;

    // Update success title & content
    document.getElementById('success-title').innerText = 'شكراً لك، تم إرسال طلبك!';
    document.getElementById('success-message').innerText = `أهلاً بك يا ${nameVal}، لقد تم إتمام معاملتكم بنجاح بمجموع ${totalSpent}. سنقوم بالتواصل معك لتنسيق تسليم مقتنياتك الفخمة من بوتيك بورش اليمن في أقرب فرصة.`;
    document.getElementById('ticket-container').classList.add('hide');

    // Close form modal, open success modal
    checkoutModal.classList.remove('open');
    successModal.classList.add('open');

    // Empty Cart
    cart = [];
    updateCartUI();
    payForm.reset();
  });

  // Toggle Payment Methods (Card vs cash/cod)
  const isCardRadio = document.getElementsByName('payment-method');
  const cardFields = document.getElementById('credit-card-fields');
  const tabCard = document.getElementById('tab-card');
  const tabCod = document.getElementById('tab-cod');

  isCardRadio.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'card') {
        cardFields.style.display = 'block';
        tabCard.classList.add('active');
        tabCod.classList.remove('active');
        document.getElementById('pay-submit-btn').innerText = `تأكيد الطلب ودفع ${document.getElementById('checkout-total-price').innerText}`;
      } else {
        cardFields.style.display = 'none';
        tabCard.classList.remove('active');
        tabCod.classList.add('active');
        document.getElementById('pay-submit-btn').innerText = `تأكيد الطلب والدفع عند الاستلام`;
      }
    });
  });
}

function openCheckoutModal() {
  const checkoutModal = document.getElementById('checkout-modal');
  checkoutModal.classList.add('open');

  let subtotal = 0;
  const itemsContainer = document.getElementById('checkout-items-list');
  itemsContainer.innerHTML = '';

  cart.forEach(item => {
    subtotal += item.price * item.quantity;

    // Add to modal list view
    const row = document.createElement('div');
    row.className = 'summary-item-row';
    row.innerHTML = `
      <span>${item.name} (x${item.quantity})</span>
      <span>$${(item.price * item.quantity).toLocaleString()}</span>
    `;
    itemsContainer.appendChild(row);
  });

  const displayTotal = `$${subtotal.toLocaleString()}`;
  document.getElementById('checkout-total-price').innerText = displayTotal;

  const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
  if (paymentMethod === 'card') {
    document.getElementById('pay-submit-btn').innerText = `تأكيد الطلب ودفع ${displayTotal}`;
  } else {
    document.getElementById('pay-submit-btn').innerText = `تأكيد الطلب والدفع عند الاستلام`;
  }
}

// --- INTERACTIVE CREDIT CARD VISUALS LOGIC ---
function initCreditCardVisuals() {
  const numInput = document.getElementById('card-num');
  const nameInput = document.getElementById('ship-name');
  const expInput = document.getElementById('card-expiry');
  const cvvInput = document.getElementById('card-cvv');
  const visualCard = document.getElementById('visual-card');

  const vNum = document.querySelector('.card-num-display');
  const vName = document.querySelector('.card-holder-display');
  const vExp = document.querySelector('.card-expiry-display');
  const vCvv = document.querySelector('.cvv-display');

  // Input Formatting & Binding
  numInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }
    e.target.value = formatted;
    vNum.innerText = formatted.length > 0 ? formatted : '•••• •••• •••• ••••';
  });

  // Name updates
  nameInput.addEventListener('input', (e) => {
    vName.innerText = e.target.value.length > 0 ? e.target.value.toUpperCase() : 'اسم صاحب البطاقة';
  });

  // Expiry MM/YY formatting
  expInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
    vExp.innerText = value.length > 0 ? value : 'MM/YY';
  });

  // CVV binding
  cvvInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    vCvv.innerText = value.length > 0 ? value : '•••';
  });

  // Flip Actions
  cvvInput.addEventListener('focus', () => {
    visualCard.classList.add('flipped');
  });

  cvvInput.addEventListener('blur', () => {
    visualCard.classList.remove('flipped');
  });
}

// For HMR support in development
if (import.meta.hot) {
  import.meta.hot.accept();
}

// For HMR support in development
if (import.meta.hot) {
  import.meta.hot.accept();
}

