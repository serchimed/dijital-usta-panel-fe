onAuthReady(async () => {
  let $btn = document.querySelector("main button");
  let $msg = document.querySelector("main p");

  let questionnaireId = getId("questionnaireId");
  if (!questionnaireId) {
    setMessageText($msg, "Geçersiz anket ID'si");
    return;
  }

  // Handle question type change to hide/show fields
  let questionTypeSelect = document.getElementById("questionType");
  let maxSelectionsLabel = document.getElementById("maxSelectionsLabel");
  let answersLabel = document.getElementById("answersLabel");

  if (questionTypeSelect) {
    questionTypeSelect.addEventListener("change", function () {
      let selectedType = questionTypeSelect.value;
      if (selectedType && selectedType.toLowerCase() === 'text') {
        if (maxSelectionsLabel) maxSelectionsLabel.style.display = 'none';
        if (answersLabel) answersLabel.style.display = 'none';
      } else {
        if (maxSelectionsLabel) maxSelectionsLabel.style.display = '';
        if (answersLabel) answersLabel.style.display = '';
      }
    });
  }

  if ($btn) {
    $btn.addEventListener(CLICK_EVENT, async function () {
      let questionText = val("questionText");
      let questionType = val("questionType");
      let isRequired = document.getElementById("isRequired").checked;
      let maxSelections = val("maxSelections");
      let answersText = val("answers");

      if (!questionText || questionText.trim().length < 3) {
        setMessageText($msg, "Soru metni en az 3 karakter olmalıdır");
        return;
      }

      if (!questionType) {
        setMessageText($msg, "Soru tipi seçilmelidir");
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
      setMessageText($msg, "Kaydediliyor...");

      let result = await api("QuestionnaireQuestion/Add", {
        questionnaireId: questionnaireId,
        questionText: questionText.trim(),
        questionType: questionType,
        isRequired: isRequired,
        maxSelections: maxSelections ? parseInt(maxSelections) : 0,
        answers: answers
      });

      if (result && result.isSuccess) {
        setMessageText($msg, "Soru başarıyla eklendi");
        setTimeout(() => {
          window.location.href = `admin-questionnaire-detail.html?questionnaireId=${questionnaireId}`;
        }, 1000);
      } else {
        setMessageText($msg, "Kayıt başarısız oldu");
        logErr(result);
        $btn.disabled = false;
      }
    });
  }
});
