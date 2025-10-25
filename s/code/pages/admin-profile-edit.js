onAuthReady(async () => {
  let id = await fillInputs("Admin/GetAdmin");

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
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

    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "Admin/AdminEdit", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, "admin-profile.html?id=" + id);
  });
});
