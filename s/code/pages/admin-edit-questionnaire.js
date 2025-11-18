onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let id = getId("id");
  if (!id) {
    setMessageText($msg, "Geçersiz ID");
    return;
  }

  let result = await api("Questionnaire/Get", { id: id });

  if (!result || !result.isSuccess || !result.data) {
    setMessageText($msg, "Anket yüklenemedi");
    return;
  }

  let questionnaire = result.data;
  set("name", questionnaire.name);
  set("description", questionnaire.description);

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let name = val("name");
      let description = val("description");

      if (!name || name.length < 3) {
        setMessageText($msg, "Anket adı en az 3 karakter olmalıdır");
        return;
      }

      if (name.length > 100) {
        setMessageText($msg, "Anket adı en fazla 100 karakter olmalıdır");
        return;
      }

      if (description && description.length > 1000) {
        setMessageText($msg, "Açıklama en fazla 1000 karakter olmalıdır");
        return;
      }

      $btn.disabled = true;
      setMessageText($msg, "Güncelleniyor...");

      let updateResult = await api("Questionnaire/Update", {
        id: id,
        name: name.trim(),
        description: description ? description.trim() : ""
      });

      if (updateResult && updateResult.isSuccess) {
        setMessageText($msg, "Anket başarıyla güncellendi");
        setTimeout(() => {
          window.location.href = "admin-lms.html";
        }, 1000);
      } else {
        setMessageText($msg, "Güncelleme başarısız oldu");
        logErr(updateResult);
        $btn.disabled = false;
      }
    });
  }
});
