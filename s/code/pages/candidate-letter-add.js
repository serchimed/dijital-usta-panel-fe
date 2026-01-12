onAuthReady(() => {
  let MAX_CHARS = 5000;
  let $textarea = document.getElementById("letter");
  let $charCounter = document.createElement("span");
  $charCounter.style.fontSize = "14px";
  $charCounter.style.color = "#666";
  $textarea.after($charCounter);

  function updateCharCounter() {
    let currentLength = $textarea.value.length;
    $charCounter.textContent = `${currentLength} / ${MAX_CHARS} karakter`;

    if (currentLength > MAX_CHARS) {
      $charCounter.style.color = "#d32f2f";
      $charCounter.style.fontWeight = "bold";
    } else if (currentLength > MAX_CHARS * 0.9) {
      $charCounter.style.color = "#f57c00";
    } else {
      $charCounter.style.color = "#666";
      $charCounter.style.fontWeight = "normal";
    }
  }

  $textarea.addEventListener("input", updateCharCounter);
  updateCharCounter();

  let $btn = document.querySelector("main button");
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      memberId: USER.id,
      letter: val("letter")
    };

    let errors = [];
    if (!req.letter) { errors.push("Motivasyon mektubunu giriniz."); }
    if (req.letter && req.letter.length > MAX_CHARS) { errors.push(`Motivasyon mektubu ${MAX_CHARS} karakterden fazla olamaz.`); }

    let $msg = $btn.nextElementSibling;
    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);

    $btn.disabled = true;
    $msg.textContent = "Yapay zeka mektubunuzu değerlendiriyor lütfen bekleyiniz.";

    let result = await api("CandidateLetter/Add", req, 0, DELAY_CONFIG._6);
    if (!result || result.error || !result.isSuccess) {
      if (result && result.errors && result.errors.length > 0) {
        $msg.textContent = result.errors[0];
      } else {
        $msg.textContent = "Motivasyon mektubu ekleme başarısız oldu, lütfen tekrar deneyiniz.";
      }
      $btn.disabled = false;
    } else {
      $msg.textContent = "Motivasyon mektubu eklendi.";
      setTimeout(() => { location.href = "candidate-profile.html"; }, DELAY_CONFIG._1);
    }
  });
});
