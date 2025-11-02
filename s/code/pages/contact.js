onReady(() => {
  showContent();

  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      name: val("name"),
      email: val("email"),
      subject: val("subject"),
      message: val("message")
    };

    let errors = [];
    if (!req.name) { errors.push("Adınızı ve soyadınızı giriniz."); }
    if (req.name && (req.name.length < 2 || req.name.length > 100)) { errors.push("Adınız ve soyadınız 2 ile 100 karakter arasında olmalıdır."); }
    if (!req.email) { errors.push("E-posta adresini giriniz."); }
    else if (!checkEmail(req.email)) { errors.push("Geçerli bir e-posta adresi giriniz."); }
    if (!req.subject) { errors.push("Konu başlığını giriniz."); }
    if (req.subject && (req.subject.length < 5 || req.subject.length > 200)) { errors.push("Konu başlığı 5 ile 200 karakter arasında olmalıdır."); }
    if (!req.message) { errors.push("Mesajınızı giriniz."); }
    if (req.message && (req.message.length < 10 || req.message.length > 5000)) { errors.push("Mesajınız 10 ile 5000 karakter arasında olmalıdır."); }

    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);
    await apiBtn(this, "Contact/Message", req, "Mesajınız Gönderildi", ERROR_MESSAGE_DEFAULT);
  });
});
