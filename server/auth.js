const bcrypt = require("bcryptjs");
const { getAdmin, saveAdmin } = require("./store");

const DEFAULT_USERNAME = "admin";

async function ensureAdminCredentials() {
  const username = process.env.ADMIN_USERNAME || DEFAULT_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  let admin = await getAdmin();
  if (admin?.passwordHash) {
    if (admin.username !== username) {
      admin.username = username;
      await saveAdmin(admin);
    }
    return admin;
  }

  if (!password) {
    console.warn(
      "[auth] No data/admin.json and ADMIN_PASSWORD is not set. Login will fail until you set ADMIN_PASSWORD and restart."
    );
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  admin = { username, passwordHash };
  await saveAdmin(admin);
  console.log(`[auth] Admin user "${username}" created. Change ADMIN_PASSWORD after first login.`);
  return admin;
}

async function verifyLogin(username, password) {
  const admin = await getAdmin();
  if (!admin?.passwordHash) return false;
  if (username !== admin.username) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

function requireAdmin(req, res, next) {
  if (req.session?.admin) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

module.exports = {
  ensureAdminCredentials,
  verifyLogin,
  requireAdmin,
  DEFAULT_USERNAME
};
