onAuthReady(() => {
  let id = getRequiredQueryParam("id");

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: id,
      letter: val("letter")
    };

    let errors = [];
    if (!req.letter) { errors.push("Motivasyon mektubunu giriniz."); }

    if (showErrors($msg, errors)) { return; }

    clearErrors($msg);
    await apiBtn(this, "CandidateLetter/Add", req, "Motivasyon mektubu eklendi.", "Motivasyon mektubu ekleme başarısız oldu, lütfen tekrar deneyiniz.", "candidate-profile.html?id=" + id);
  });
});
