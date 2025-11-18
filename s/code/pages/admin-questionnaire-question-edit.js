onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let questionnaireQuestionId = getId("questionnaireQuestionId");
  if (!questionnaireQuestionId) {
    setMessageText($msg, "Geçersiz soru ID'si");
    return;
  }

  let result = await api("QuestionnaireQuestion/Get", { questionnaireQuestionId: questionnaireQuestionId });

  if (!result || !result.isSuccess || !result.data) {
    setMessageText($msg, "Soru yüklenemedi");
    return;
  }

  let question = result.data;
  let questionnaireId = question.questionnaireId;

  set("questionText", question.questionText);
  document.getElementById("isRequired").checked = question.isRequired || false;
  set("maxSelections", question.maxSelections || 0);

  if (question.answers && question.answers.length > 0) {
    let answersText = question.answers.map(a => a.answerText).join('\n');
    set("answers", answersText);
  }

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let questionText = val("questionText");
      let isRequired = document.getElementById("isRequired").checked;
      let maxSelections = val("maxSelections");
      let answersText = val("answers");

      if (!questionText || questionText.trim().length < 3) {
        setMessageText($msg, "Soru metni en az 3 karakter olmalıdır");
        return;
      }

      let answers = [];
      if (answersText && answersText.trim()) {
        let lines = answersText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        answers = lines.map((line, index) => ({
          answerText: line,
          order: index + 1
        }));
      }

      $btn.disabled = true;
      setMessageText($msg, "Güncelleniyor...");

      let updateResult = await api("QuestionnaireQuestion/Update", {
        questionnaireQuestionId: questionnaireQuestionId,
        questionnaireId: questionnaireId,
        questionText: questionText.trim(),
        questionType: question.questionType,
        isRequired: isRequired,
        maxSelections: maxSelections ? parseInt(maxSelections) : 0,
        answers: answers
      });

      if (updateResult && updateResult.isSuccess) {
        setMessageText($msg, "Soru başarıyla güncellendi");
        setTimeout(() => {
          window.location.href = `admin-questionnaire-detail.html?questionnaireId=${questionnaireId}`;
        }, 1000);
      } else {
        setMessageText($msg, "Güncelleme başarısız oldu");
        logErr(updateResult);
        $btn.disabled = false;
      }
    });
  }
});
