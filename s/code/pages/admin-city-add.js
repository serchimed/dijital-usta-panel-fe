onAuthReady(() => {
  let $city = document.getElementById("city");

  autocomplete($city, CITIES_ALL, (city, searchText) => city.toLowerCase().includes(searchText.toLowerCase()), (city) => city, (city, $input) => { $input.value = city; });

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      name: val("city"),
      listFinalization: val("listFinalization"),
      informingEvent: val("informingEvent"),
      tobbTrainingStart: val("tobbTrainingStart"),
      tobbTrainingEnd: val("tobbTrainingEnd"),
      graduationEvent: val("graduationEvent"),
      candidateProfileCompletionStart: val("candidateProfileCompletionStart"),
      candidateLetterEnd: val("candidateLetterEnd"),
      companyCandidateSelectionStart: val("companyCandidateSelectionStart"),
      companyCandidateSelectionEnd: val("companyCandidateSelectionEnd"),
      workStart: val("workStart")
    };

    let errors = [];
    if (!req.name) { errors.push("İl bilgisini giriniz."); }
    else if (!CITIES_ALL.includes(req.name)) { errors.push(`Sadece şu iller geçerli: ${CITIES_ALL.join(", ")}`); }
    if (!req.listFinalization) { errors.push("Liste Teslim tarihini giriniz."); }
    if (!req.informingEvent) { errors.push("Bilgilendirme Buluşması tarihini giriniz."); }
    if (!req.tobbTrainingStart) { errors.push("TOBB ETÜ Eğitimi Başlangıç tarihini giriniz."); }
    if (!req.tobbTrainingEnd) { errors.push("TOBB ETÜ Eğitimi Bitiş tarihini giriniz."); }
    if (!req.graduationEvent) { errors.push("Mezuniyet Buluşması tarihini giriniz."); }
    if (!req.candidateProfileCompletionStart) { errors.push("Aday Profil Tamamlama Başlangıç tarihini giriniz."); }
    if (!req.candidateLetterEnd) { errors.push("Motivasyon Mektubu Yazma Bitiş tarihini giriniz."); }
    if (!req.companyCandidateSelectionStart) { errors.push("Firma Aday Eşleşme Başlangıç tarihini giriniz."); }
    if (!req.companyCandidateSelectionEnd) { errors.push("Firma Aday Eşleşme Bitiş tarihini giriniz."); }
    if (!req.workStart) { errors.push("İşe Başlama tarihini giriniz."); }
    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "City/Add", req, "İl aktifleştirildi.", ERROR_MESSAGE_DEFAULT, "admin-settings.html");
  });
});
