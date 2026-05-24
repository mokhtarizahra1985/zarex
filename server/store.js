const fs = require("fs/promises");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SHOP_PATH = path.join(ROOT, "data", "shop.json");
const ADMIN_PATH = path.join(ROOT, "data", "admin.json");

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT" && fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function getShop() {
  return readJson(SHOP_PATH);
}

async function saveShop(shop) {
  await writeJson(SHOP_PATH, shop);
}

async function getAdmin() {
  return readJson(ADMIN_PATH, null);
}

async function saveAdmin(admin) {
  await writeJson(ADMIN_PATH, admin);
}

function nextProductId(products) {
  const maxId = products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
  return maxId + 1;
}

module.exports = {
  ROOT,
  SHOP_PATH,
  ADMIN_PATH,
  getShop,
  saveShop,
  getAdmin,
  saveAdmin,
  nextProductId
};
