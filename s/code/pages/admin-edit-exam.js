onAuthReady(async () => {
  let $trainingInput = document.getElementById("trainingId");
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");
  let selectedTrainingId = null;
  let trainings = [];

  let id = getId("id");
  if (!id) {
    setMessageText($msg, "Geçersiz ID");
    return;
  }

  let result = await api("Exam/Get", { id: id });

  if (!result || !result.isSuccess || !result.data) {
    setMessageText($msg, "Sınav yüklenemedi");
    return;
  }

  let exam = result.data;
  selectedTrainingId = exam.trainingId;
  set("name", exam.name);
  set("description", exam.description);
  set("warning", exam.warning);
  set("duration", exam.duration);
  set("questionCount", exam.questionCount);
  set("pointPerQuestion", exam.pointPerQuestion);
  set("passScore", exam.passScore);

  let trainingResult = await api("Training/GetAll", {});
  if (trainingResult && trainingResult.isSuccess && trainingResult.data) {
    trainings = trainingResult.data;

    let currentTraining = trainings.find(t => t.id === exam.trainingId);
    if (currentTraining) {
      $trainingInput.value = currentTraining.name;
    }

    autocomplete(
      $trainingInput,
      trainings,
      (training, searchText) => training.name.toLowerCase().includes(searchText.toLowerCase()),
      (training) => training.name,
      (training, $input) => {
        $input.value = training.name;
        selectedTrainingId = training.id;
      }
    );
  }

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let name = val("name");
      let description = val("description");
      let warning = val("warning");
      let duration = val("duration");
      let questionCount = val("questionCount");
      let pointPerQuestion = val("pointPerQuestion");
      let passScore = val("passScore");

      if (!selectedTrainingId) {
        setMessageText($msg, "Geçersiz eğitim ID'si");
        return;
      }

      if (!name || name.length < 3) {
        setMessageText($msg, "Sınav adı en az 3 karakter olmalıdır");
        return;
      }

      if (name.length > 100) {
        setMessageText($msg, "Sınav adı en fazla 100 karakter olmalıdır");
        return;
      }

      if (description && description.length > 1000) {
        setMessageText($msg, "Açıklama en fazla 1000 karakter olmalıdır");
        return;
      }

      if (warning && warning.length > 2000) {
        setMessageText($msg, "Uyarı en fazla 2000 karakter olmalıdır");
        return;
      }

      if (!duration || parseInt(duration) <= 0) {
        setMessageText($msg, "Süre 0'dan büyük olmalıdır");
        return;
      }

      if (!questionCount || parseInt(questionCount) <= 0) {
        setMessageText($msg, "Soru sayısı 0'dan büyük olmalıdır");
        return;
      }

      if (!pointPerQuestion || parseInt(pointPerQuestion) <= 0) {
        setMessageText($msg, "Soru başına puan 0'dan büyük olmalıdır");
        return;
      }

      if (passScore === null || passScore === undefined || passScore === "" || parseInt(passScore) < 0) {
        setMessageText($msg, "Geçme notu 0'dan küçük olamaz");
        return;
      }

      $btn.disabled = true;
      setMessageText($msg, "Güncelleniyor...");

      let updateResult = await api("Exam/Update", {
        id: id,
        trainingId: selectedTrainingId,
        name: name.trim(),
        description: description ? description.trim() : "",
        warning: warning ? warning.trim() : "",
        duration: parseInt(duration),
        questionCount: parseInt(questionCount),
        pointPerQuestion: parseInt(pointPerQuestion),
        passScore: parseInt(passScore)
      });

      if (updateResult && updateResult.isSuccess) {
        setMessageText($msg, "Sınav başarıyla güncellendi");
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
