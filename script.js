// --- Мова ---
let lang = localStorage.getItem('lang') || 'ua';

function setLang(l){
  lang = l;
  localStorage.setItem('lang', l);
  document.querySelectorAll('[data-key]').forEach(el=>{
    const key = el.getAttribute('data-key');
    if(translations[lang][key]) el.textContent = translations[lang][key];
  });
  updateCart();
}

// --- Оновлення кошика ---
function updateCart(){
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart");
  const modalContainer = document.getElementById("modalCartItems");
  container.innerHTML = "";
  modalContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, idx)=>{
    // --- Картка товару на сторінці ---
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="images/${item.img}" alt="${item.name}" style="width:90px;height:90px;object-fit:cover;margin-right:15px;">
      <div class="cart-item-details">
        <p>${item.name}</p>
        <p>Колір: ${item.color || "—"}, Розмір: ${item.size || "—"}</p>
        <p>${item.price} ₴</p>
      </div>
      <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" onchange="changeQuantity(${idx}, this.value)">
      <button class="delete-btn" onclick="removeItem(${idx})">Видалити</button>
    `;
    container.appendChild(div);

    // --- Модальне вікно ---
    const modalDiv = document.createElement("div");
    modalDiv.className = "modal-cart-item";
    modalDiv.innerHTML = `
      <img src="images/${item.img}" alt="${item.name}" style="width:50px;height:50px;object-fit:cover;margin-right:10px;">
      <span>${item.name} (${item.color || '—'}, ${item.size || '—'}) — ${item.price} ₴</span>
    `;
    modalContainer.appendChild(modalDiv);

    total += (parseFloat(item.price.replace(/[^0-9.]/g,'')) || 0) * (parseInt(item.quantity) || 1);
  });

  const totalDiv = document.getElementById("total");
  if(totalDiv) totalDiv.textContent = `Сума: ${total} ₴`;

  // Кнопка оформлення
  const checkoutBtn = document.getElementById("checkoutBtn");
  if(checkoutBtn) checkoutBtn.disabled = cart.length === 0;
}

// --- Зміна кількості ---
function changeQuantity(index, value){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity = parseInt(value) || 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

// --- Видалення товару ---
function removeItem(index){
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index,1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

// --- Навігація ---
// Кнопка "Назад" тепер працює завжди
document.getElementById("backBtn")?.addEventListener('click', ()=>{
    const prevPage = sessionStorage.getItem('previousPage') || 'index.html'; 'cap1.html';'cap2.html';
    window.location.href = prevPage;
});
document.getElementById("homeBtn")?.addEventListener('click', ()=>{ window.location.href="index.html"; });

// --- Модальне вікно ---
document.getElementById("checkoutBtn")?.addEventListener('click', ()=>{
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if(cart.length === 0){ 
    alert(translations[lang].emptyCart); 
    return; 
  }

  let total = cart.reduce((sum, item) => sum + (parseFloat(item.price.replace(/[^0-9.]/g,'')) || 0) * (parseInt(item.quantity) || 1), 0);

  const modalTotal = document.getElementById("modalCartSummary");
  if(modalTotal) modalTotal.textContent = `Сума: ${total} ₴`;

  const modal = document.getElementById("checkoutModal");
  if(modal) modal.style.display = "flex";
});

// Закриття модалки
document.getElementById("closeModal")?.addEventListener('click', ()=>{
  const modal = document.getElementById("checkoutModal");
  if(modal) modal.style.display = "none";
});

// --- Відправка замовлення ---
document.getElementById("sendBtn")?.addEventListener('click', ()=>{
  const firstName = document.getElementById("clientFirstName")?.value.trim() || '';
  const lastName = document.getElementById("clientLastName")?.value.trim() || '';
  const phone = document.getElementById("clientPhone")?.value.trim() || '';
  const username = document.getElementById("clientUsername")?.value.trim() || '';

  if(!firstName || !lastName || !phone){
    alert(translations[lang].fillAll);
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  fetch('admin.php', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({firstName, lastName, phone, username, cart})
  }).then(res=>{
    if(res.ok){
      alert(translations[lang].orderSuccess);
      localStorage.removeItem("cart");
      const modal = document.getElementById("checkoutModal");
      if(modal) modal.style.display = "none";
      updateCart();
    } else {
      alert("Помилка при відправці замовлення");
    }
  }).catch(err=>{
    console.error(err);
    alert("Помилка при відправці замовлення");
  });
});

// --- Ініціалізація ---
updateCart();
setLang(lang);
