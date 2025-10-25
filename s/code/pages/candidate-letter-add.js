onAuthReady(() => {
  let prms = new URLSearchParams(window.location.search);
  let id = prms.get("id");
  if (!id) { window.location.href = "index.html"; }

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: id,
      letter: val("letter")
    };

    let errors = [];
    if (!req.letter) { errors.push("Motivasyon mektubunu giriniz."); }

    if (errors.length) {
      $msg.textContent = errors.map(e => `• ${e}`).join("\n");
      return;
    }

    $msg.textContent = "";
    await apiBtn(this, "CandidateLetter/Add", req, "Motivasyon mektubu eklendi.", "Motivasyon mektubu ekleme başarısız oldu, lütfen tekrar deneyiniz.", "candidate-profile.html?id=" + id);
  });
});
