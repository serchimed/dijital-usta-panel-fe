onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let examId = getId("examId");
  if (!examId) {
    setMessageText($msg, "Geçersiz sınav ID'si");
    return;
  }

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
  }

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let question = val("question");
      let answers = val("answers");
      let correctAnswer = val("correctAnswer");

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

      $btn.disabled = true;
      setMessageText($msg, "Kaydediliyor...");

      let result = await api("Exam/AddQuestion", {
        examId: examId,
        question: question.trim(),
        answers: answers.trim(),
        correctAnswer: correctAnswer.trim()
      });

      if (result && result.isSuccess) {
        setMessageText($msg, "Soru başarıyla eklendi");
        setTimeout(() => {
          window.location.href = `admin-exam-detail.html?examId=${examId}`;
        }, 1000);
      } else {
        setMessageText($msg, getApiError(result, "Kayıt başarısız oldu"));
        logErr(result);
        $btn.disabled = false;
      }
    });
  }
});
