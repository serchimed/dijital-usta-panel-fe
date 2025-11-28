onAuthReady(async () => {
  let prms = new URLSearchParams(window.location.search);
  let cityId = prms.get("id");
  if (!cityId) {
    window.location.href = "admin-settings.html";
    return;
  }

  let result = await api("City/Get", { cityId: cityId });
  if (result && result.isSuccess) {
    set("city", result.data.name);
    set("listFinalization", result.data.listFinalization);
    set("informingEvent", result.data.informingEvent);
    set("tobbTrainingStart", result.data.tobbTrainingStart);
    set("tobbTrainingEnd", result.data.tobbTrainingEnd);
    set("graduationEvent", result.data.graduationEvent);
    set("candidateProfileCompletionStart", result.data.candidateProfileCompletionStart);
    set("candidateLetterEnd", result.data.candidateLetterEnd);
    set("companyCandidateSelectionStart", result.data.companyCandidateSelectionStart);
    set("companyCandidateSelectionEnd", result.data.companyCandidateSelectionEnd);
    set("workStart", result.data.workStart);
  } else {
    logErr(result);
    window.location.href = "admin-settings.html";
    return;
  }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      cityId: result.data.id,
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
    await apiBtn(this, "City/Update", req, "İl bilgileri güncellendi.", ERROR_MESSAGE_DEFAULT, "admin-settings.html");
  });
});
