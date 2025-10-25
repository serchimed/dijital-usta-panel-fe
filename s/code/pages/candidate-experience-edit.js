onAuthReady(async () => {
  let experienceId = await fillInputs("CandidateExperience/Get");

  let $isOngoing = document.getElementById("isOngoing");
  let $end = document.getElementById("end");

  if (!$end.value) {
    $isOngoing.checked = true;
    $end.disabled = true;
  } else {
    $isOngoing.checked = false;
    $end.disabled = false;
  }

  $isOngoing.addEventListener("change", function () {
    if (this.checked) {
      $end.value = "";
      $end.disabled = true;
    } else {
      $end.disabled = false;
    }
  });

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;

  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: USER.id,
      experienceId: experienceId,
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
    await apiBtn(this, "CandidateExperience/Update", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, "candidate-profile.html");
  });
});
