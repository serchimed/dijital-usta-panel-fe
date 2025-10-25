onReady(() => {
  showContent();

  let $email = document.getElementById("email");
  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;

  let prms = new URLSearchParams(window.location.search);
  let prmEmail = prms.get("email");
  if (prmEmail) { $email.value = prmEmail; }

  let handleSubmit = async function () {
    let email = $email.value.trim();
    if (!checkEmail(email)) {
      $msg.innerText = "Geçerli bir e-posta adresi girin.";
      return;
    }

    $msg.textContent = "";
    let result = await apiBtn($btn, "Member/NewPasscode", { email: email }, "E-posta adresinize tek kullanımlık giriş şifreniz gönderildi.", "Bir hata oluştu.");

    if (result && result.isSuccess) {
      setTimeout(() => {
        window.location.href = `login.html?email=${encodeURIComponent(email)}`;
      }, DELAY_2);
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
