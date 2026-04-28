const products = [
  {
    name: "Classic T-Shirt",
    description: "Soft cotton t-shirt for everyday comfort.",
    weightGrams: 50,
    feePercent: 1.2,
    image: "assets/images/001.png"
  },
  {
    name: "Wireless Headphones",
    description: "Clear sound with up to 20 hours of battery life.",
    weightGrams: 95,
    feePercent: 1.8,
    image: "assets/images/002.jpg"
  },
  {
    name: "Coffee Mug",
    description: "Ceramic mug, 350ml, perfect for hot drinks.",
    weightGrams: 35,
    feePercent: 3,
    image: "assets/images/01.jpg"
  },
  {
    name: "Desk Lamp",
    description: "Modern LED lamp with adjustable brightness.",
    weightGrams: 60,
    feePercent: 5,
    image:  "assets/images/01.jpg"
  },
  {
    name: "Backpack",
    description: "Lightweight backpack with laptop compartment.",
    weightGrams: 72,
    feePercent: 1.6,
    image:  "assets/images/01.jpg"
  },
  {
    name: "Running Shoes",
    description: "Breathable shoes designed for daily training.",
    weightGrams: 110,
    feePercent: 2,
    image:  "assets/images/01.jpg"
  },
  {
    name: "دستبند گندمی",
    description: "دستبند گندم با طرح زیبا و جذاب",
    weightGrams: 11.9,
    feePercent: 10,
    image: "assets/images/01.jpg"
  },
  {
    name: "دستبند گندمی",
    description: "دستبند گندم با طرح زیبا و جذاب",
    weightGrams: 11.9,
    feePercent: 10,
    image: "assets/images/01.jpg"
  }
];

const productsContainer = document.getElementById("products");
const PRICE_PER_GRAM = 10000000;

function formatPrice(value) {
  const tomanValue = Math.round(value);
  return `${new Intl.NumberFormat("fa-IR").format(tomanValue)} تومان`;
}

function calculateBasePrice(product) {
  return product.weightGrams * PRICE_PER_GRAM;
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

  card.innerHTML = `
    <img src="${product.image}" alt="${product.name}" loading="lazy" />
    <div class="product-body">
      <h2 class="product-title">${product.name}</h2>
      <p class="product-desc">${product.description}</p>
      <div class="product-meta">
        <p class="meta-row">
          <span>قیمت هر گرم</span>
          <strong>${formatPrice(PRICE_PER_GRAM)}</strong>
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

products.forEach((product) => {
  productsContainer.appendChild(createProductCard(product));
});
