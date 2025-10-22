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
    showHeaderMsg("Sisteme giriş yapmanız gerekiyor...");
    showContent();
    setTimeout(() => window.location.replace("demand-password.html"), DELAY_2);
    return;
  }

  let allowedRoles = PAGE_ROLES[page];
  if (!allowedRoles || !allowedRoles.includes(USER.role.toLowerCase())) {
    showHeaderMsg("Erişim izniniz yok, yönlendiriliyorsunuz...");
    showContent();
    setTimeout(() => window.location.replace("access-denied.html"), DELAY_2);
    return;
  }

  buildAuthenticatedMenu();
  showContent();
  dispatchAuthReady();
}

onReady(async () => { await initAuth(); });
