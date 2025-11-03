onAuthReady(async () => {
  let req = {
    memberId: USER.id,
    certificateId: getId("id")
  };
  await fillInputsViaReq("CandidateCertificate/Get", req);

  let $year = document.getElementById("year");
  if ($year) { $year.max = new Date().getFullYear(); }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;

  $btn.addEventListener(CLICK_EVENT, async function () {
    req.name = val("name");
    req.organization = val("organization");
    req.year = val("year");
    req.description = val("description");

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

    let wcError = validateWordCount(req.description, 200, "Açıklama");
    if (wcError) { errors.push(wcError); }

    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);
    await apiBtn(this, "CandidateCertificate/Update", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, "candidate-profile.html");
  });
});
