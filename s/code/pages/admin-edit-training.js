onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let trainingId = getId("trainingId");
  if (!trainingId) {
    setMessageText($msg, "Geçersiz ID");
    return;
  }

  let result = await api("Training/Get", { trainingId: trainingId });

  if (!result || !result.isSuccess || !result.data) {
    setMessageText($msg, "Eğitim yüklenemedi");
    return;
  }

  let training = result.data;
  set("name", training.name);
  set("description", training.description);

  let imageUploader = createImageUploader({
    fileInputId: "fileInput",
    previewId: "imagePreview",
    messageElement: $msg
  });

  if (training.image) {
    imageUploader.setBase64(training.image);
  }

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let name = val("name");
      let description = val("description");

      if (!name || name.length < 3) {
        setMessageText($msg, "Eğitim adı en az 3 karakter olmalıdır");
        return;
      }

      if (name.length > 100) {
        setMessageText($msg, "Eğitim adı en fazla 100 karakter olmalıdır");
        return;
      }

      if (description && description.length > 1000) {
        setMessageText($msg, "Açıklama en fazla 1000 karakter olmalıdır");
        return;
      }

      let imageData = imageUploader ? imageUploader.getBase64() : null;
      if (!imageData && !training.image) {
        setMessageText($msg, "Eğitim görseli zorunludur");
        return;
      }

      $btn.disabled = true;
      setMessageText($msg, "Güncelleniyor...");

      let updateResult = await api("Training/Update", {
        trainingId: trainingId,
        name: name.trim(),
        description: description ? description.trim() : "",
        image: imageUploader ? imageUploader.getBase64() || "" : training.image || ""
      });

      if (updateResult && updateResult.isSuccess) {
        setMessageText($msg, "Eğitim başarıyla güncellendi");
        setTimeout(() => { window.location.href = "admin-lms.html"; }, DELAY_CONFIG._1);
      } else {
        setMessageText($msg, getApiError(updateResult, "Güncelleme başarısız oldu"));
        logErr(updateResult);
        $btn.disabled = false;
      }
    });
  }
});
