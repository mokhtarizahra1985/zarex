(function () {
  async function loadShopData() {
    try {
      const response = await fetch("/api/shop", { credentials: "same-origin" });
      if (response.ok) {
        const data = await response.json();
        window.ShopData = data;
        return data;
      }
    } catch (_err) {
      /* static fallback when opened without the Node server */
    }
    return (
      window.ShopData || {
        liveGoldPriceToman: 0,
        categories: [],
        products: []
      }
    );
  }

  window.loadShopData = loadShopData;
})();
