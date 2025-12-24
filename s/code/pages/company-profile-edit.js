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
    // driveUrl: val("driveUrl"),
    county: val("county"),
    languages: val("languages")
  };
}

onAuthReady(async () => {
  let id = await fillInputs("Company/Get", "companyId");
  let initialRequest = getReq(id);

  if (USER.role === "editor" || USER.role === "admin") {
    //document.getElementById("driveUrl").parentElement.style.display = "block";
  }

  // URL normalization visual feedback
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

    if (!req.webUrl) {
      errors.push("Web sitesi bilgisini giriniz.");
    } else {
      req.webUrl = normalizeUrl(req.webUrl);
      if (!checkUrl(req.webUrl)) {
        errors.push("Geçerli bir web sitesi URL'si giriniz (https:// ile başlamalı).");
      }
    }

    if (!req.trendyolUrl) {
      errors.push("Trendyol satıcı profili bilgisini giriniz.");
    } else {
      req.trendyolUrl = normalizeUrl(req.trendyolUrl);
      if (!checkUrl(req.trendyolUrl)) {
        errors.push("Geçerli bir Trendyol satıcı profil URL'si giriniz (https:// ile başlamalı).");
      }
    }

    let redirectUrl = "company-profile.html?id=" + id;
    if (USER.role === "editor" || USER.role === "admin") {
      // if (!req.driveUrl) { errors.push("Drive klasör URL'sini giriniz."); }
      // else if (!checkUrl(req.driveUrl)) { errors.push("Geçerli bir Drive klasör URL'si giriniz."); }

      redirectUrl = "admin-company-profile.html?id=" + id;
    }

    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "Company/Update", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, redirectUrl);
  });
});
