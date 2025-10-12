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

    if (!confirm(confirmMessage)) { return; }

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
    } else {
      btn.nextElementSibling.innerText = ERROR_MESSAGE_DEFAULT;
    }

    btn.disabled = false;
  });

  return $btn;
}

function createFavoriteButton(memberId, companyId, displayName) {
  let $btn = btn(null, "Favoriden Çıkar");

  $btn.addEventListener(CLICK_EVENT, async function () {
    if (!confirm(`${displayName}'i favorilerden çıkarmak istediğinize emin misiniz?`)) { return; }

    let btn = this;
    btn.disabled = true;
    btn.nextElementSibling.innerText = LOADING_MESSAGE_WAIT;

    let result = await api("CompanyFavorite/Remove", { memberId: memberId, companyId: companyId });

    if (result && result.isSuccess) {
      btn.closest("tr").remove();
    } else {
      btn.nextElementSibling.innerText = ERROR_MESSAGE_DEFAULT;
      btn.disabled = false;
    }
  });

  return $btn;
}

function createInterviewScheduleButton(memberId, companyId, displayName) {
  let $btn = btn(null, "Mülakata Davet Et");
  $btn.style.marginLeft = "8px";
  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.style.color = "#666";

    let $dateLabel = lbl("Mülakat Tarihi");
    let $dateInput = date(getTomorrow());
    $dateInput.required = true;
    $dateInput.min = new Date().toISOString().split('T')[0];
    $dateLabel.append($dateInput);

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleSchedule = async function () {
      let date = $dateInput.value;
      if (!date) {
        showModalMessage($msgDiv, "error", "Lütfen tarih seçiniz.");
        return;
      }

      let selectedDate = new Date(date);
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showModalMessage($msgDiv, "error", "Geçmiş bir tarih seçemezsiniz.");
        return;
      }

      setButtonLoading(buttons.submitBtn, true);

      let result = await api("CandidateInterview/Schedule", {
        candidateId: memberId,
        companyId: companyId,
        scheduledAt: date
      });

      if (result && result.isSuccess) {
        showModalMessage($msgDiv, "success", `${displayName} mülakata davet edildi. Tarih: ${date}`);
        setTimeout(() => { closeModal($modal); }, MODAL_AUTO_CLOSE_DELAY);
      }
      else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false, "Mülakata Davet Et");
      }
    };

    let buttons = createModalButtons("İptal", "Mülakata Davet Et",
      () => closeModal($modal),
      handleSchedule
    );

    $mbody.append($candidateLabel, $dateLabel, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("Mülakat Planla", $mbody);
  });

  return $btn;
}

function createHireCandidateButton(memberId, companyId, displayName) {
  let $btn = btn(null, "İşe Al");
  $btn.style.marginLeft = "8px";
  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.style.color = "#666";

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
