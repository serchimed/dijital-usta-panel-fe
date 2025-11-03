function getReq(id) {
  return {
    memberId: USER.id,
    companyId: id,
    companyName: val("companyName"),
    sector: val("sector"),
    responsibleMemberName: val("responsibleMemberName"),
    email: val("email"),
    phone: val("phone"),
    webUrl: val("webUrl"),
    trendyolUrl: val("trendyolUrl"),
    driveUrl: val("driveUrl"),
    county: val("county"),
    languages: val("languages")
  };
}

onAuthReady(async () => {
  let id = await fillInputs("Company/Get", "companyId");
  let initialRequest = getReq(id);

  if (USER.role === "editor" || USER.role === "admin") { document.getElementById("driveUrl").parentElement.style.display = "block"; }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = getReq(id);

    if (!hasChanges(initialRequest, req)) {
      $msg.innerText = "Herhangi bir değişiklik yapılmadı.";
      return;
    }

    let errors = [];
    if (!req.companyName) { errors.push("Firma adını giriniz."); }
    if (!req.responsibleMemberName) { errors.push("Ad ve soyad bilgisini giriniz."); }
    if (!req.phone) { errors.push("Telefon numarası giriniz."); }
    else if (!checkPhone(req.phone)) { errors.push("Geçerli bir telefon numarası giriniz (0 ile başlayan 11 haneli, örn: 05556667788)."); }
    if (!req.email) { errors.push("E-posta adresini giriniz."); }
    else if (!checkEmail(req.email)) { errors.push("Geçerli eposta adresini giriniz."); }
    if (!req.sector) { errors.push("Sektör bilgisini giriniz."); }
    if (!req.webUrl) { errors.push("Web sitesi bilgisini giriniz."); }
    else if (!checkUrl(req.webUrl)) { errors.push("Geçerli bir web sitesi URL'si giriniz."); }
    if (!req.trendyolUrl) { errors.push("Trendyol satıcı profili bilgisini giriniz."); }
    else if (!checkUrl(req.trendyolUrl)) { errors.push("Geçerli bir Trendyol statıcı profil URL'si giriniz."); }

    let redirectUrl = "company-profile.html?id=" + id;
    if (USER.role === "editor" || USER.role === "admin") {
      if (!req.driveUrl) { errors.push("Drive klasör URL'sini giriniz."); }
      else if (!checkUrl(req.driveUrl)) { errors.push("Geçerli bir Drive klasör URL'si giriniz."); }

      redirectUrl = "admin-company-profile.html?id=" + id;
    }

    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "Company/Update", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, redirectUrl);
  });
});
