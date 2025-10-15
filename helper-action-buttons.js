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

function createFavoriteButton(memberId, companyId, displayName, isFavorited, $msgElement) {
  let $btn = btn(null, isFavorited ? "Favorilerden Çıkar" : "Favorilere Ekle");
  $btn.dataset.memberId = memberId;
  $btn.dataset.companyId = companyId;
  $btn.dataset.isFavorited = isFavorited ? "true" : "false";

  $btn.addEventListener(CLICK_EVENT, async function () {
    let btn = this;
    let isCurrentlyFavorited = btn.dataset.isFavorited === "true";
    let endpoint = isCurrentlyFavorited ? "Remove" : "Add";
    let confirmMessage = isCurrentlyFavorited
      ? `${displayName}'i favorilerden çıkarmak istediğinize emin misiniz?`
      : `${displayName}'i favorilerinize eklemek istediğinizden emin misiniz?`;
    let successMessage = isCurrentlyFavorited ? "Favorilerden çıkarıldı." : "Favorilere başarıyla eklendi";
    let errorMessage = isCurrentlyFavorited ? "Favorilerden çıkarılamadı." : ERROR_MESSAGE_DEFAULT;

    if (!confirm(confirmMessage)) { return; }

    let result = await apiBtn(btn, "CompanyFavorite/" + endpoint,
      { memberId: btn.dataset.memberId, companyId: btn.dataset.companyId },
      successMessage,
      errorMessage,
      null,
      $msgElement
    );

    if (result && result.isSuccess) {
      isCurrentlyFavorited = !isCurrentlyFavorited;
      btn.dataset.isFavorited = isCurrentlyFavorited ? "true" : "false";
      btn.innerText = isCurrentlyFavorited ? "Favorilerden Çıkar" : "Favorilere Ekle";

      setTimeout(() => {
        let $msg = $msgElement || btn.nextElementSibling;
        if ($msg && $msg.tagName === "P") {
          $msg.textContent = "";
        }
      }, 2345);

      if (!isCurrentlyFavorited && btn.closest("tr")) {
        btn.closest("tr").remove();
      }
    }
  });

  return $btn;
}

function createInterviewCancelButton(memberId, companyId, displayName, $msgElement) {
  let $btn = btn("action-btn-secondary", "Mülakat İptal");

  $btn.addEventListener(CLICK_EVENT, async function () {
    if (!confirm(`${displayName} ile planlanmış mülakatı iptal etmek istediğinize emin misiniz?`)) { return; }

    await apiBtn(this, "CandidateInterview/Cancel",
      { candidateId: memberId, companyId: companyId },
      "Mülakat iptal edildi.",
      "Mülakat iptal edilemedi.",
      null,
      $msgElement
    );
  });

  return $btn;
}

function createInterviewAddButton(candidateId, companyId, companyName, candidateName) {
  let $btn = btn(null, "Mülakata Davet Et");

  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $warningText = p("E-posta bildirimi gönderilecektir, emin olmadan durumu güncellemeyin.");
    $warningText.style.color = "#d9534f";
    $warningText.style.fontSize = "0.9em";
    $warningText.style.fontWeight = "bold";
    $warningText.style.marginBottom = "1em";

    let $infoLabel = lbl(`${candidateName} adayına ${companyName} firması için mülakat planlamak üzeresiniz.`);
    $infoLabel.className = "modal-subdued";

    let $dateLabel = lbl("Tahmini Mülakat Tarihi");
    let $dateInput = date(getTomorrow());
    $dateInput.required = true;
    $dateInput.min = new Date().toISOString().split('T')[0];
    $dateLabel.append($dateInput);

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleAdd = async function () {
      let dateValue = $dateInput.value;
      if (!dateValue) {
        showModalMessage($msgDiv, "error", "Lütfen tarih seçiniz.");
        return;
      }

      let selectedDate = new Date(dateValue);
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showModalMessage($msgDiv, "error", "Geçmiş bir tarih seçemezsiniz.");
        return;
      }

      setButtonLoading(buttons.submitBtn, true);

      let result = await apiBtn(buttons.submitBtn, "CandidateInterview/Add", {
        candidateId: candidateId,
        companyId: companyId,
        scheduledAt: dateValue
      }, `Mülakat daveti gönderildi. Tahmini tarih: ${dateValue}`, ERROR_MESSAGE_DEFAULT);

      if (result && result.isSuccess) {
        setTimeout(() => { closeModal($modal); }, MODAL_AUTO_CLOSE_DELAY);
      } else {
        setButtonLoading(buttons.submitBtn, false, "Mülakata Davet Et");
      }
    };

    let buttons = createModalButtons("İptal", "Mülakata Davet Et",
      () => closeModal($modal),
      handleAdd
    );

    $mbody.append($warningText, $infoLabel, $dateLabel, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("Mülakat Daveti Gönder", $mbody);
  });

  return $btn;
}

function createHireCandidateButton(memberId, companyId, displayName) {
  let $btn = btn("action-btn-secondary", "İşe Al");
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
