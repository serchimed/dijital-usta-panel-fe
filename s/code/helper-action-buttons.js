function setMessageText($element, text) {
  if ($element && $element.tagName === "P") {
    $element.textContent = text;
  }
}

function createInviteInfoCell(entity, config) {
  let inviteText = "-";
  let $tdInvite = td(null);
  $tdInvite.setAttribute("data-label", "Davet Bilgisi");

  let isAccepted = entity[config.isAcceptedKey];
  let acceptedAt = entity[config.acceptedAtKey];

  if (isAccepted) {
    if (acceptedAt && acceptedAt !== "0001-01-01T00:00:00") {
      inviteText = formatDateLong(acceptedAt) + " tarihinde davet kabul edildi";
    } else {
      inviteText = "Davet kabul edildi";
    }
    $tdInvite.textContent = inviteText;
  } else {
    inviteText = "Davet beklemede";
    $tdInvite.textContent = inviteText;

    let $btnResend = btn("btn-act", "Davet Gönder");
    $btnResend.style.marginTop = "8px";
    $btnResend.style.marginBottom = "15px";
    $btnResend.addEventListener(CLICK_EVENT, async function () {
      let $msg = this.nextElementSibling;
      if (!$msg || $msg.tagName !== "P") {
        $msg = p();
        this.after($msg);
      }

      let $mbody = div();
      let $confirmLabel = p("Davet e-postası göndermek istediğinize emin misiniz?");
      let $msgDiv = div(CSS_CLASSES.modalMessage);
      let $modal;

      let handleSend = async () => {
        setButtonLoading(buttons.submitBtn, true);

        let params = {};
        params[config.idParamKey] = entity.id;

        let result = await api(config.endpoint, params);
        if (result && result.isSuccess) {
          showSuccessAndClose($msgDiv, $modal, "Davet e-postası gönderildi.");
          $msg.textContent = "Davet e-postası gönderildi.";
          $msg.className = "success";
        } else {
          showModalMessage($msgDiv, "error", result?.message || "E-posta gönderilemedi.");
          setButtonLoading(buttons.submitBtn, false);
        }
      };

      let buttons = createModalButtons("İptal", "Gönder", () => closeModal($modal), handleSend);
      $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
      $modal = createModal("Davet Gönder", $mbody);
    });
    $tdInvite.append(document.createElement("br"), $btnResend, p());
  }

  return $tdInvite;
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function isDateInFuture(dateString) {
  let selectedDate = new Date(dateString);
  let today = new Date();
  today.setHours(23, 59, 59, 999);
  return selectedDate > today;
}

function setBtnState($btn, isEnabled, disabledMessage = "") {
  if (!$btn) return;
  $btn.disabled = !isEnabled;
  $btn.title = isEnabled ? "" : disabledMessage;

  if (isEnabled) {
    $btn.classList.remove("btn-gray");
    $btn.classList.add("btn-act");
  } else {
    $btn.classList.remove("btn-act");
    $btn.classList.add("btn-gray");
  }
}

function showSuccessAndClose($msgDiv, $modal, message) {
  showModalMessage($msgDiv, "success", message);
  setTimeout(() => closeModal($modal), DELAY_2);
}

function createBlockButton(entityId, isBlocked, entityName, blockEndpoint, unblockEndpoint, idKey = "memberId", btnBlockText = "Engelle", btnUnblockText = "Engeli Kaldır"  ) {
  let $btn = btn("btn-act", isBlocked ? btnUnblockText : btnBlockText);
  $btn.dataset.entityId = entityId;
  $btn.dataset.isBlocked = isBlocked;

  $btn.addEventListener(CLICK_EVENT, async function () {
    let btn = this;
    let isCurrentlyBlocked = btn.dataset.isBlocked === "true";
    let endpoint = isCurrentlyBlocked ? unblockEndpoint : blockEndpoint;
    let confirmMessage = isCurrentlyBlocked
      ? `${entityName}'in engelini kaldırmak istediğinize emin misiniz?`
      : `${entityName}'i engellemek istediğinize emin misiniz?`;

    let $mbody = div();
    let $confirmLabel = p(confirmMessage);

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleBlock = async function () {
      setButtonLoading(buttons.submitBtn, true);
      setMessageText(btn.nextElementSibling, LOADING_MESSAGE_WAIT);

      let req = {};
      req["memberId"] = USER.id;
      req[idKey] = btn.dataset.entityId;

      let result = await api(endpoint, req);
      if (result && result.isSuccess) {
        isCurrentlyBlocked = !isCurrentlyBlocked;
        btn.dataset.isBlocked = isCurrentlyBlocked;
        btn.innerText = isCurrentlyBlocked ? "Engeli Kaldır" : "Engelle";
        setMessageText(btn.nextElementSibling, "");
        closeModal($modal);
      } else {
        setMessageText(btn.nextElementSibling, ERROR_MESSAGE_DEFAULT);
        showModalMessage($msgDiv, "error", ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false);
      }
    };

    let buttons = createModalButtons("İptal", isCurrentlyBlocked ? "Engeli Kaldır" : "Engelle", () => closeModal($modal), handleBlock);
    $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("Onay", $mbody);
  });

  let $wrapper = div();
  $wrapper.append($btn, p());
  return $wrapper;
}

function createShortlistButton(memberId, companyId, displayName, isShortlisted, $msgElement, $interviewBtn, isInterviewResulted, isHired, isHireInformed) {
  let isDisabled = isHired || isHireInformed || isInterviewResulted;
  let btnClass = isDisabled ? "btn-gray" : "btn-act";
  let $btn = btn(btnClass, isShortlisted ? "Kısa Listeden Çıkar" : "Kısa Listeye Ekle");
  $btn.dataset.memberId = memberId;
  $btn.dataset.companyId = companyId;
  $btn.dataset.isShortlisted = isShortlisted;

  if (isHired) {
    $btn.disabled = true;
    $btn.title = "Aday işe alındığı için kısa liste değiştirilemez";
  } else if (isHireInformed) {
    $btn.disabled = true;
    $btn.title = "Adayın işe alındığı bildirildiği için kısa liste değiştirilemez";
  } else if (isInterviewResulted) {
    $btn.disabled = true;
    $btn.title = "Mülakat sonucu bildirildiği için kısa liste değiştirilemez";
  }

  $btn.addEventListener(CLICK_EVENT, async function () {
    let btn = this;
    let isCurrentlyShortlisted = btn.dataset.isShortlisted === "true";
    let endpoint = isCurrentlyShortlisted ? "Remove" : "Add";
    let confirmMessage = isCurrentlyShortlisted
      ? `${displayName}'i kısa listeden çıkarmak istediğinize emin misiniz?`
      : `${displayName}'i kısa listenize eklemek istediğinizden emin misiniz?`;
    let successMessage = isCurrentlyShortlisted ? "Kısa listeden çıkarıldı." : "Kısa listeye eklendi";
    let errorMessage = isCurrentlyShortlisted ? "Kısa listeden çıkarılamadı." : ERROR_MESSAGE_DEFAULT;

    let $mbody = div();
    let $confirmLabel = p(confirmMessage);

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleShortlist = async function () {
      setButtonLoading(buttons.submitBtn, true);

      let $externalMsg = $msgElement || btn.nextElementSibling;
      setMessageText($externalMsg, LOADING_MESSAGE_WAIT);

      let result = await api("CompanyShortlist/" + endpoint,
        { memberId: btn.dataset.memberId, companyId: btn.dataset.companyId }
      );

      if (result && result.isSuccess) {
        isCurrentlyShortlisted = !isCurrentlyShortlisted;
        btn.dataset.isShortlisted = isCurrentlyShortlisted;
        btn.innerText = isCurrentlyShortlisted ? "Kısa Listeden Çıkar" : "Kısa Listeye Ekle";

        setBtnState($interviewBtn, isCurrentlyShortlisted, "Kısa listeye eklenmeden mülakat sonucu bildirilemez");

        setMessageText($externalMsg, successMessage);

        closeModal($modal);
        setTimeout(() => { setMessageText($externalMsg, ""); }, DELAY_2);

        if (!isCurrentlyShortlisted && btn.closest("tr")) {
          btn.closest("tr").remove();
        }
      } else {
        setMessageText($externalMsg, errorMessage);
        showModalMessage($msgDiv, "error", errorMessage);
        setButtonLoading(buttons.submitBtn, false);
      }
    };

    let buttons = createModalButtons("İptal", isCurrentlyShortlisted ? "Kısa Listeden Çıkar" : "Kısa Listeye Ekle",
      () => closeModal($modal),
      handleShortlist
    );

    $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("Onay", $mbody);
  });

  return $btn;
}

function createInterviewReportButton(candidateId, companyId, displayName, isShortlisted, $hireBtn, isInterviewResulted, isHired, isHireInformed) {
  let isDisabled = isHired || isHireInformed || !isShortlisted || isInterviewResulted;
  let btnClass = isDisabled ? "btn-gray" : "btn-act";
  let $btn = btn(btnClass, "Mülakat Sonucu Bildir");

  if (isHired) {
    $btn.disabled = true;
    $btn.title = "Aday işe alındığı için mülakat sonucu değiştirilemez";
  } else if (isHireInformed) {
    $btn.disabled = true;
    $btn.title = "Adayın işe alındığı bildirildiği için mülakat sonucu değiştirilemez";
  } else if (!isShortlisted) {
    $btn.disabled = true;
    $btn.title = "Kısa listeye eklenmeden mülakat sonucu bildirilemez";
  } else if (isInterviewResulted) {
    $btn.disabled = true;
    $btn.title = "Mülakat sonucu bildirildi ve değiştirilemez";
  }

  $btn.addEventListener(CLICK_EVENT, async function () {
    if (this.disabled) return;

    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.className = "modal-subdued";

    let $dateLabel = lbl("Mülakat Yapıldığı Tarih");
    let todayDate = getTodayDateString();
    let $dateInput = date(todayDate);
    $dateInput.required = true;
    $dateInput.max = todayDate;
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
          $item.addEventListener(CLICK_EVENT, function (e) {
            e.stopPropagation();
            e.preventDefault();
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
        showModalMessage($msgDiv, "error", "Mülakat tarihini giriniz.");
        return;
      }

      if (!selectedResult) {
        showModalMessage($msgDiv, "error", "Mülakat sonucunu seçiniz.");
        return;
      }

      if (isDateInFuture(dateValue)) {
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
        // Mülakat düğmesini disable et
        setBtnState($btn, false, "Mülakat sonucu bildirildi ve değiştirilemez");

        // Kısa listeye ekle düğmesini disable et (eğer referans varsa)
        if ($btn.$shortlistBtn) {
          setBtnState($btn.$shortlistBtn, false, "Mülakat sonucu bildirildiği için kısa liste değiştirilemez");
        }

        // İşe al düğmesini sonuca göre güncelle
        if (selectedResult === "Mülakat yapıldı, sonucu olumlu") {
          setBtnState($hireBtn, true);
        } else {
          setBtnState($hireBtn, false, "Mülakat sonucu başarılı olmadığı için işe alınamaz");
        }

        showSuccessAndClose($msgDiv, $modal, "Mülakat sonucu bildirildi.");
      } else {
        let $row = $btn.closest("tr");
        if ($row) {
          let $buttons = $row.querySelectorAll("button");
          $buttons.forEach(button => {
            button.disabled = true;
          });
        }
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false);
      }
    };

    let buttons = createModalButtons("İptal", "Sonucu Bildir", () => closeModal($modal), handleReport);
    $mbody.append($candidateLabel, $dateLabel, $resultLabel, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("Mülakat Sonucu Bildir", $mbody);
  });

  return $btn;
}


function createHireInformButton(memberId, companyId, displayName, isInterviewResulted, isInterviewSuccess, isHired, isHireInformed) {
  let isDisabled = isHired || isHireInformed || !isInterviewResulted || !isInterviewSuccess;
  let btnClass = isDisabled ? "btn-gray" : "btn-act";
  let $btn = btn(btnClass, "İşe Al");

  if (isHired) {
    $btn.disabled = true;
    $btn.title = "Aday zaten işe alındı";
  } else if (isHireInformed) {
    $btn.disabled = true;
    $btn.title = "Adayın işe alındığı bildirildi";
  } else if (!isInterviewResulted) {
    $btn.disabled = true;
    $btn.title = "Mülakat sonucu bildirilmeden işe alınamaz";
  } else if (!isInterviewSuccess) {
    $btn.disabled = true;
    $btn.title = "Mülakat sonucu başarılı olmadığı için işe alınamaz";
  }

  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.className = "modal-subdued";

    let $p = p("İşlemin devamında adayın resmi belgelerini saha elemanına onaylatmalısınız.");
    $p.className = "lbl-warn";

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleHire = async function () {
      setButtonLoading(buttons.submitBtn, true);

      let result = await api("Candidate/HireInform", { candidateId: memberId, companyId: companyId });
      if (result && result.isSuccess) {
        setBtnState($btn, false, "Adayın işe alındığı bildirildi");
        showSuccessAndClose($msgDiv, $modal, `${displayName} işe alındı!`);
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false);
      }
    };

    let buttons = createModalButtons("İptal", "İşe Alım Bildir", () => closeModal($modal), handleHire);
    $mbody.append($candidateLabel, $p, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("İşe Alım Bildir", $mbody);
  });

  return $btn;
}

function createHireApproveButton(memberId, companyId, displayName, isInterviewResulted, isInterviewSuccess, isHired) {
  let isDisabled = isHired || !isInterviewResulted || !isInterviewSuccess;
  let btnClass = isDisabled ? "btn-gray" : "btn-act";
  let $btn = btn(btnClass, "İşe Alımı Doğrula");

  if (isHired) {
    $btn.disabled = true;
    $btn.title = "Aday işe alındı";
  } else if (!isInterviewResulted) {
    $btn.disabled = true;
    $btn.title = "Mülakat sonucu bildirilmeden işe alınamaz";
  } else if (!isInterviewSuccess) {
    $btn.disabled = true;
    $btn.title = "Mülakat sonucu başarılı olmadığı için işe alınamaz";
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
        showModalMessage($msgDiv, "error", "Geçerli bir evrak linkini giriniz.");
        return;
      }

      setButtonLoading(buttons.submitBtn, true);

      let result = await api("Candidate/Hire", {
        candidateId: memberId,
        companyId: companyId,
        hirePaperDriveUrl: url
      });

      if (result && result.isSuccess) {
        setBtnState($btn, false, "Adayın işe alındığı onaylandı");

        let $statusSpan = document.getElementById("status");
        if ($statusSpan) { $statusSpan.textContent = "İşe alım doğrulandı"; }

        $btn.dispatchEvent(new CustomEvent("hireSuccess", { bubbles: true }));

        showSuccessAndClose($msgDiv, $modal, `${displayName} işe alındı!`);
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false);
      }
    };

    let buttons = createModalButtons("İptal", "İşe Alımı Doğrula", () => closeModal($modal), handleHire);
    $mbody.append($candidateLabel, $urlLabel, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("İşe Alımı Doğrula", $mbody);
  });

  return $btn;
}
