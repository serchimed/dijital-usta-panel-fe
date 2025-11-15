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

    // Özel yükleme mesajı göster
    $btn.disabled = true;
    $msg.textContent = "Yapay zeka mektubunuzu değerlendiriyor lütfen bekleyiniz.";

    let result = await api("CandidateLetter/Add", req, 0, 60000);
    if (!result || result.error || !result.isSuccess) {
      $msg.textContent = "Motivasyon mektubu ekleme başarısız oldu, lütfen tekrar deneyiniz.";
      $btn.disabled = false;
    } else {
      $msg.textContent = "Motivasyon mektubu eklendi.";
      setTimeout(() => {
        location.href = "candidate-profile.html";
      }, DELAY_1);
    }
  });
});
