onAuthReady(async () => {
  showHeaderMsg("Çıkış yapılıyor...");

  let result = await api("Member/Logout", {});
  if (result && result === true) {
    showContent();
    if (document.querySelector(".head-msg")) { document.querySelector(".head-msg").remove(); }

  } else { console.error("Logout failed", result); }
});
