onReady(() => {
  showContent();

  let $email = document.getElementById("email");
  let $pass = document.getElementById("passcode");
  let $btn = document.querySelector("main button");

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

  let handleLogin = async function () {
    let email = $email.value.replace(/\s+/g, '');
    let pass = $pass.value.trim();

    let errors = [];
    if (!checkEmail(email)) { errors.push("Geçerli bir e-posta adresi girin."); }
    if (pass.length !== 8) { errors.push("Geçerli bir şifre girin."); }

    let $msg = $btn.nextElementSibling;
    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);
    await apiBtn($btn, "Member/Login", { email: email, passcode: pass }, "Giriş başarılı.", "Bir hata oluştu.", "index.html");
  };

  $btn.addEventListener(CLICK_EVENT, handleLogin);

  let handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  $email.addEventListener("keypress", handleKeyPress);
  $pass.addEventListener("keypress", handleKeyPress);
});
