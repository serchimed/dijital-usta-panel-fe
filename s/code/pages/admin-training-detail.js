onAuthReady(async () => {
  let trainingId = getId("trainingId");
  if (!trainingId) { return; }

  let result = await api("Training/Get", { trainingId: trainingId });

  if (!result || !result.isSuccess || !result.data) {
    return;
  }

  let training = result.data;

  document.getElementById("name").textContent = training.name || "";
  document.getElementById("description").textContent = training.description || "";

  let $image = document.getElementById("image");
  if (training.image) {
    $image.src = training.image;
  } else {
    $image.style.display = "none";
  }

  let $addSubjectLink = document.getElementById("addSubjectLink");
  if ($addSubjectLink) {
    $addSubjectLink.href = `admin-training-subject-add.html?trainingId=${trainingId}`;
  }

  if (training.subjects && training.subjects.length > 0) {
    let $main = document.querySelector("main");

    for (let subject of training.subjects) {
      let $details = document.createElement("details");

      let $summary = document.createElement("summary");
      $summary.textContent = `${subject.order}. ${subject.name}`;
      $details.append($summary);

      let $div = document.createElement("div");

      let $editLink = document.createElement("a");
      $editLink.href = `admin-training-subject-edit.html?trainingSubjectId=${subject.id}`;
      $editLink.target = "_blank";
      $editLink.textContent = "Düzenle";
      let $deleteBtn = createDeleteButton(subject.id, subject.name, "TrainingSubject/Delete", "trainingSubjectId");
      let $editLabel = document.createElement("label");
      $editLabel.append($editLink, " ", $deleteBtn);
      $div.append($editLabel);

      let $description = document.createElement("label");
      $description.innerHTML = `Açıklama: <span>${subject.description || "-"}</span>`;
      $div.append($description);

      if (subject.vimeoUrl) {
        let $vimeoLabel = document.createElement("label");
        $vimeoLabel.textContent = "Video";
        let $iframe = document.createElement("iframe");
        $iframe.src = subject.vimeoUrl;
        $iframe.width = "640";
        $iframe.height = "360";
        $iframe.frameBorder = "0";
        $iframe.allow = "autoplay; fullscreen; picture-in-picture";
        $iframe.allowFullscreen = true;
        $vimeoLabel.append($iframe);
        $div.append($vimeoLabel);
      }

      $details.append($div);
      $main.append($details);
    }
  }
});
