let shop = { categories: [], products: [], liveGoldPriceToman: 0 };
let editingProductId = null;
let draftImages = [];

const messageEl = document.getElementById("panel-message");
const adminUserEl = document.getElementById("admin-user");
const goldForm = document.getElementById("gold-form");
const productForm = document.getElementById("product-form");
const categorySelect = document.getElementById("category");
const productsTableBody = document.getElementById("products-table-body");
const imageUploadInput = document.getElementById("image-upload");
const imagePreviewList = document.getElementById("image-preview-list");
const productFormTitle = document.getElementById("product-form-title");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const logoutBtn = document.getElementById("logout-btn");

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `admin-message ${type}`;
  messageEl.hidden = false;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers
    }
  });
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

function renderCategoryOptions() {
  categorySelect.innerHTML = "";
  shop.categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

function renderImagePreviews() {
  imagePreviewList.innerHTML = "";
  draftImages.forEach((url, index) => {
    const wrap = document.createElement("div");
    wrap.style.position = "relative";
    const img = document.createElement("img");
    img.src = url;
    img.alt = `preview ${index + 1}`;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-admin btn-admin-danger";
    removeBtn.textContent = "حذف";
    removeBtn.style.marginTop = "0.25rem";
    removeBtn.addEventListener("click", () => {
      draftImages = draftImages.filter((_, i) => i !== index);
      renderImagePreviews();
    });
    wrap.appendChild(img);
    wrap.appendChild(removeBtn);
    imagePreviewList.appendChild(wrap);
  });
}

function resetProductForm() {
  editingProductId = null;
  draftImages = [];
  productForm.reset();
  document.getElementById("product-id").value = "";
  productFormTitle.textContent = "افزودن محصول جدید";
  cancelEditBtn.classList.add("hidden");
  renderImagePreviews();
}

function fillProductForm(product) {
  editingProductId = product.id;
  document.getElementById("product-id").value = String(product.id);
  document.getElementById("name").value = product.name;
  categorySelect.value = product.category;
  document.getElementById("description").value = product.description;
  document.getElementById("details").value = product.details || "";
  document.getElementById("weightGrams").value = product.weightGrams;
  document.getElementById("feePercent").value = product.feePercent;
  draftImages = product.images?.length ? [...product.images] : product.image ? [product.image] : [];
  productFormTitle.textContent = `ویرایش محصول: ${product.name}`;
  cancelEditBtn.classList.remove("hidden");
  renderImagePreviews();
}

function renderProductsTable() {
  productsTableBody.innerHTML = "";
  shop.products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${product.image}" alt="" /></td>
      <td>${product.name}</td>
      <td>${product.category}</td>
      <td>${product.weightGrams}</td>
      <td>${product.feePercent}%</td>
      <td></td>
    `;
    const actionsCell = row.lastElementChild;
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn-admin btn-admin-secondary";
    editBtn.textContent = "ویرایش";
    editBtn.addEventListener("click", () => fillProductForm(product));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn-admin btn-admin-danger";
    deleteBtn.textContent = "حذف";
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`حذف "${product.name}"؟`)) return;
      await api(`/api/admin/products/${product.id}`, { method: "DELETE" });
      await loadShop();
      showMessage("محصول حذف شد.", "success");
    });

    actionsCell.append(editBtn, deleteBtn);
    productsTableBody.appendChild(row);
  });
}

async function loadShop() {
  shop = await api("/api/admin/shop");
  document.getElementById("liveGoldPriceToman").value = shop.liveGoldPriceToman;
  renderCategoryOptions();
  renderProductsTable();
}

async function ensureAuth() {
  const me = await api("/api/auth/me");
  adminUserEl.textContent = `کاربر: ${me.username}`;
}

goldForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const value = Number(document.getElementById("liveGoldPriceToman").value);
  await api("/api/admin/settings/gold-price", {
    method: "PUT",
    body: JSON.stringify({ liveGoldPriceToman: value })
  });
  await loadShop();
  showMessage("قیمت طلا ذخیره شد.", "success");
});

imageUploadInput.addEventListener("change", async () => {
  const files = Array.from(imageUploadInput.files || []);
  if (!files.length) return;
  for (const file of files) {
    const formData = new FormData();
    formData.append("image", file);
    const result = await api("/api/admin/upload", {
      method: "POST",
      body: formData
    });
    draftImages.push(result.url);
  }
  imageUploadInput.value = "";
  renderImagePreviews();
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    name: document.getElementById("name").value,
    category: categorySelect.value,
    description: document.getElementById("description").value,
    details: document.getElementById("details").value,
    weightGrams: Number(document.getElementById("weightGrams").value),
    feePercent: Number(document.getElementById("feePercent").value),
    images: draftImages,
    image: draftImages[0] || ""
  };

  if (editingProductId) {
    await api(`/api/admin/products/${editingProductId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    showMessage("محصول به‌روزرسانی شد.", "success");
  } else {
    await api("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    showMessage("محصول جدید اضافه شد.", "success");
  }
  resetProductForm();
  await loadShop();
});

cancelEditBtn.addEventListener("click", resetProductForm);

logoutBtn.addEventListener("click", async () => {
  await api("/api/auth/logout", { method: "POST" });
  window.location.href = "/admin/login";
});

async function init() {
  try {
    await ensureAuth();
    await loadShop();
  } catch (err) {
    showMessage(err.message || "خطا در بارگذاری پنل", "error");
  }
}

init();
