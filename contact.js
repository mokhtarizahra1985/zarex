const liveGoldPriceElement = document.getElementById("live-gold-price");

function formatPrice(value) {
  const tomanValue = Math.round(value);
  return `${new Intl.NumberFormat("fa-IR").format(tomanValue)} تومان`;
}

async function initContactPage() {
  const data = await window.loadShopData();
  const liveGoldPriceToman = data.liveGoldPriceToman ?? 10000000;
  if (liveGoldPriceElement) {
    liveGoldPriceElement.textContent = formatPrice(liveGoldPriceToman);
  }
}

initContactPage();
