let USER;
async function initAuth() {
  USER = await api("Member/Check");
  if (!USER || USER.error) {
    showOverMsg("Sisteme giriş yapmanız gerekiyor...");
    setTimeout(() => window.location.replace("demand-password.html"), 789);
    return;
  }

  let path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  page = page.replace(".html", "");

  if (!PUBLIC_PAGES.includes(page)) {
    if (!USER.isAuthenticated) {
      showOverMsg("Sisteme giriş yapmanız gerekiyor...");
      setTimeout(() => window.location.replace("demand-password.html"), 789);
      return;
    }
    buildUserMenu();

    let allowedRoles = PAGE_ROLES[page];
    if (!allowedRoles || !allowedRoles.includes(USER.role.toLowerCase())) {
      showOverMsg("Access denied. Redirecting...");
      setTimeout(() => window.location.replace("access-denied.html"), 789);
      return;
    }

    if (page === "index") { buildRoleMenu(); }
  }

  showContent();
  dispatchAuthReady();
}

onReady(async () => { await initAuth(); });

onAuthReady(() => {
  setTimeout(loadTables, 1234);
  setTimeout(setFilters, 2345);
});
