onAuthReady(async () => {
  let id = getUrlId();
  if (!id) {
    window.location.href = "admin-settings.html";
    return;
  }

  let result = await api("EmailTemplate/Get", { id: id });
  if (result && result.isSuccess) {
    set("subject", result.data.subject);
    set("textContent", result.data.textContent);
    set("htmlContent", result.data.htmlContent);
  } else {
    logErr(result);
    window.location.href = "admin-settings.html";
    return;
  }

  let $btn = document.getElementById("btnSave");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let textContent = val("textContent");
    let htmlContent = val("htmlContent");

    let req = {
      id: id,
      textContent: textContent,
      htmlContent: htmlContent
    };

    let errors = [];
    if (!textContent) {
      errors.push("Metin içerik alanı doldurulmalıdır.");
    }
    if (!htmlContent) {
      errors.push("HTML içerik alanı doldurulmalıdır.");
    }

    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);
    await apiBtn(this, "EmailTemplate/Update", req, SUCCESS_UPDATE_MESSAGE, ERROR_MESSAGE_DEFAULT, "admin-settings.html");
  });
});
