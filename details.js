let products = [];
let liveGoldPriceToman = 10000000;

const productDetailsContainer = document.getElementById("product-details");
const liveGoldPriceElement = document.getElementById("live-gold-price");

function getPricePerGram() {
  return liveGoldPriceToman;
}

function formatPrice(value) {
  const tomanValue = Math.round(value);
  return `${new Intl.NumberFormat("fa-IR").format(tomanValue)} تومان`;
}

function renderLiveGoldPrice() {
  if (!liveGoldPriceElement) return;
  liveGoldPriceElement.textContent = formatPrice(liveGoldPriceToman);
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

function getProductIdFromUrl() {
  const url = new URL(window.location.href);
  const id = Number(url.searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function findProductById(id) {
  return products.find((product) => Number(product.id) === id) || null;
}

function createDetailsMarkup(product) {
  const images = product.images?.length ? product.images : [product.image];
  const album = images
    .map(
      (imageSrc, idx) => `
        <button
          type="button"
          class="album-image-button${idx === 0 ? " active" : ""}"
          data-image-index="${idx}"
          aria-label="نمایش تصویر ${idx + 1}"
        >
          <img
            src="${imageSrc}"
            alt="${product.name} thumbnail ${idx + 1}"
            loading="lazy"
            class="album-image"
          />
        </button>
      `
    )
    .join("");

  return `
    <article class="details-card" dir="rtl">
      <nav class="details-breadcrumb" aria-label="breadcrumb">
        <a class="breadcrumb-link" href="index.html?category=${encodeURIComponent(product.category)}">${product.category}</a>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">${product.name}</span>
      </nav>
      <div class="details-gallery">
        <div class="main-image-wrapper">
          <button type="button" class="gallery-nav gallery-prev" id="gallery-prev" aria-label="تصویر قبلی">›</button>
          <img
            id="main-detail-image"
            src="${images[0]}"
            alt="${product.name} image 1"
            class="main-detail-image"
            loading="eager"
          />
          <button type="button" class="gallery-nav gallery-next" id="gallery-next" aria-label="تصویر بعدی">‹</button>
        </div>
        <div class="details-album" id="details-album">${album}</div>
      </div>
      <div class="details-content">
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
            </strong>
          </p>
        </div>
        <p class="product-price">قیمت نهایی: ${formatPrice(calculateFinalPrice(product))}</p>
        <section class="product-explanation">
          <h3>توضیحات محصول</h3>
          <p>${product.details || product.description}</p>
        </section>
        <a class="back-link" href="index.html">بازگشت به محصولات</a>
      </div>
    </article>
    <section class="similar-products-section" dir="rtl">
      <h3 class="similar-products-title">محصولات مشابه</h3>
      <div id="similar-products" class="similar-products-grid"></div>
    </section>
  `;
}

function setupDetailsGallery(product) {
  const images = product.images?.length ? product.images : [product.image];
  if (!images.length) return;

  const mainImage = document.getElementById("main-detail-image");
  const prevButton = document.getElementById("gallery-prev");
  const nextButton = document.getElementById("gallery-next");
  const albumButtons = Array.from(document.querySelectorAll(".album-image-button"));
  let currentImageIndex = 0;

  function updateGallery(index) {
    currentImageIndex = (index + images.length) % images.length;
    mainImage.src = images[currentImageIndex];
    mainImage.alt = `${product.name} image ${currentImageIndex + 1}`;

    albumButtons.forEach((button, idx) => {
      button.classList.toggle("active", idx === currentImageIndex);
    });
  }

  prevButton?.addEventListener("click", () => {
    updateGallery(currentImageIndex + 1);
  });

  nextButton?.addEventListener("click", () => {
    updateGallery(currentImageIndex - 1);
  });

  albumButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.imageIndex);
      updateGallery(index);
    });
  });
}

function createSimilarProductCard(product) {
  const card = document.createElement("article");
  card.className = "similar-product-card";
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
    <img src="${product.image}" alt="${product.name}" loading="lazy" class="similar-product-image" />
    <div class="similar-product-body">
      <h4 class="similar-product-title">${product.name}</h4>
      <p class="similar-product-price">${formatPrice(calculateFinalPrice(product))}</p>
    </div>
  `;
  return card;
}

function renderSimilarProducts(currentProduct) {
  const similarContainer = document.getElementById("similar-products");
  if (!similarContainer) return;

  const similarProducts = products.filter(
    (product) =>
      Number(product.id) !== Number(currentProduct.id) &&
      product.category === currentProduct.category
  );

  if (!similarProducts.length) {
    similarContainer.innerHTML = '<p class="empty-state">محصول مشابهی در این دسته بندی پیدا نشد.</p>';
    return;
  }

  similarProducts.forEach((product) => {
    similarContainer.appendChild(createSimilarProductCard(product));
  });
}

function showMissingProductMessage() {
  productDetailsContainer.innerHTML = `
    <article class="details-card">
      <div class="details-content">
        <h2 class="product-title">محصول یافت نشد</h2>
        <p class="product-desc">
          شناسه محصول نامعتبر است. لطفاً به صفحه محصولات بازگردید و یکی از آیتم‌ها را انتخاب کنید.
        </p>
        <a class="back-link" href="index.html">بازگشت به محصولات</a>
      </div>
    </article>
  `;
}

function renderProductDetails(currentProduct) {
  productDetailsContainer.innerHTML = createDetailsMarkup(currentProduct);
  setupDetailsGallery(currentProduct);
  renderSimilarProducts(currentProduct);
}

async function initDetailsPage() {
  const data = await window.loadShopData();
  products = data.products ?? [];
  liveGoldPriceToman = data.liveGoldPriceToman ?? liveGoldPriceToman;
  renderLiveGoldPrice();

  const productId = getProductIdFromUrl();
  const currentProduct = productId ? findProductById(productId) : null;

  if (!currentProduct) {
    showMissingProductMessage();
    return;
  }

  renderProductDetails(currentProduct);
}

initDetailsPage();
