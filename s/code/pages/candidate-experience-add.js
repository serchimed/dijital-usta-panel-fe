onAuthReady(() => {
  let prms = new URLSearchParams(window.location.search);
  let id = prms.get("id");
  if (!id) { window.location.href = "index.html"; }

  let $isOngoing = document.getElementById("isOngoing");
  let $end = document.getElementById("end");

  $isOngoing.addEventListener("change", function () {
    if (this.checked) {
      $end.value = "";
      $end.disabled = true;
    } else {
      $end.disabled = false;
    }
  });

  if ($isOngoing.checked) {
    $end.disabled = true;
  }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: id,
      company: val("company"),
      start: val("start"),
      end: val("end"),
      position: val("position"),
      description: val("description")
    };

    let errors = [];
    if (!req.company) { errors.push("Çalışılan firma adını giriniz."); }
    if (!req.position) { errors.push("Pozisyon bilgisini giriniz."); }
    if (!req.start) { errors.push("Başlangıç tarihini seçiniz."); }
    if (!$isOngoing.checked && !req.end) { errors.push("Bitiş tarihini seçiniz veya 'Çalışmaya Devam Ediyorum' seçeneğini işaretleyiniz."); }

    if (req.start && req.end) {
      let s = new Date(req.start);
      let e = new Date(req.end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        errors.push("Tarih formatı geçersiz.");
      } else if (s > e) {
        errors.push("Bitiş tarihi, başlangıç tarihinden önce olamaz.");
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
    await apiBtn(this, "CandidateExperience/Add", req, "Deneyim eklendi.", ERROR_MESSAGE_DEFAULT, "candidate-profile.html?id=" + id);
  });
});
