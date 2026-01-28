function normalizeUrl(url) {
  if (!url || typeof url !== "string") return url;

  let trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("https://")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://")) {
    return trimmed.replace("http://", "https://");
  }

  return "https://" + trimmed;
}

onAuthReady(() => {
  let $city = document.getElementById("city");

  autocomplete($city, CITIES, (city, searchText) => city.toLowerCase().includes(searchText.toLowerCase()), (city) => city, (city, $input) => { $input.value = city; });

  let $webUrl = document.getElementById("webUrl");
  let $trendyolUrl = document.getElementById("trendyolUrl");

  function showNormalizationHint($input) {
    if (!$input) return;
    $input.addEventListener("blur", function() {
      let original = this.value.trim();
      if (!original) return;

      let normalized = normalizeUrl(original);
      if (normalized !== original) {
        this.value = normalized;
        this.style.borderColor = "#4CAF50";
        setTimeout(() => {
          this.style.borderColor = "";
        }, 1500);
      }
    });
  }

  showNormalizationHint($webUrl);
  showNormalizationHint($trendyolUrl);

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
      trendyolUrl: val("trendyolUrl")
    };

    let errors = [];
    if (!req.companyName) { errors.push("Firma adını giriniz."); }
    if (!req.city) { errors.push("İl bilgisini giriniz."); }
    else if (!CITIES.includes(req.city)) { errors.push(`Sadece şu iller geçerli: ${CITIES.join(", ")}`); }
    if (!req.responsibleMemberName) { errors.push("Firma yetkilisi adı soyadı giriniz."); }
    if (!req.email) { errors.push("Firma yetkilisi eposta adresini giriniz."); }
    if (req.email && !checkEmail(req.email)) { errors.push("Geçerli bir e-posta adresi giriniz."); }
    if (req.phone && !checkPhone(req.phone)) { errors.push("Geçerli bir telefon numarası giriniz (0 ile başlayan 11 haneli, örn: 05556667788)."); }

    if (req.webUrl) {
      req.webUrl = normalizeUrl(req.webUrl);
      if (!checkUrl(req.webUrl)) {
        errors.push("Geçerli bir web sitesi URL'si giriniz (https:// ile başlamalı).");
      }
    }

    if (req.trendyolUrl) {
      req.trendyolUrl = normalizeUrl(req.trendyolUrl);
      if (!checkUrl(req.trendyolUrl)) {
        errors.push("Geçerli bir Trendyol profil URL'si giriniz (https:// ile başlamalı).");
      }
    }

    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "Company/Add", req, "Firma eklendi.", ERROR_MESSAGE_DEFAULT, "admin-company-list.html");
  });
});
