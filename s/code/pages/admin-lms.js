onAuthReady(async () => {
  let trainingTbody = document.getElementById("Training");
  if (trainingTbody) {
    trainingTbody.textContent = "";
    trainingTbody.append(getMsgLine("Yükleniyor..."));

    let trainingResult = await api("Training/GetAll", {});

    if (trainingResult && trainingResult.isSuccess) {
      trainingTbody.textContent = "";

      if (!trainingResult.data || trainingResult.data.length === 0) {
        trainingTbody.append(getMsgLine("Veri yok"));
      } else {
        for (let training of trainingResult.data) {
          let $tr = tr();

          let $tdName = td();
          let $nameLink = a(training.name || "", `admin-training-detail.html?trainingId=${training.id}`);
          $nameLink.target = "_blank";
          $tdName.append($nameLink);
          $tdName.setAttribute("data-label", "Eğitim Adı");
          $tr.append($tdName);

          let $tdDescription = td(training.description || "");
          $tdDescription.setAttribute("data-label", "Açıklama");
          $tr.append($tdDescription);

          let $actionsCell = td();
          let $editLink = a("Düzenle", `admin-edit-training.html?id=${training.id}`);
          $editLink.target = "_blank";
          let $deleteBtn = createDeleteButton(training.id, training.name, "Training/Delete", "id");
          $actionsCell.append($editLink, document.createElement("br"), $deleteBtn, p());
          $tr.append($actionsCell);

          trainingTbody.append($tr);
        }
      }
    } else {
      trainingTbody.textContent = "";
      trainingTbody.append(getMsgLine("Veri yüklenemedi"));
      logErr(trainingResult);
    }
  }

  let questionnaireTbody = document.getElementById("Questionnaire");
  if (questionnaireTbody) {
    questionnaireTbody.textContent = "";
    questionnaireTbody.append(getMsgLine("Yükleniyor..."));

    let questionnaireResult = await api("Questionnaire/GetAll", {});

    if (questionnaireResult && questionnaireResult.isSuccess) {
      questionnaireTbody.textContent = "";

      if (!questionnaireResult.data || questionnaireResult.data.length === 0) {
        questionnaireTbody.append(getMsgLine("Veri yok"));
      } else {
        for (let questionnaire of questionnaireResult.data) {
          let $tr = tr();

          let $tdName = td();
          let $nameLink = a(questionnaire.name || "", `admin-questionnaire-detail.html?questionnaireId=${questionnaire.id}`);
          $nameLink.target = "_blank";
          $tdName.append($nameLink);
          $tdName.setAttribute("data-label", "Anket Adı");
          $tr.append($tdName);

          let $tdDescription = td(questionnaire.description || "");
          $tdDescription.setAttribute("data-label", "Açıklama");
          $tr.append($tdDescription);

          let $actionsCell = td();
          let $editLink = a("Düzenle", `admin-edit-questionnaire.html?questionnaireId=${questionnaire.id}`);
          $editLink.target = "_blank";
          let $deleteBtn = createDeleteButton(questionnaire.id, questionnaire.name, "Questionnaire/Delete", "id");
          $actionsCell.append($editLink, document.createElement("br"), $deleteBtn, p());
          $tr.append($actionsCell);

          questionnaireTbody.append($tr);
        }
      }
    } else {
      questionnaireTbody.textContent = "";
      questionnaireTbody.append(getMsgLine("Veri yüklenemedi"));
      logErr(questionnaireResult);
    }
  }

  let examTbody = document.getElementById("Exam");
  if (examTbody) {
    examTbody.textContent = "";
    examTbody.append(getMsgLine("Yükleniyor..."));

    let examResult = await api("Exam/GetAll", {});

    if (examResult && examResult.isSuccess) {
      examTbody.textContent = "";

      if (!examResult.data || examResult.data.length === 0) {
        examTbody.append(getMsgLine("Veri yok"));
      } else {
        for (let exam of examResult.data) {
          let $tr = tr();

          let $tdName = td();
          let $nameLink = a(exam.name || "", `admin-exam-detail.html?examId=${exam.id}`);
          $nameLink.target = "_blank";
          $tdName.append($nameLink);
          $tdName.setAttribute("data-label", "Sınav Adı");
          $tr.append($tdName);

          let $tdDescription = td(exam.description || "");
          $tdDescription.setAttribute("data-label", "Açıklama");
          $tr.append($tdDescription);

          let $actionsCell = td();
          let $editLink = a("Düzenle", `admin-edit-exam.html?id=${exam.id}`);
          $editLink.target = "_blank";
          let $deleteBtn = createDeleteButton(exam.id, exam.name, "Exam/Delete", "id");
          $actionsCell.append($editLink, document.createElement("br"), $deleteBtn, p());
          $tr.append($actionsCell);

          examTbody.append($tr);
        }
      }
    } else {
      examTbody.textContent = "";
      examTbody.append(getMsgLine("Veri yüklenemedi"));
      logErr(examResult);
    }
  }

  setFilters();
});
