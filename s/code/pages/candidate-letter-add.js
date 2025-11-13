onAuthReady(() => {
  let $btn = document.querySelector("main button");
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: USER.id,
      letter: val("letter")
    };

    let errors = [];
    if (!req.letter) { errors.push("Motivasyon mektubunu giriniz."); }
    if (req.letter && req.letter.length > 5000) { errors.push("Motivasyon mektubu 5000 karakterden fazla olamaz."); }

    let $msg = $btn.nextElementSibling;
    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);
    await apiBtn(this, "CandidateLetter/Add", req, "Motivasyon mektubu eklendi.", "Motivasyon mektubu ekleme başarısız oldu, lütfen tekrar deneyiniz.", "candidate-profile.html");
  });
});
