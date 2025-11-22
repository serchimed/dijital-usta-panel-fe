let USER;
async function initAuth() {
  let path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  page = page.replace(".html", "");

  if (PUBLIC_PAGES.includes(page) && page !== "access-denied") {
    showContent();
    return;
  }

  USER = await api("Member/Check");
  window.USER = USER;

  if (page === "access-denied") {
    if (USER && !USER.error && USER.isAuthenticated) {
      buildAuthenticatedMenu();
    }
    showContent();
    return;
  }

  if (!USER || USER.error || !USER.isAuthenticated) {
    showHeaderMsg("Sisteme giriş yapmanız gerekiyor...");
    hideOverlay();
    setTimeout(() => window.location.replace("demand-password.html"), DELAY_2);
    return;
  }

  let allowedRoles = PAGE_ROLES[page];
  if (!allowedRoles || !allowedRoles.includes(USER.role.toLowerCase())) {
    if (USER.role.toLowerCase() === "editor" && page === "index") {
      window.location.replace("admin-company-list.html");
      return;
    }
    showHeaderMsg("Erişim izniniz yok, yönlendiriliyorsunuz...");
    hideOverlay();
    setTimeout(() => window.location.replace("access-denied.html"), DELAY_2);
    return;
  }

  buildAuthenticatedMenu();
  showContent();
  dispatchAuthReady();
}

onReady(async () => { await initAuth(); });
