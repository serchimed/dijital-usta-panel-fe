onAuthReady(async () => {
  await loadTables("#Training");
  let trainingTbody = document.getElementById("Training");
  if (trainingTbody) {
    let trainingResult = await api("Training/GetAll", {});
    if (trainingResult && trainingResult.isSuccess) {
      for (let training of trainingResult.data) {
        let $tr = trainingTbody.querySelector(`tr[data-id="${training.id}"]`);
        if ($tr) {
          let $editLink = tda("Düzenle", `admin-edit-training.html?id=${training.id}`, "");
          let $deleteBtn = createDeleteButton(training.id, training.name, "Training/Delete", "id");
          $tr.append($editLink);
          $tr.append(tdbtn($deleteBtn, ""));
        }
      }
    } else { logErr(trainingResult); }
  }

  await loadTables("#Questionnaire");
  let questionnaireTbody = document.getElementById("Questionnaire");
  if (questionnaireTbody) {
    let questionnaireResult = await api("Questionnaire/GetAll", {});
    if (questionnaireResult && questionnaireResult.isSuccess) {
      for (let questionnaire of questionnaireResult.data) {
        let $tr = questionnaireTbody.querySelector(`tr[data-id="${questionnaire.id}"]`);
        if ($tr) {
          let $editLink = tda("Düzenle", `admin-edit-questionnaire.html?id=${questionnaire.id}`, "");
          let $deleteBtn = createDeleteButton(questionnaire.id, questionnaire.name, "Questionnaire/Delete", "id");
          $tr.append($editLink);
          $tr.append(tdbtn($deleteBtn, ""));
        }
      }
    } else { logErr(questionnaireResult); }
  }

  await loadTables("#Exam");
  let examTbody = document.getElementById("Exam");
  if (examTbody) {
    let examResult = await api("Exam/GetAll", {});
    if (examResult && examResult.isSuccess) {
      for (let exam of examResult.data) {
        let $tr = examTbody.querySelector(`tr[data-id="${exam.id}"]`);
        if ($tr) {
          let $editLink = tda("Düzenle", `admin-edit-exam.html?id=${exam.id}`, "");
          let $deleteBtn = createDeleteButton(exam.id, exam.name, "Exam/Delete", "id");
          $tr.append($editLink);
          $tr.append(tdbtn($deleteBtn, ""));
        }
      }
    } else { logErr(examResult); }
  }

  setFilters();
});
