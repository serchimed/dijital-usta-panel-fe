onAuthReady(async () => {
  let req = {
    memberId: USER.id,
    experienceId: getId("id")
  };
  await fillInputsViaReq("CandidateExperience/Get", req);

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
    req.company = val("company");
    req.start = val("start");
    req.isOngoing = $isOngoing.checked ? true : false;
    req.end = val("end") ? val("end") : null;
    req.position = val("position");
    req.description = val("description");

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
    await apiBtn(this, "CandidateExperience/Update", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, "candidate-profile.html");
  });
});
