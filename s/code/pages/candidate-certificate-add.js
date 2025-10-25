onAuthReady(() => {
  let prms = new URLSearchParams(window.location.search);
  let id = prms.get("id");
  if (!id) { window.location.href = "index.html"; }

  let $year = document.getElementById("year");
  if ($year) {
    $year.max = new Date().getFullYear();
  }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: id,
      name: val("name"),
      organization: val("organization"),
      year: val("year"),
      description: val("description")
    };

    let errors = [];
    if (!req.name) { errors.push("Sertifika adını giriniz."); }
    if (!req.organization) { errors.push("Sertifikayı veren kurum bilgisini giriniz."); }
    if (!req.year) { errors.push("Yıl bilgisini giriniz."); }

    if (req.year) {
      let yearNum = parseInt(req.year);
      let currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1950 || yearNum > currentYear) {
        errors.push(`Yıl 1950 ile ${currentYear} arasında olmalıdır.`);
      }
    }

    if (req.description) {
      let wordCount = req.description.split(/\s+/).filter(Boolean).length;
      if (wordCount > 200) {
        errors.push(`Açıklama en fazla 200 kelime olmalıdır. (Şu an: ${wordCount})`);
      }
    }

    if (errors.length) {
      $msg.textContent = errors.map(e => `• ${e}`).join("\n");
      return;
    }

    $msg.textContent = "";
    await apiBtn(this, "CandidateCertificate/Add", req, "Sertifika eklendi.", ERROR_MESSAGE_DEFAULT, "candidate-profile.html?id=" + id);
  });
});
