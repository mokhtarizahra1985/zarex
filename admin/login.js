const form = document.getElementById("login-form");
const messageEl = document.getElementById("login-message");

function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = `admin-message ${type}`;
  messageEl.hidden = false;
}

async function checkSession() {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.ok) {
    window.location.href = "/admin";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = {
    username: String(formData.get("username") || "").trim(),
    password: String(formData.get("password") || "")
  };

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      showMessage("نام کاربری یا رمز عبور اشتباه است.", "error");
      return;
    }
    window.location.href = "/admin";
  } catch {
    showMessage("خطا در اتصال به سرور.", "error");
  }
});

checkSession();
