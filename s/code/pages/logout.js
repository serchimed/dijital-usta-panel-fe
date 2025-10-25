onAuthReady(async () => {
  showHeaderMsg("Çıkış yapılıyor...");

  let result = await api("Member/Logout", {});
  if (result && result === true) {
    showContent();
    if (document.querySelector(".header-message")) { document.querySelector(".header-message").remove(); }

  } else {
    console.error("Logout failed", result);
  }
});
