let candidateId;
let companies = [];
let companiesLoaded = false;

let $shortlistTbody = document.getElementById("CandidateShortlisted");

function createCancelHireButton(memberId, companyId, onSuccess) {
  let $hireCancelBtn = btn("btn-danger", "İşe Alımı İptal Et");

  $hireCancelBtn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();
    let $confirmLabel = p("İşe alımı iptal etmek istediğinize emin misiniz?");
    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleCancelHire = async function () {
      setButtonLoading(buttons.submitBtn, true);

      let apiParams = { memberId: memberId };
      if (companyId) {
        apiParams.companyId = companyId;
      }

      let result = await api("Candidate/HireFailed", apiParams);

      if (result && result.isSuccess) {
        if (onSuccess) {
          onSuccess($hireCancelBtn);
        }

        showSuccessAndClose($msgDiv, $modal, "İşe alım iptal edildi.");
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false);
      }
    };

    let buttons = createModalButtons("İptal", "Onayla", () => closeModal($modal), handleCancelHire);
    $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("İşe Alımı İptal Et", $mbody);
  });

  return $hireCancelBtn;
}

function setupShortlistTable() {
  if (!$shortlistTbody) return;

  $shortlistTbody.addEventListener("tableLoaded", (e) => {
    let data = e.detail.data;
    if (!data || data.length === 0) { return; }

    let candidateName = document.getElementById("displayName")?.textContent;

    let rows = e.target.querySelectorAll("tr");
    rows.forEach((tr, index) => {
      let item = data[index];
      if (item && item.companyId && candidateId) {
        let $msg = p();
        let $hireBtn = createHireApproveButton(candidateId, item.companyId, candidateName, item.isInterviewResulted, item.isInterviewSuccess, item.isHired);
        let $interviewBtn = createInterviewReportButton(candidateId, item.companyId, candidateName, true, $hireBtn, item.isInterviewResulted, item.isHired);
        let $shortlistBtn = createShortlistButton(candidateId, item.companyId, candidateName, true, $msg, $interviewBtn, item.isInterviewResulted, item.isHired);
        $interviewBtn.$shortlistBtn = $shortlistBtn;

        let $hireCancelTrBtn = createCancelHireButton(candidateId, item.companyId, function ($btn) {
          $btn.style.display = "none";
          $hireBtn.style.display = "";
        });
        $hireCancelTrBtn.style.display = item.isHired ? "" : "none";

        $hireBtn.addEventListener("hireSuccess", function () { $hireCancelTrBtn.style.display = ""; });

        tr.lastElementChild.append($shortlistBtn, $interviewBtn, $hireBtn, $hireCancelTrBtn, $msg);
      }
    });
  });
}

let $historyTbody = document.getElementById("CandidateHistory");
if ($historyTbody) {
  $historyTbody.addEventListener("tableLoaded", (e) => {
    let data = e.detail.data;
    if (!data || data.length === 0) { return; }

    let rows = e.target.querySelectorAll("tr");
    rows.forEach((tr, index) => {
      let item = data[index];
      if (item) {
        let companyNameCell = tr.querySelector("td:nth-child(2)");
        if (companyNameCell) {
          let link = companyNameCell.querySelector("a");
          if (link && link.textContent === "Admin") { link.outerHTML = link.textContent; }
        }
      }
    });
  });
}

onAuthReady(async () => {
  candidateId = await fillSpans("Candidate/Get");

  let $letter = document.getElementById("motivationLetter");
  if ($letter.value === "-") {
    $letter.value = "Motivasyon mektubu bulunmamaktadır.";
    $letter.style.height = "auto";
  }

  let $btnAIApprove = document.getElementById("btnAIApprove");
  let $msgAIApprove = document.getElementById("msgAIApprove");
  let $aiApprovedSpan = document.getElementById("aiApproved");

  if ($btnAIApprove && $aiApprovedSpan) {
    let isApproved = $aiApprovedSpan.textContent.trim() === "Evet";
    $btnAIApprove.innerText = isApproved ? "AI Değerlendirmesi Onayını Geri Al" : "AI Değerlendirmesini Onayla";

    $btnAIApprove.addEventListener(CLICK_EVENT, async function () {
      let isCurrentlyApproved = $aiApprovedSpan.textContent.trim() === "Evet";
      let endpoint = isCurrentlyApproved ? "AI/Unapprove" : "AI/Approve";
      let confirmMessage = isCurrentlyApproved
        ? "AI değerlendirmesi onayını geri almak istediğinize emin misiniz?"
        : "AI değerlendirmesini onaylamak istediğinize emin misiniz?";

      let $mbody = div();
      let $confirmLabel = p(confirmMessage);
      let $msgDiv = div(CSS_CLASSES.modalMessage);
      let $modal;

      let handleApprove = async function () {
        setButtonLoading(buttons.submitBtn, true);
        setMessageText($msgAIApprove, LOADING_MESSAGE_WAIT);

        let result = await api(endpoint, { memberId: candidateId });

        if (result && result.isSuccess) {
          isCurrentlyApproved = !isCurrentlyApproved;
          $aiApprovedSpan.textContent = isCurrentlyApproved ? "Evet" : "Hayır";
          $btnAIApprove.innerText = isCurrentlyApproved ? "AI Değerlendirmesi Onayını Geri Al" : "AI Değerlendirmesini Onayla";
          setMessageText($msgAIApprove, "");
          closeModal($modal);
        } else {
          setMessageText($msgAIApprove, ERROR_MESSAGE_DEFAULT);
          showModalMessage($msgDiv, "error", ERROR_MESSAGE_DEFAULT);
          setButtonLoading(buttons.submitBtn, false);
        }
      };

      let buttons = createModalButtons("İptal", isCurrentlyApproved ? "Onayı Geri Al" : "Onayla", () => closeModal($modal), handleApprove);
      $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
      $modal = createModal("Onay", $mbody);
    });
  }

  let $btnAIReview = document.getElementById("btnAIReview");
  let $msgAIReview = document.getElementById("msgAIReview");
  let $spnAiScore = document.getElementById("aiScore");
  let $txtAiEval = document.getElementById("aiEvaluation");

  if ($btnAIReview) {
    $btnAIReview.addEventListener(CLICK_EVENT, async function () {
      let $mbody = div();

      let $aiLabel = lbl("AI Seçimi");
      $aiLabel.className = "sel";
      let $aiInput = inp();
      $aiInput.placeholder = "AI seçiniz...";
      $aiInput.value = "Google Gemini";
      $aiInput.required = true;
      $aiInput.readOnly = true;
      let $aiList = div();
      $aiList.id = "aiList";
      $aiLabel.append($aiInput, $aiList);

      let selectedAI = $aiInput.value;
      let aiOptions = [$aiInput.value, "Open AI chatGPT"];

      $aiInput.addEventListener(CLICK_EVENT, function () {
        if ($aiList.children.length === 0) {
          aiOptions.forEach(ai => {
            let $item = div();
            $item.textContent = ai;
            $item.addEventListener(CLICK_EVENT, function (e) {
              e.stopPropagation();
              e.preventDefault();
              $aiInput.value = ai;
              selectedAI = ai;
              $aiList.classList.remove("show");
            });
            $aiList.appendChild($item);
          });
        }
        $aiList.classList.toggle("show");
      });

      let $promptLabel = lbl("AI Prompt");
      let $promptInput = txt();
      $promptInput.placeholder = "Standart promptu özelleştirmek isterseniz yazın";
      $promptInput.rows = 5;
      $promptLabel.append($promptInput);

      let $msgDiv = div(CSS_CLASSES.modalMessage);
      let $modal;

      let handleEvaluate = async function () {
        if (!selectedAI) {
          showModalMessage($msgDiv, "error", "AI seçimi yapınız.");
          return;
        }

        let promptValue = $promptInput.value.trim();

        setButtonLoading(buttons.submitBtn, true);
        setMessageText($msgAIReview, LOADING_MESSAGE_WAIT);

        let result = await api("AI/Evaluate", { memberId: candidateId, aiName: selectedAI, prompt: promptValue });
        if (result && result.isSuccess) {
          if (result.data) {
            if ($spnAiScore && result.data.aiScore !== undefined) { $spnAiScore.textContent = result.data.aiScore; }
            if ($txtAiEval && result.data.aiEvaluation !== undefined) { $txtAiEval.textContent = result.data.aiEvaluation; }
          }

          setMessageText($msgAIReview, "");
          showSuccessAndClose($msgDiv, $modal, "AI değerlendirmesi tamamlandı.");
        } else {
          setMessageText($msgAIReview, ERROR_MESSAGE_DEFAULT);
          showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
          setButtonLoading(buttons.submitBtn, false);
        }
      };

      let buttons = createModalButtons("İptal", "Değerlendirt", () => closeModal($modal), handleEvaluate);

      $mbody.append($aiLabel, $promptLabel, buttons.buttonsDiv, $msgDiv);
      $modal = createModal("Tekrar AI ile Değerlendir", $mbody);
    });
  }

  let $st = document.getElementById("status");
  let $shortlistDetails = $shortlistTbody?.closest("details");

  if ($st && $st.textContent === "İşe alım doğrulandı") {
    if ($shortlistDetails) { $shortlistDetails.style.display = "none"; }

    let $candidateActions = document.getElementById("candidateActions");
    if ($candidateActions) {
      let $hireCancelBtn = createCancelHireButton(candidateId, null, function ($btn) {
        $btn.remove();

        if ($shortlistDetails) { $shortlistDetails.style.display = ""; }

        setupShortlistTable();
        loadTables("#" + $shortlistTbody.id);
      });

      $candidateActions.appendChild($hireCancelBtn);
    }
  }
  else {
    setupShortlistTable();

    let $search = document.getElementById("companySearch");
    let $selectedId = document.getElementById("selectedCompanyId");
    let $addBtn = document.getElementById("addShortlistBtn");
    let $msg = document.getElementById("shortlistMsg");

    autocomplete(
      $search,
      async () => {
        if (!companiesLoaded) {
          let companyResult = await api("CandidateCompany/GetAll", { memberId: candidateId });
          if (companyResult && companyResult.isSuccess) {
            companies = companyResult.data;
            companiesLoaded = true;
          }
        }
        return companies;
      },
      (company, searchText) => company.companyName.toLowerCase().includes(searchText.toLowerCase()),
      (company) => `${company.companyName} (${company.city})`,
      (company, $input) => {
        $input.value = company.companyName;
        $selectedId.value = company.companyId;
        $addBtn.disabled = false;
      }
    );

    $addBtn.addEventListener(CLICK_EVENT, async function () {
      let companyId = $selectedId.value;
      if (!companyId || !candidateId) {
        $msg.innerText = "Bir firma seçiniz.";
        return;
      }

      $msg.textContent = "";
      let result = await apiBtn(this, "CompanyShortlist/Add", { memberId: candidateId, companyId: companyId }, "Kısa listeye eklendi", ERROR_MESSAGE_DEFAULT);

      if (result && result.isSuccess) {
        $search.value = "";
        $selectedId.value = "";
        $addBtn.disabled = true;

        await loadTables("#" + $shortlistTbody.id);
      }
    });
  }

  await loadTables();
  setFilters();
});
