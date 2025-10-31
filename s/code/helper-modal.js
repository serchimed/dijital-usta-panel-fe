let CSS_CLASSES = {
  modal: "modal",
  modalOverlay: "overlay",
  modalHeader: "modal-header",
  modalBody: "modal-body",
  modalButtons: "modal-buttons",
  modalBtnCancel: "modal-btn-cancel",
  modalBtnPrimary: "modal-btn-primary",
  modalMessage: "modal-message",
  modalClose: "modal-close"
};

function createModal(title, bodyContent) {
  // Mevcut tüm modalları kapat
  let existingOverlays = document.querySelectorAll(`.${CSS_CLASSES.modalOverlay}`);
  existingOverlays.forEach($o => $o.remove());

  let $overlay = div(CSS_CLASSES.modalOverlay);
  let $modal = div(CSS_CLASSES.modal);
  let $header = div(CSS_CLASSES.modalHeader);

  let $title = h3(title);

  let $closeBtn = btn(CSS_CLASSES.modalClose, "✖");
  $closeBtn.addEventListener(CLICK_EVENT, () => closeModal($overlay));

  $header.append($title, $closeBtn);

  let $mbody = div(CSS_CLASSES.modalBody);
  if (typeof bodyContent === "string") {
    $mbody.append(p(bodyContent));
  } else {
    $mbody.append(bodyContent);
  }

  $modal.append($header, $mbody);
  $overlay.append($modal);
  $overlay.addEventListener(CLICK_EVENT, (e) => {
    if (e.target === $overlay) {
      closeModal($overlay);
    }
  });

  document.body.append($overlay);
  return $overlay;
}

function closeModal($o) {
  if ($o && $o.parentNode) { $o.remove(); }
}

function showModalMessage($msgDiv, type, message) {
  $msgDiv.style.display = "block";
  $msgDiv.className = `${CSS_CLASSES.modalMessage} ${type}`;
  $msgDiv.innerText = message;
}

function setButtonLoading($btn, isLoading) {
  if (!$btn) return;

  if (isLoading) {
    if (!$btn.dataset.originalText) {
      $btn.dataset.originalText = $btn.innerText;
    }
    $btn.disabled = true;
    $btn.innerText = LOADING_MESSAGE;
  } else {
    $btn.disabled = false;
    $btn.innerText = $btn.dataset.originalText || $btn.innerText;
    delete $btn.dataset.originalText;
  }
}

function createModalButtons(cancelText, submitText, onCancel, onSubmit) {
  let $d = div(CSS_CLASSES.modalButtons);

  let $cancelBtn = btn(CSS_CLASSES.modalBtnCancel, cancelText);
  $cancelBtn.addEventListener(CLICK_EVENT, onCancel);

  let $submitBtn = btn(CSS_CLASSES.modalBtnPrimary, submitText);
  $submitBtn.addEventListener(CLICK_EVENT, onSubmit);

  $d.append($cancelBtn, $submitBtn);

  return { buttonsDiv: $d, cancelBtn: $cancelBtn, submitBtn: $submitBtn };
}

function createConfirmationModal(options) {
  let { confirmMessage, apiEndpoint, apiParams = {}, confirmButtonText = "Onayla", sourceButton } = options;

  let $mbody = div();
  let $confirmLabel = p(confirmMessage);
  let $msgDiv = div(CSS_CLASSES.modalMessage);
  let $modal;

  let handleConfirm = async function () {
    setButtonLoading(buttons.submitBtn, true);
    if (sourceButton) sourceButton.disabled = true;

    let result = await api(apiEndpoint, apiParams);

    if (result && result.isSuccess && result.data) {
      let message = typeof result.data === 'object' && result.data.message
        ? result.data.message
        : result.data;

      if (result.data.status === "Already Running") {
        showModalMessage($msgDiv, "error", message);
        setButtonLoading(buttons.submitBtn, false);
      } else {
        showModalMessage($msgDiv, "success", message);
        setButtonLoading(buttons.submitBtn, false);
        setTimeout(() => { closeModal($modal); }, DELAY_2);
      }
    } else {
      showModalMessage($msgDiv, "error", result?.data || ERROR_MESSAGE_DEFAULT);
      setButtonLoading(buttons.submitBtn, false);
    }

    if (sourceButton) sourceButton.disabled = false;
  };

  let buttons = createModalButtons("İptal", confirmButtonText, () => closeModal($modal), handleConfirm);
  $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
  $modal = createModal("Onay", $mbody);
}
