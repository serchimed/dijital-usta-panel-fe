onAuthReady(async () => {
  await fillSpans("Questionnaire/Get", "questionnaireId");

  let questionnaireId = getId("questionnaireId");
  if (!questionnaireId) { return; }

  let questionsResult = await api("QuestionnaireQuestion/GetAll", { questionnaireId: questionnaireId });

  if (questionsResult && questionsResult.isSuccess && questionsResult.data) {
    let $main = document.querySelector("main");

    let $questionCount = document.getElementById("questionCount");
    if ($questionCount) {
      $questionCount.textContent = questionsResult.data.length;
    }

    for (let question of questionsResult.data) {
      let $details = document.createElement("details");

      let $summary = document.createElement("summary");
      $summary.textContent = `${question.order}. ${question.questionText}`;
      $details.append($summary);

      let $div = document.createElement("div");

      let $editLink = document.createElement("a");
      $editLink.href = `admin-questionnaire-question-edit.html?questionnaireQuestionId=${question.id}`;
      $editLink.target = "_blank";
      $editLink.textContent = "Düzenle";
      let $editLabel = document.createElement("label");
      $editLabel.append($editLink);
      $div.append($editLabel);

      let $questionType = document.createElement("label");
      $questionType.innerHTML = `Soru Tipi: <span>${question.questionType || "-"}</span>`;
      $div.append($questionType);

      let $isRequired = document.createElement("label");
      $isRequired.innerHTML = `Zorunlu: <span>${question.isRequired ? "Evet" : "Hayır"}</span>`;
      $div.append($isRequired);

      if (question.maxSelections) {
        let $maxSelections = document.createElement("label");
        $maxSelections.innerHTML = `Maksimum Seçim: <span>${question.maxSelections}</span>`;
        $div.append($maxSelections);
      }

      if (question.answers && question.answers.length > 0) {
        let $answersLabel = document.createElement("label");
        $answersLabel.textContent = "Cevaplar";

        let $table = document.createElement("table");
        let $thead = document.createElement("thead");
        let $theadTr = document.createElement("tr");
        let $thOrder = document.createElement("th");
        $thOrder.textContent = "Sıra";
        let $thAnswer = document.createElement("th");
        $thAnswer.textContent = "Cevap";
        $theadTr.append($thOrder, $thAnswer);
        $thead.append($theadTr);
        $table.append($thead);

        let $tbody = document.createElement("tbody");
        for (let answer of question.answers) {
          let $tr = document.createElement("tr");
          let $tdOrder = document.createElement("td");
          $tdOrder.textContent = answer.order;
          $tdOrder.setAttribute("data-label", "Sıra");
          let $tdAnswer = document.createElement("td");
          $tdAnswer.textContent = answer.answerText;
          $tdAnswer.setAttribute("data-label", "Cevap");
          $tr.append($tdOrder, $tdAnswer);
          $tbody.append($tr);
        }
        $table.append($tbody);

        $answersLabel.append($table);
        $div.append($answersLabel);
      }

      $details.append($div);
      $main.append($details);
    }
  }
});
