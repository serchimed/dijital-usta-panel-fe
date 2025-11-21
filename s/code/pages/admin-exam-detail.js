onAuthReady(async () => {
  let examId = getId("examId");
  await fillSpans("Exam/Get", "examId");

  let $editLink = document.getElementById("editLink");
  if ($editLink && examId) {
    $editLink.href = `admin-edit-exam.html?examId=${examId}`;
  }

  let $addQuestionLink = document.getElementById("addQuestionLink");
  if ($addQuestionLink && examId) {
    $addQuestionLink.href = `admin-exam-question-add.html?examId=${examId}`;
  }

  let questionsResult = await api("Exam/GetQuestions", { examId: examId });

  if (questionsResult && questionsResult.isSuccess && questionsResult.data && questionsResult.data.length > 0) {
    let $main = document.querySelector("main");

    for (let question of questionsResult.data) {
      let $details = document.createElement("details");

      let $summary = document.createElement("summary");
      $summary.textContent = `${question.order || ""}. ${question.question}`;
      $details.append($summary);

      let $div = document.createElement("div");

      let $editLink = document.createElement("a");
      $editLink.href = `admin-exam-question-edit.html?examQuestionId=${question.id}`;
      $editLink.target = "_blank";
      $editLink.textContent = "Düzenle";
      let $deleteBtn = createDeleteButton(question.id, question.question, "Exam/DeleteQuestion", "examQuestionId");
      let $editLabel = document.createElement("label");
      $editLabel.append($editLink, " ", $deleteBtn);
      $div.append($editLabel);

      let $answersLabel = document.createElement("label");
      $answersLabel.innerHTML = `Cevaplar: <span>${question.answers || "-"}</span>`;
      $div.append($answersLabel);

      let $correctAnswerLabel = document.createElement("label");
      $correctAnswerLabel.innerHTML = `Doğru Cevap: <span>${question.correctAnswer || "-"}</span>`;
      $div.append($correctAnswerLabel);

      $details.append($div);
      $main.append($details);
    }
  }
});
