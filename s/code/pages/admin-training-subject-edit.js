onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let trainingSubjectId = getId("trainingSubjectId");
  if (!trainingSubjectId) {
    setMessageText($msg, "Geçersiz konu ID'si");
    return;
  }

  let result = await api("TrainingSubject/Get", { trainingSubjectId: trainingSubjectId });

  if (!result || !result.isSuccess || !result.data) {
    setMessageText($msg, "Konu yüklenemedi");
    return;
  }

  let subject = result.data;
  let trainingId = subject.trainingId;
  let selectedTrainingId = trainingId;

  let trainingsResult = await api("Training/GetAll");
  if (!trainingsResult || !trainingsResult.isSuccess || !trainingsResult.data) {
    setMessageText($msg, "Eğitimler yüklenemedi");
    return;
  }

  let trainings = trainingsResult.data;
  let $trainingInput = document.getElementById("trainingInput");

  let selectedTraining = trainings.find(t => t.id === trainingId);
  if (selectedTraining) {
    $trainingInput.value = selectedTraining.name;
  }

  set("name", subject.name);
  set("description", subject.description);
  set("vimeoUrl", subject.vimeoUrl || "");
  set("order", subject.order);

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      if (!selectedTrainingId) {
        setMessageText($msg, "Lütfen bir eğitim seçiniz");
        return;
      }

      let name = val("name");
      let description = val("description");
      let vimeoUrl = val("vimeoUrl");
      let order = val("order");

      if (!name || name.trim().length < 3) {
        setMessageText($msg, "Konu adı en az 3 karakter olmalıdır");
        return;
      }

      if (name.trim().length > 200) {
        setMessageText($msg, "Konu adı en fazla 200 karakter olabilir");
        return;
      }

      if (!description || description.trim().length < 3) {
        setMessageText($msg, "Açıklama en az 3 karakter olmalıdır");
        return;
      }

      if (description.trim().length > 2000) {
        setMessageText($msg, "Açıklama en fazla 2000 karakter olabilir");
        return;
      }

      if (vimeoUrl && vimeoUrl.trim().length > 500) {
        setMessageText($msg, "Vimeo URL en fazla 500 karakter olabilir");
        return;
      }

      if (!order || parseInt(order) < 1 || parseInt(order) > 1000) {
        setMessageText($msg, "Sıra 1 ile 1000 arasında olmalıdır");
        return;
      }

      $btn.disabled = true;
      setMessageText($msg, "Güncelleniyor...");

      let updateResult = await api("TrainingSubject/Update", {
        trainingSubjectId: trainingSubjectId,
        trainingId: selectedTrainingId,
        name: name.trim(),
        description: description.trim(),
        vimeoUrl: vimeoUrl ? vimeoUrl.trim() : "",
        order: parseInt(order)
      });

      if (updateResult && updateResult.isSuccess) {
        setMessageText($msg, "Eğitim konusu başarıyla güncellendi");
        setTimeout(() => { window.location.href = `admin-training-detail.html?trainingId=${selectedTrainingId}`; }, DELAY_CONFIG._1);
      } else {
        setMessageText($msg, getApiError(updateResult, "Güncelleme başarısız oldu"));
        logErr(updateResult);
        $btn.disabled = false;
      }
    });
  }
});
