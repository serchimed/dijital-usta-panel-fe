onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let imageUploader = createImageUploader({
    fileInputId: "fileInput",
    previewId: "imagePreview",
    messageElement: $msg
  });

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let name = val("name");
      let description = val("description");

      if (!name) {
        setMessageText($msg, "Eğitim adı zorunludur");
        return;
      }

      $btn.disabled = true;
      setMessageText($msg, "Kaydediliyor...");

      let result = await api("Training/Add", {
        name: name,
        description: description || "",
        image: imageUploader ? imageUploader.getBase64() || "" : ""
      });

      if (result && result.isSuccess) {
        setMessageText($msg, "Eğitim başarıyla eklendi");
        setTimeout(() => {
          window.location.href = "admin-lms.html";
        }, 1000);
      } else {
        setMessageText($msg, "Kayıt başarısız oldu");
        logErr(result);
        $btn.disabled = false;
      }
    });
  }
});
