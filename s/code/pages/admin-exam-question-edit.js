onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let examQuestionId = getId("examQuestionId");
  if (!examQuestionId) {
    setMessageText($msg, "Geçersiz soru ID'si");
    return;
  }

  let result = await api("Exam/GetQuestion", { examQuestionId: examQuestionId });

  if (!result || !result.isSuccess || !result.data) {
    setMessageText($msg, "Soru yüklenemedi");
    return;
  }

  let questionData = result.data;
  let examId = questionData.examId;

  set("question", questionData.question);
  set("answers", questionData.answers);
  set("order", questionData.order || 1);

  let $answers = document.getElementById("answers");
  let $correctAnswer = document.getElementById("correctAnswer");

  function updateCorrectAnswerOptions() {
    let text = $answers.value || "";
    let lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    let currentValue = $correctAnswer.value;

    $correctAnswer.innerHTML = "";
    if (lines.length === 0) {
      $correctAnswer.innerHTML = '<option value="">Önce cevapları girin</option>';
    } else {
      $correctAnswer.innerHTML = '<option value="">Seçiniz</option>';
      for (let line of lines) {
        let opt = document.createElement("option");
        opt.value = line;
        opt.textContent = line;
        if (line === currentValue) opt.selected = true;
        $correctAnswer.appendChild(opt);
      }
    }
  }

  if ($answers) {
    $answers.addEventListener("input", updateCorrectAnswerOptions);
    updateCorrectAnswerOptions();
  }

  if (questionData.correctAnswer) {
    $correctAnswer.value = questionData.correctAnswer;
  }

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let question = val("question");
      let answers = val("answers");
      let correctAnswer = val("correctAnswer");
      let order = val("order");

      if (!question || question.trim().length < 3) {
        setMessageText($msg, "Soru en az 3 karakter olmalıdır");
        return;
      }

      if (!answers || answers.trim().length < 1) {
        setMessageText($msg, "Cevaplar zorunludur");
        return;
      }

      if (!correctAnswer || correctAnswer.trim().length < 1) {
        setMessageText($msg, "Doğru cevap zorunludur");
        return;
      }

      if (!order || parseInt(order) < 1) {
        setMessageText($msg, "Sıra en az 1 olmalıdır");
        return;
      }

      $btn.disabled = true;
      setMessageText($msg, "Güncelleniyor...");

      let updateResult = await api("Exam/UpdateQuestion", {
        examQuestionId: examQuestionId,
        examId: examId,
        question: question.trim(),
        answers: answers.trim(),
        correctAnswer: correctAnswer.trim(),
        order: parseInt(order)
      });

      if (updateResult && updateResult.isSuccess) {
        setMessageText($msg, "Soru başarıyla güncellendi");
        setTimeout(() => {
          window.location.href = `admin-exam-detail.html?examId=${examId}`;
        }, 1000);
      } else {
        setMessageText($msg, getApiError(updateResult, "Güncelleme başarısız oldu"));
        logErr(updateResult);
        $btn.disabled = false;
      }
    });
  }
});
