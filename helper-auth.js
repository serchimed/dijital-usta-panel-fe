let USER;
async function initAuth() {
  let path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  page = page.replace(".html", "");

  if (PUBLIC_PAGES.includes(page)) {
    showContent();
    return;
  }

  USER = await api("Member/Check");
  if (!USER || USER.error || !USER.isAuthenticated) {
    showOverMsg("Sisteme giriş yapmanız gerekiyor...");
    setTimeout(() => window.location.replace("demand-password.html"), DELAY_1);
    return;
  }

  buildUserMenu();

  let allowedRoles = PAGE_ROLES[page];
  if (!allowedRoles || !allowedRoles.includes(USER.role.toLowerCase())) {
    showOverMsg("Erişim izniniz yok, yönlendiriliyorsunuz...");
    setTimeout(() => window.location.replace("access-denied.html"), DELAY_1);
    return;
  }

  if (page === "index") { buildRoleMenu(); }

  showContent();
  dispatchAuthReady();
}

onReady(async () => { await initAuth(); });
