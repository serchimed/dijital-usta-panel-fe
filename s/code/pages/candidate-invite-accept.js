onReady(async () => {
  let prms = new URLSearchParams(window.location.search);
  let token = prms.get("ref");
  if (!token) { window.location.href = "error-server.html"; }
  let email = prms.get("email");
  if (email) { set("email", email); } else { window.location.href = "error-server.html"; }

  let $companiesList = document.getElementById("companiesList");
  $companiesList.innerHTML = "<p>Firmalar yükleniyor...</p>";

  let companiesResult = await api("Company/GetForCandidateCity", { email: val("email") });
  if (!companiesResult || companiesResult.error || !companiesResult.isSuccess || !Array.isArray(companiesResult.data)) {
    $companiesList.innerHTML = "<p class='lbl-err'>Firmalar yüklenemedi. Sayfayı yenileyin.</p>";
  } else if (companiesResult.data.length === 0) {
    $companiesList.innerHTML = "<p>Şehrinizde henüz firma bulunmamaktadır.</p>";
  } else {
    $companiesList.innerHTML = "";
    companiesResult.data.forEach(company => {
      let $label = document.createElement("label");
      $label.style.display = "flex";
      $label.style.alignItems = "center";
      $label.style.marginBottom = "8px";

      let $checkbox = chk(company.id, true);

      let $span = document.createElement("span");
      $span.textContent = company.companyName;
      $span.style.margin = "0";

      $label.append($checkbox);
      $label.append($span);
      $companiesList.append($label);
    });
  }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let selectedCompanyIds = Array.from(document.querySelectorAll('#companiesList input[type="checkbox"]:checked')).map(cb => cb.value);

    let req = {
      token: token,
      email: val("email"),
      companyIds: selectedCompanyIds
    };

    let errors = [];
    if (!req.email) { errors.push("E-posta adresini giriniz."); }
    if (req.email && !checkEmail(req.email)) { errors.push("Geçerli bir e-posta adresi giriniz."); }
    if (selectedCompanyIds.length === 0) { errors.push("En az bir firma seçmelisiniz."); }

    if (errors.length) {
      $msg.textContent = errors.map(e => `• ${e}`).join("\n");
      return;
    }

    $msg.textContent = "";
    await apiBtn(this, "Candidate/Add", req, "Sisteme giriş sağlandı.", ERROR_MESSAGE_DEFAULT, "index.html");
  });
});
