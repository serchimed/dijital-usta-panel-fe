function createBlockButton(entityId, isBlocked, displayName, blockEndpoint, unblockEndpoint, idKey = "memberId") {
  let $btn = btn(null, isBlocked ? "Engeli Kaldır" : "Engelle");
  $btn.dataset.entityId = entityId;
  $btn.dataset.isBlocked = isBlocked ? "true" : "false";

  $btn.addEventListener(CLICK_EVENT, async function () {
    let btn = this;
    let isCurrentlyBlocked = btn.dataset.isBlocked === "true";
    let endpoint = isCurrentlyBlocked ? unblockEndpoint : blockEndpoint;
    let confirmMessage = isCurrentlyBlocked
      ? `${displayName}'in engelini kaldırmak istediğinize emin misiniz?`
      : `${displayName}'i engellemek istediğinize emin misiniz?`;
    let actionText = isCurrentlyBlocked ? "Engeli Kaldır" : "Engelle";

    let $mbody = div();
    let $confirmLabel = p(confirmMessage);
    $confirmLabel.style.marginBottom = "1em";

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleBlock = async function () {
      setButtonLoading(buttons.submitBtn, true, actionText);

      btn.disabled = true;
      btn.nextElementSibling.innerText = LOADING_MESSAGE_WAIT;

      let req = {};
      req[idKey] = btn.dataset.entityId;
      let result = await api(endpoint, req);

      if (result && result.isSuccess) {
        isCurrentlyBlocked = !isCurrentlyBlocked;
        btn.dataset.isBlocked = isCurrentlyBlocked ? "true" : "false";
        btn.innerText = isCurrentlyBlocked ? "Engeli Kaldır" : "Engelle";
        btn.nextElementSibling.innerText = "";
        closeModal($modal);
      } else {
        btn.nextElementSibling.innerText = ERROR_MESSAGE_DEFAULT;
        showModalMessage($msgDiv, "error", ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false, actionText);
      }

      btn.disabled = false;
    };

    let buttons = createModalButtons("İptal", actionText,
      () => closeModal($modal),
      handleBlock
    );

    $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("Onay", $mbody);
  });

  return $btn;
}

function createShortlistButton(memberId, companyId, displayName, isShortlisted, $msgElement) {
  let $btn = btn(null, isShortlisted ? "Kısa Listeden Çıkar" : "Kısa Listeye Ekle");
  $btn.dataset.memberId = memberId;
  $btn.dataset.companyId = companyId;
  $btn.dataset.isShortlisted = isShortlisted ? "true" : "false";

  $btn.addEventListener(CLICK_EVENT, async function () {
    let btn = this;
    let isCurrentlyShortlisted = btn.dataset.isShortlisted === "true";
    let endpoint = isCurrentlyShortlisted ? "Remove" : "Add";
    let confirmMessage = isCurrentlyShortlisted
      ? `${displayName}'i kısa listeden çıkarmak istediğinize emin misiniz?`
      : `${displayName}'i kısa listenize eklemek istediğinizden emin misiniz?`;
    let successMessage = isCurrentlyShortlisted ? "Kısa listeden çıkarıldı." : "Kısa listeye başarıyla eklendi";
    let errorMessage = isCurrentlyShortlisted ? "Kısa listeden çıkarılamadı." : ERROR_MESSAGE_DEFAULT;
    let actionText = isCurrentlyShortlisted ? "Kısa Listeden Çıkar" : "Kısa Listeye Ekle";

    let $mbody = div();
    let $confirmLabel = p(confirmMessage);
    $confirmLabel.style.marginBottom = "1em";

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleShortlist = async function () {
      setButtonLoading(buttons.submitBtn, true, actionText);

      btn.disabled = true;
      let $externalMsg = $msgElement || btn.nextElementSibling;
      if ($externalMsg && $externalMsg.tagName === "P") {
        $externalMsg.textContent = LOADING_MESSAGE_WAIT;
      }

      let result = await api("CompanyShortlist/" + endpoint,
        { memberId: btn.dataset.memberId, companyId: btn.dataset.companyId }
      );

      if (result && result.isSuccess) {
        isCurrentlyShortlisted = !isCurrentlyShortlisted;
        btn.dataset.isShortlisted = isCurrentlyShortlisted ? "true" : "false";
        btn.innerText = isCurrentlyShortlisted ? "Kısa Listeden Çıkar" : "Kısa Listeye Ekle";

        if ($externalMsg && $externalMsg.tagName === "P") {
          $externalMsg.textContent = successMessage;
        }

        closeModal($modal);

        setTimeout(() => {
          if ($externalMsg && $externalMsg.tagName === "P") {
            $externalMsg.textContent = "";
          }
        }, 2345);

        if (!isCurrentlyShortlisted && btn.closest("tr")) {
          btn.closest("tr").remove();
        }
      } else {
        if ($externalMsg && $externalMsg.tagName === "P") {
          $externalMsg.textContent = errorMessage;
        }
        showModalMessage($msgDiv, "error", errorMessage);
        setButtonLoading(buttons.submitBtn, false, actionText);
      }

      btn.disabled = false;
    };

    let buttons = createModalButtons("İptal", actionText,
      () => closeModal($modal),
      handleShortlist
    );

    $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("Onay", $mbody);
  });

  return $btn;
}

function createInterviewReportButton(candidateId, companyId, displayName, companyName) {
  let $btn = btn("action-btn-secondary", "Mülakat Sonucu Bildir");

  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.className = "modal-subdued";

    let $dateLabel = lbl("Mülakat Yapıldığı Tarih");
    let $dateInput = date(new Date().toISOString().split('T')[0]);
    $dateInput.required = true;
    $dateInput.max = new Date().toISOString().split('T')[0];
    $dateLabel.append($dateInput);

    let $resultLabel = lbl("Mülakat Sonucu");
    $resultLabel.className = "sel";
    let $resultInput = inp();
    $resultInput.placeholder = "Sonuç seçiniz...";
    $resultInput.required = true;
    $resultInput.readOnly = true;
    let $resultList = div();
    $resultList.id = "resultList";
    $resultLabel.append($resultInput, $resultList);

    let selectedResult = "";

    $resultInput.addEventListener(CLICK_EVENT, function () {
      if ($resultList.children.length === 0) {
        INTERVIEW_RESULTS.forEach(r => {
          let $item = div();
          $item.textContent = r;
          $item.addEventListener(CLICK_EVENT, function () {
            $resultInput.value = r;
            selectedResult = r;
            $resultList.classList.remove("show");
          });
          $resultList.appendChild($item);
        });
      }
      $resultList.classList.toggle("show");
    });

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleReport = async function () {
      let dateValue = $dateInput.value;
      if (!dateValue) {
        showModalMessage($msgDiv, "error", "Lütfen mülakat tarihini giriniz.");
        return;
      }

      if (!selectedResult) {
        showModalMessage($msgDiv, "error", "Lütfen mülakat sonucunu seçiniz.");
        return;
      }

      let selectedDate = new Date(dateValue);
      let today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        showModalMessage($msgDiv, "error", "Gelecek bir tarih seçemezsiniz.");
        return;
      }

      setButtonLoading(buttons.submitBtn, true);

      let result = await api("CandidateInterview/Report", {
        candidateId: candidateId,
        companyId: companyId,
        interviewedAt: dateValue,
        result: selectedResult
      });

      if (result && result.isSuccess) {
        showModalMessage($msgDiv, "success", "Mülakat sonucu başarıyla bildirildi!");
        setTimeout(() => { closeModal($modal); }, MODAL_AUTO_CLOSE_DELAY);
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false, "Sonucu Bildir");
      }
    };

    let buttons = createModalButtons("İptal", "Sonucu Bildir",
      () => closeModal($modal),
      handleReport
    );

    $mbody.append($candidateLabel, $dateLabel, $resultLabel, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("Mülakat Sonucu Bildir", $mbody);
  });

  return $btn;
}


function createHireCandidateButton(memberId, companyId, displayName, isInterviewResulted) {
  let $btn = btn("action-btn-secondary", "İşe Al");

  if (!isInterviewResulted) {
    $btn.disabled = true;
    $btn.title = "Mülakat sonucu bildirilmeden işe alınamaz";
  }

  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.className = "modal-subdued";

    let $urlLabel = lbl("İşe Alım Evrak Linki (Google Drive URL)");
    let $urlInput = url("https://drive.google.com/...");
    $urlInput.required = true;
    $urlLabel.append($urlInput);

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleHire = async function () {
      let url = $urlInput.value.trim();
      if (!url || !checkUrl(url)) {
        showModalMessage($msgDiv, "error", "Lütfen geçerli bir evrak linkini giriniz.");
        return;
      }

      setButtonLoading(buttons.submitBtn, true);

      let result = await api("Candidate/Hire", {
        candidateId: memberId,
        companyId: companyId,
        hirePaperDriveUrl: url
      });

      if (result && result.isSuccess) {
        showModalMessage($msgDiv, "success", `${displayName} başarıyla işe alındı!`);
        setTimeout(() => { closeModal($modal); }, MODAL_AUTO_CLOSE_DELAY);
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false, "İşe Al");
      }
    };

    let buttons = createModalButtons("İptal", "İşe Al", () => closeModal($modal), handleHire);

    $mbody.append($candidateLabel, $urlLabel, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("Aday İşe Al", $mbody);
  });

  return $btn;
}
