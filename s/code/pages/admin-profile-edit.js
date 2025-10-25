onAuthReady(async () => {
  let id = await fillInputs("Admin/GetAdmin");

  document.querySelector("main button").addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: id,
      displayName: val("displayName"),
      companyName: val("companyName"),
      phone: val("phone")
    };

    let errors = [];
    if (!req.companyName) { errors.push("Organizasyon adını giriniz."); }
    if (!req.displayName) { errors.push("Ad ve soyad bilgisini giriniz."); }
    if (!req.phone) { errors.push("Telefon numarası giriniz."); }
    else if (!checkPhone(req.phone)) { errors.push("Geçerli bir telefon numarası giriniz (0 ile başlayan 11 haneli, örn: 05556667788)."); }
    if (errors.length) {
      let p = this.nextElementSibling;
      p.textContent = errors.join("\n");
      return;
    }

    await apiBtn(this, "Admin/AdminEdit", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, "admin-profile.html?id=" + id);
  });
});
