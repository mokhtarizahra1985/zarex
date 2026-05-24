const path = require("path");
const express = require("express");
const multer = require("multer");
const { getShop, saveShop, nextProductId, ROOT } = require("./store");
const { verifyLogin, requireAdmin } = require("./auth");

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(ROOT, "uploads"));
    },
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-()]+/g, "_").slice(0, 120);
      cb(null, `${Date.now()}-${safe}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  }
});

function normalizeProduct(body, existing) {
  const product = { ...existing, ...body };
  product.name = String(product.name || "").trim();
  product.category = String(product.category || "").trim();
  product.description = String(product.description || "").trim();
  product.details = String(product.details || product.description || "").trim();
  product.weightGrams = Number(product.weightGrams);
  product.feePercent = Number(product.feePercent);
  if (!product.name || !product.category) {
    throw new Error("Name and category are required");
  }
  if (!Number.isFinite(product.weightGrams) || product.weightGrams <= 0) {
    throw new Error("Valid weight in grams is required");
  }
  if (!Number.isFinite(product.feePercent) || product.feePercent < 0) {
    throw new Error("Valid fee percent is required");
  }
  const images = Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : product.image
      ? [product.image]
      : [];
  product.images = images.length ? images : [];
  product.image = product.image || product.images[0] || "";
  if (!product.image) {
    throw new Error("At least one image is required");
  }
  return product;
}

router.get("/api/shop", async (_req, res, next) => {
  try {
    const shop = await getShop();
    res.json({
      liveGoldPriceToman: shop.liveGoldPriceToman,
      categories: shop.categories,
      products: shop.products
    });
  } catch (err) {
    next(err);
  }
});

router.post("/api/auth/login", async (req, res, next) => {
  try {
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");
    const ok = await verifyLogin(username, password);
    if (!ok) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }
    req.session.admin = { username };
    res.json({ ok: true, username });
  } catch (err) {
    next(err);
  }
});

router.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("sunrad.sid");
    res.json({ ok: true });
  });
});

router.get("/api/auth/me", (req, res) => {
  if (!req.session?.admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ username: req.session.admin.username });
});

router.put("/api/admin/settings/gold-price", requireAdmin, async (req, res, next) => {
  try {
    const value = Number(req.body?.liveGoldPriceToman);
    if (!Number.isFinite(value) || value <= 0) {
      res.status(400).json({ error: "Invalid gold price" });
      return;
    }
    const shop = await getShop();
    shop.liveGoldPriceToman = Math.round(value);
    await saveShop(shop);
    res.json({ liveGoldPriceToman: shop.liveGoldPriceToman });
  } catch (err) {
    next(err);
  }
});

router.get("/api/admin/shop", requireAdmin, async (_req, res, next) => {
  try {
    res.json(await getShop());
  } catch (err) {
    next(err);
  }
});

router.post("/api/admin/products", requireAdmin, async (req, res, next) => {
  try {
    const shop = await getShop();
    const product = normalizeProduct(req.body, {});
    product.id = nextProductId(shop.products);
    shop.products.push(product);
    await saveShop(shop);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message || "Invalid product" });
  }
});

router.put("/api/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const shop = await getShop();
    const index = shop.products.findIndex((p) => Number(p.id) === id);
    if (index === -1) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const product = normalizeProduct(req.body, shop.products[index]);
    product.id = id;
    shop.products[index] = product;
    await saveShop(shop);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message || "Invalid product" });
  }
});

router.delete("/api/admin/products/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const shop = await getShop();
    const before = shop.products.length;
    shop.products = shop.products.filter((p) => Number(p.id) !== id);
    if (shop.products.length === before) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    await saveShop(shop);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/api/admin/upload", requireAdmin, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || "Upload failed" });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

module.exports = router;
