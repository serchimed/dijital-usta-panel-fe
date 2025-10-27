onAuthReady(() => {
  let $city = document.getElementById("city");

  autocomplete($city, CITIES, (city, searchText) => city.toLowerCase().includes(searchText.toLowerCase()), (city) => city, (city, $input) => { $input.value = city; });

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      companyName: val("companyName"),
      responsibleMemberName: val("responsibleMemberName"),
      phone: val("phone"),
      email: val("email"),
      city: val("city"),
      sector: val("sector"),
      webUrl: val("webUrl"),
      trendyolUrl: val("trendyolUrl"),
      driveUrl: val("driveUrl")
    };

    let errors = [];
    if (!req.companyName) { errors.push("Firma adını giriniz."); }
    if (!req.city) { errors.push("İl bilgisini giriniz."); }
    else if (!CITIES.includes(req.city)) { errors.push(`Sadece şu iller geçerli: ${CITIES.join(", ")}`); }
    if (!req.responsibleMemberName) { errors.push("Firma yetkilisi adı soyadı giriniz."); }
    if (!req.email) { errors.push("Firma yetkilisi eposta adresini giriniz."); }
    if (req.email && !checkEmail(req.email)) { errors.push("Geçerli bir e-posta adresi giriniz."); }
    if (req.phone && !checkPhone(req.phone)) { errors.push("Geçerli bir telefon numarası giriniz (0 ile başlayan 11 haneli, örn: 05556667788)."); }
    if (req.webUrl && !checkUrl(req.webUrl)) { errors.push("Geçerli bir web sitesi URL'si giriniz."); }
    if (req.trendyolUrl && !checkUrl(req.trendyolUrl)) { errors.push("Geçerli bir Trendyol profil URL'si giriniz."); }
    if (req.driveUrl && !checkUrl(req.driveUrl)) { errors.push("Geçerli bir Drive klasör URL'si giriniz."); }
    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "Company/Add", req, "Firma eklendi.", ERROR_MESSAGE_DEFAULT, "admin-company-list.html");
  });
});
