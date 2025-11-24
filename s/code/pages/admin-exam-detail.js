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

  let questionsResult = await api("Exam/GetQuestionsForExam", { examId: examId });

  if (questionsResult && questionsResult.isSuccess && questionsResult.data && questionsResult.data.length > 0) {
    let $main = document.querySelector("main");

    for (let question of questionsResult.data) {
      let $details = details();

      let $summary = smry(`${question.order || ""}. ${question.questionText}`);
      $details.append($summary);

      let $div = document.createElement("div");

      let $editLink = document.createElement("a");
      $editLink.href = `admin-exam-question-edit.html?examQuestionId=${question.id}`;
      $editLink.target = "_blank";
      $editLink.textContent = "Düzenle";
      let $deleteBtn = createDeleteButton(question.id, question.questionText, "Exam/DeleteQuestion", "examQuestionId");
      let $editLabel = document.createElement("label");
      $editLabel.append($editLink, " ", $deleteBtn);
      $div.append($editLabel);

      let $answersLabel = document.createElement("label");
      $answersLabel.textContent = "Cevaplar:";

      if (question.answers && question.answers.length > 0) {
        let $ul = document.createElement("ul");
        for (let answer of question.answers) {
          let $li = document.createElement("li");
          $li.textContent = answer.answerText;
          $ul.append($li);
        }
        $answersLabel.append($ul);
      } else {
        let $span = document.createElement("span");
        $span.textContent = "-";
        $answersLabel.append($span);
      }

      $div.append($answersLabel);

      $details.append($div);
      $main.append($details);
    }
  }
});
