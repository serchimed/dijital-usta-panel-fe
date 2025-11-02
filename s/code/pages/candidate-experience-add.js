onAuthReady(() => {
  let id = getRequiredQueryParam("id");

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

  if ($isOngoing.checked) { $end.disabled = true; }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: id,
      company: val("company"),
      start: val("start"),
      end: val("end") ? val("end") : null,
      position: val("position"),
      description: val("description")
    };

    let errors = [];
    if (!req.company) { errors.push("Çalışılan firma adını giriniz."); }
    if (!req.position) { errors.push("Pozisyon bilgisini giriniz."); }
    if (!req.start) { errors.push("Başlangıç tarihini seçiniz."); }
    if (!$isOngoing.checked && !req.end) { errors.push("Bitiş tarihini seçiniz veya 'Çalışmaya Devam Ediyorum' seçeneğini işaretleyiniz."); }

    errors.push(...validateDateRange(req.start, req.end));

    let wcError = validateWordCount(req.description, 200, "Açıklama");
    if (wcError) { errors.push(wcError); }

    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "CandidateExperience/Add", req, "Deneyim eklendi.", ERROR_MESSAGE_DEFAULT, "candidate-profile.html?id=" + id);
  });
});
