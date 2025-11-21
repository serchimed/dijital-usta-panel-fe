onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let name = val("name");
      let description = val("description");

      if (!name) {
        setMessageText($msg, "Anket adı zorunludur");
        return;
      }

      $btn.disabled = true;
      setMessageText($msg, "Kaydediliyor...");

      let result = await api("Questionnaire/Add", {
        name: name,
        description: description || ""
      });

      if (result && result.isSuccess) {
        setMessageText($msg, "Anket başarıyla eklendi");
        setTimeout(() => {
          window.location.href = "admin-lms.html";
        }, 1000);
      } else {
        setMessageText($msg, getApiError(result, "Kayıt başarısız oldu"));
        logErr(result);
        $btn.disabled = false;
      }
    });
  }
});
