let MODAL_AUTO_CLOSE_DELAY = 2000;
let CSS_CLASSES = {
  modal: "modal",
  modalOverlay: "modal-overlay",
  modalHeader: "modal-header",
  modalBody: "modal-body",
  modalButtons: "modal-buttons",
  modalBtnCancel: "modal-btn-cancel",
  modalBtnPrimary: "modal-btn-primary",
  modalMessage: "modal-message",
  modalClose: "modal-close"
};

function createModal(title, bodyContent) {
  let $overlay = div(CSS_CLASSES.modalOverlay);
  let $modal = div(CSS_CLASSES.modal);
  let $header = div(CSS_CLASSES.modalHeader);

  let $title = h3(title);

  let $closeBtn = btn(CSS_CLASSES.modalClose, "✖");
  $closeBtn.addEventListener(CLICK_EVENT, () => closeModal($overlay));

  $header.append($title, $closeBtn);

  let $mbody = div(CSS_CLASSES.modalBody);
  if (typeof bodyContent === "string") {
    $mbody.innerHTML = bodyContent;
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

function closeModal($overlay) {
  if ($overlay && $overlay.parentNode) {
    $overlay.remove();
  }
}

function showModalMessage($msgDiv, type, message) {
  $msgDiv.style.display = "block";
  $msgDiv.className = `${CSS_CLASSES.modalMessage} ${type}`;
  $msgDiv.innerText = message;
}

function setButtonLoading($btn, isLoading, originalText) {
  $btn.disabled = isLoading;
  $btn.innerText = isLoading ? LOADING_MESSAGE : originalText;
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
