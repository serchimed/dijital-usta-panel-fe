onReady(async () => {
  let token = getRequiredQueryParam("ref", "error-server.html");
  let email = getRequiredQueryParam("email", "error-server.html");
  if (email) { set("email", email); }

  let $list = document.getElementById("companiesList");
  $list.innerHTML = "<p>Firmalar yükleniyor...</p>";

  let result = await api("Company/GetForCandidateCity", { email: val("email") });
  if (!result || result.error || !result.isSuccess || !Array.isArray(result.data)) {
    $list.innerHTML = "<p class='lbl-err'>Firmalar yüklenemedi. Sayfayı yenileyin.</p>";
  } else if (result.data.length === 0) {
    $list.innerHTML = "<p>Şehrinizde henüz firma bulunmamaktadır.</p>";
  } else {
    $list.innerHTML = "";
    result.data.forEach(company => { $list.append(chkComp(company)); });
  }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let selectedIds = Array.from(document.querySelectorAll('#companiesList input[type="checkbox"]:checked')).map(cb => cb.value);

    let req = {
      token: token,
      email: val("email"),
      companyIds: selectedIds
    };

    let errors = [];
    if (!req.email) { errors.push("E-posta adresini giriniz."); }
    if (req.email && !checkEmail(req.email)) { errors.push("Geçerli bir e-posta adresi giriniz."); }
    if (selectedIds.length === 0) { errors.push("En az bir firma seçmelisiniz."); }

    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "Candidate/Add", req, "Sisteme giriş sağlandı.", ERROR_MESSAGE_DEFAULT, "candidate-profile.html");
  });
});
