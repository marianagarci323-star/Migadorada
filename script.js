/* ==========================================================================
   LÓGICA JAVASCRIPT - PANADERÍA MIGA DORADA
   Módulos: Modo Oscuro, Menú Móvil, Filtro, Calculadora y Validación
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // -----------------------------------------------------------------------
  // 1. MODO OSCURO (DARK MODE) CON ALMACENAMIENTO EN LOCALSTORAGE
  // -----------------------------------------------------------------------
  const themeToggleBtn = document.getElementById('themeToggle');
  const htmlTag = document.documentElement;
  const themeIcon = themeToggleBtn.querySelector('i');

  // Cargar preferencia guardada previamente
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlTag.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlTag.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    htmlTag.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });

  function updateThemeIcon(theme) {
    if (theme === 'dark') {
      themeIcon.className = 'fa-solid fa-sun';
      themeToggleBtn.style.color = '#f59e0b';
    } else {
      themeIcon.className = 'fa-solid fa-moon';
      themeToggleBtn.style.color = 'inherit';
    }
  }

  // -----------------------------------------------------------------------
  // 2. MENÚ NAVEGACIÓN HAMBURGUESA PARA MÓVILES
  // -----------------------------------------------------------------------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isExpanded = navMenu.classList.contains('active');
    hamburgerBtn.querySelector('i').className = isExpanded ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });

  // Cerrar menú móvil al hacer clic en un enlace de navegación
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburgerBtn.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  // Highlight activo según desplazamiento (Scroll Active Link)
  window.addEventListener('scroll', () => {
    let currentSection = '';
    const sections = document.querySelectorAll('section');

    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  // -----------------------------------------------------------------------
  // 3. FILTRO DINÁMICO DEL PORTAFOLIO DE PRODUCTOS
  // -----------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover clase 'active' de todos los botones y asignarla al seleccionado
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          card.style.animation = 'fadeInUp 0.5s ease forward';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // -----------------------------------------------------------------------
  // 4. CALCULADORA DINÁMICA DE SIMULACIÓN DE PEDIDO Y WHATSAPP
  // -----------------------------------------------------------------------
  let orderItems = [];
  const addButtons = document.querySelectorAll('.add-to-calc-btn');
  const calcItemsList = document.getElementById('calcItemsList');
  const calcSubtotal = document.getElementById('calcSubtotal');
  const calcTotal = document.getElementById('calcTotal');
  const calcOptionSelect = document.getElementById('calcOption');
  const sendWhatsappBtn = document.getElementById('sendWhatsappBtn');

  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const name = e.target.closest('.add-to-calc-btn').getAttribute('data-name');
      const price = parseFloat(e.target.closest('.add-to-calc-btn').getAttribute('data-price'));

      // Verificar si ya existe en la lista
      const existingItem = orderItems.find(item => item.name === name);
      if (existingItem) {
        existingItem.qty += 1;
      } else {
        orderItems.push({ name, price, qty: 1 });
      }

      updateCalculatorUI();
    });
  });

  calcOptionSelect.addEventListener('change', updateCalculatorUI);

  function updateCalculatorUI() {
    calcItemsList.innerHTML = '';

    if (orderItems.length === 0) {
      calcItemsList.innerHTML = '<p class="empty-msg">No has agregado productos aún. Haz clic en "+ Cotizar".</p>';
      calcSubtotal.textContent = '$0.00';
      calcTotal.textContent = '$0.00';
      sendWhatsappBtn.disabled = true;
      return;
    }

    let subtotal = 0;

    orderItems.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      subtotal += itemTotal;

      const itemRow = document.createElement('div');
      itemRow.className = 'calc-item';
      itemRow.innerHTML = `
        <div>
          <strong>${item.name}</strong> (x${item.qty})
        </div>
        <div>
          <span>$${itemTotal.toFixed(2)}</span>
          <button class="remove-item-btn" onclick="removeItem(${index})"><i class="fa-solid fa-trash"></i></button>
        </div>
      `;
      calcItemsList.appendChild(itemRow);
    });

    const extraFee = parseFloat(calcOptionSelect.value);
    const grandTotal = subtotal + extraFee;

    calcSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    calcTotal.textContent = `$${grandTotal.toFixed(2)}`;
    sendWhatsappBtn.disabled = false;
  }

  // Función global para remover ítems de la cotización
  window.removeItem = function(index) {
    orderItems.splice(index, 1);
    updateCalculatorUI();
  };

  // Generar mensaje formateado para enviar a WhatsApp
  sendWhatsappBtn.addEventListener('click', () => {
    if (orderItems.length === 0) return;

    let message = '¡Hola Miga Dorada! Quisiera realizar la siguiente cotización/pedido:\n\n';
    orderItems.forEach(item => {
      message += `• ${item.name} x${item.qty} - $${(item.price * item.qty).toFixed(2)}\n`;
    });

    const optionText = calcOptionSelect.options[calcOptionSelect.selectedIndex].text;
    message += `\nOpción de entrega: ${optionText}`;
    message += `\nTotal Estimado: ${calcTotal.textContent}\n\n¿Tienen disponibilidad para hoy?`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/34600123456?text=${encodedMsg}`, '_blank');
  });

  // -----------------------------------------------------------------------
  // 5. VALIDACIÓN DEL FORMULARIO DE CONTACTO
  // -----------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const nombreInput = document.getElementById('nombre');
  const emailInput = document.getElementById('email');
  const mensajeInput = document.getElementById('mensaje');
  const formFeedback = document.getElementById('formFeedback');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validar Nombre
    if (nombreInput.value.trim().length < 3) {
      setError(nombreInput, 'errorNombre');
      isValid = false;
    } else {
      removeError(nombreInput, 'errorNombre');
    }

    // Validar Email con expresión regular
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      setError(emailInput, 'errorEmail');
      isValid = false;
    } else {
      removeError(emailInput, 'errorEmail');
    }

    // Validar Mensaje
    if (mensajeInput.value.trim() === '') {
      setError(mensajeInput, 'errorMensaje');
      isValid = false;
    } else {
      removeError(mensajeInput, 'errorMensaje');
    }

    // Si la validación es exitosa
    if (isValid) {
      formFeedback.className = 'form-feedback success';
      formFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Gracias por tu mensaje! Te responderemos muy pronto.';
      contactForm.reset();

      setTimeout(() => {
        formFeedback.classList.add('hidden');
      }, 5000);
    }
  });

  function setError(inputElement, errorId) {
    inputElement.parentElement.classList.add('error');
  }

  function removeError(inputElement, errorId) {
    inputElement.parentElement.classList.remove('error');
  }
});