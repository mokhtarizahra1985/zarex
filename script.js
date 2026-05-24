let products = [];
let categories = [];
let liveGoldPriceToman = 12000000;

const productsContainer = document.getElementById("products");
const categoryList = document.getElementById("category-list");
const mobileCategoryList = document.getElementById("mobile-category-list");
const mobileCategoryToggle = document.getElementById("mobile-category-toggle");
const mobileCategoryPanel = document.getElementById("mobile-category-panel");
const liveGoldPriceElement = document.getElementById("live-gold-price");
let selectedCategory = "همه";

function getPricePerGram() {
  return liveGoldPriceToman;
}

function getCategoryFromUrl() {
  const url = new URL(window.location.href);
  return url.searchParams.get("category");
}

function formatPrice(value) {
  const tomanValue = Math.round(value);
  return `${new Intl.NumberFormat("fa-IR").format(tomanValue)} تومان`;
}

function calculateBasePrice(product) {
  return product.weightGrams * getPricePerGram();
}

function calculateFeeAmount(product) {
  return calculateBasePrice(product) * (product.feePercent / 100);
}

function calculateFinalPrice(product) {
  return calculateBasePrice(product) + calculateFeeAmount(product);
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.tabIndex = 0;
  card.setAttribute("role", "link");
  card.setAttribute("aria-label", `مشاهده جزئیات ${product.name}`);
  const detailsUrl = `details.html?id=${product.id}`;
  card.addEventListener("click", () => {
    window.location.href = detailsUrl;
  });
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      window.location.href = detailsUrl;
    }
  });

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" loading="lazy" />
    <div class="product-body">
      <h2 class="product-title">${product.name}</h2>
      <p class="product-desc">${product.description}</p>
      <div class="product-meta">
        <p class="meta-row">
          <span>قیمت هر گرم</span>
          <strong>${formatPrice(getPricePerGram())}</strong>
        </p>
        <p class="meta-row">
          <span>وزن (گرم)</span>
          <strong>${new Intl.NumberFormat("fa-IR").format(product.weightGrams)}</strong>
        </p>
        <p class="meta-row">
          <span>کارمزد</span>
          <strong>
            ${new Intl.NumberFormat("fa-IR").format(product.feePercent)}٪
            (${formatPrice(calculateFeeAmount(product))})
          </strong>
        </p>
      </div>
      <p class="product-price">قیمت نهایی: ${formatPrice(calculateFinalPrice(product))}</p>
    </div>
  `;

  return card;
}

function renderProducts() {
  productsContainer.innerHTML = "";

  const visibleProducts = products.filter(
    (product) => selectedCategory === "همه" || product.category === selectedCategory
  );

  if (!visibleProducts.length) {
    productsContainer.innerHTML =
      '<p class="empty-state">محصولی در این دسته بندی موجود نیست.</p>';
    return;
  }

  visibleProducts.forEach((product) => {
    productsContainer.appendChild(createProductCard(product));
  });
}

function closeMobileCategoryMenu() {
  if (!mobileCategoryToggle || !mobileCategoryPanel) return;
  mobileCategoryToggle.setAttribute("aria-expanded", "false");
  mobileCategoryPanel.hidden = true;
}

function toggleMobileCategoryMenu() {
  if (!mobileCategoryToggle || !mobileCategoryPanel) return;
  const isExpanded = mobileCategoryToggle.getAttribute("aria-expanded") === "true";
  mobileCategoryToggle.setAttribute("aria-expanded", String(!isExpanded));
  mobileCategoryPanel.hidden = isExpanded;
}

function createCategoryButton(category, closeOnSelect = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "category-item";
  if (category === selectedCategory) {
    button.classList.add("active");
  }
  button.textContent = category;
  button.addEventListener("click", () => {
    selectedCategory = category;
    renderCategories();
    renderProducts();
    if (closeOnSelect) {
      closeMobileCategoryMenu();
    }
  });
  return button;
}

function renderCategories() {
  if (!categoryList && !mobileCategoryList) return;

  const allCategories = ["همه", ...categories];

  if (categoryList) {
    categoryList.innerHTML = "";
    allCategories.forEach((category) => {
      categoryList.appendChild(createCategoryButton(category));
    });
  }

  if (mobileCategoryList) {
    mobileCategoryList.innerHTML = "";
    allCategories.forEach((category) => {
      mobileCategoryList.appendChild(createCategoryButton(category, true));
    });
  }
}

function renderLiveGoldPrice() {
  if (!liveGoldPriceElement) return;
  liveGoldPriceElement.textContent = formatPrice(liveGoldPriceToman);
}

async function initShopPage() {
  const data = await window.loadShopData();
  products = data.products ?? [];
  categories = data.categories ?? [];
  liveGoldPriceToman = data.liveGoldPriceToman ?? liveGoldPriceToman;

  renderLiveGoldPrice();
  const categoryFromUrl = getCategoryFromUrl();
  if (categoryFromUrl && categories.includes(categoryFromUrl)) {
    selectedCategory = categoryFromUrl;
  }
  if (mobileCategoryToggle) {
    mobileCategoryToggle.addEventListener("click", toggleMobileCategoryMenu);
  }
  renderCategories();
  renderProducts();
}

initShopPage();
