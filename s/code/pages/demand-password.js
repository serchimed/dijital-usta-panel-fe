onReady(() => {
  showContent();

  let $email = document.getElementById("email");
  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;

  let prms = new URLSearchParams(window.location.search);
  let prmEmail = prms.get("email");
  if (prmEmail) {
    let regex = /[?&]email=([^&]*)/;
    let match = window.location.search.match(regex);
    if (match && match[1].includes('+')) {
      prmEmail = decodeURIComponent(match[1]);
    }
    $email.value = prmEmail;
  }

  let $lblAccept = document.getElementById("lblAccept");
  let prmCompany = prms.get("company");
  if (prmCompany == "1") {
    $lblAccept.style.display = "block";
    $lblAccept.dataset.visible = "true";
  }

  let handleSubmit = async function () {
    let email = $email.value.trim();

    let errors = [];
    if (!checkEmail(email)) { errors.push("Geçerli bir e-posta adresi girin."); }

    let $isCompanyAccepted = document.getElementById("isCompanyAccepted");
    if ($lblAccept && $lblAccept.dataset.visible === "true" && !$isCompanyAccepted.checked) {
      errors.push("Firma Sözleşmesi ve Gizlilik Politikasını kabul etmelisiniz.");
    }

    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);

    let prmRef = prms.get("ref");
    let result = await apiBtn($btn, "Member/NewPasscode", { email: email, ref: prmRef, isCompanyAccepted: $isCompanyAccepted.checked }, "E-posta adresinize tek kullanımlık giriş şifreniz gönderildi.", "Bir hata oluştu.");
    if (result && result.isSuccess) {
      setTimeout(() => { window.location.href = `login.html?email=${encodeURIComponent(email)}`; }, DELAY_2);
    }
  };

  $btn.addEventListener(CLICK_EVENT, handleSubmit);

  $email.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  });
});
