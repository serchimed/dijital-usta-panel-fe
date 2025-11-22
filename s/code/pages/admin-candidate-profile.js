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
      if (companyId) { apiParams.companyId = companyId; }

      let result = await api("Candidate/HireFailed", apiParams);
      if (result && result.isSuccess) {
        if (onSuccess) { onSuccess($hireCancelBtn); }

        showSuccessAndClose($msgDiv, $modal, "İşe alım iptal edildi.");
        document.getElementById("status").textContent = "İşe alım tamamlanamadı ya da iptal edildi";
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
        if (item.isShortlistRemovedDueToOtherHire) {
          let $warnP = p(`Aday başka bir firma tarafından işe alındı`);
          $warnP.className = "lbl-warn";
          tr.lastElementChild.append($warnP);
        } else {
          let $msg = p();
          let $hireBtn = createHireApproveButton(candidateId, item.companyId, candidateName, item.isInterviewResulted, item.isInterviewSuccess, item.isHired);
          let $interviewBtn = createInterviewReportButton(candidateId, item.companyId, candidateName, item.isCurrentlyShortlisted, $hireBtn, item.isInterviewResulted, item.isHired, item.isHireInformed);
          let $shortlistBtn = createShortlistButton(candidateId, item.companyId, candidateName, item.isCurrentlyShortlisted, $msg, $interviewBtn, item.isInterviewResulted, item.isHired, item.isHireInformed);
          $interviewBtn.$shortlistBtn = $shortlistBtn;

          let $hireCancelTrBtn = createCancelHireButton(candidateId, item.companyId, async function ($btn) {
            $btn.style.display = "none";
            $hireBtn.style.display = "";
            await loadTables("#" + $shortlistTbody.id);
          });
          $hireCancelTrBtn.style.display = item.isHired ? "" : "none";

          $hireBtn.addEventListener("hireSuccess", function () { $hireCancelTrBtn.style.display = ""; });

          tr.lastElementChild.append($shortlistBtn, $interviewBtn, $hireBtn, $hireCancelTrBtn, $msg);
        }
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

  if (USER && USER.role && USER.role.toLowerCase() === "editor") {
    let $aiDetails = document.getElementById("detailsAI");
    if ($aiDetails) { $aiDetails.style.display = "none"; }

    let $surveyLink = document.querySelector('a.qs[href*="admin-candidate-survey.html"]');
    if ($surveyLink) { $surveyLink.style.display = "none"; }
  }

  let $btnAIApprove = document.getElementById("btnAIApprove");
  let $msgAIApprove = document.getElementById("msgAIApprove");
  let $aiApprovedSpan = document.getElementById("aiApproved");

  if ($btnAIApprove && $aiApprovedSpan) {
    let isApproved = $aiApprovedSpan.textContent.trim() === "Evet";
    $btnAIApprove.innerText = "AI Onayını Kaldır";
    $btnAIApprove.disabled = !isApproved;

    if (!isApproved) {
      $btnAIApprove.classList.remove("btn-act");
      $btnAIApprove.classList.add("btn-gray");
    }

    $btnAIApprove.addEventListener(CLICK_EVENT, async function () {
      let $mbody = div();
      let $confirmLabel = p("AI değerlendirmesi onayını kaldırmak istediğinize emin misiniz?");
      let $msgDiv = div(CSS_CLASSES.modalMessage);
      let $modal;

      let handleUnapprove = async function () {
        setButtonLoading(buttons.submitBtn, true);
        setMessageText($msgAIApprove, LOADING_MESSAGE_WAIT);

        let result = await api("AI/Unapprove", { memberId: candidateId });

        if (result && result.isSuccess) {
          $aiApprovedSpan.textContent = "Hayır";
          $btnAIApprove.disabled = true;
          $btnAIApprove.classList.remove("btn-act");
          $btnAIApprove.classList.add("btn-gray");
          setMessageText($msgAIApprove, "");
          closeModal($modal);
        } else {
          setMessageText($msgAIApprove, ERROR_MESSAGE_DEFAULT);
          showModalMessage($msgDiv, "error", ERROR_MESSAGE_DEFAULT);
          setButtonLoading(buttons.submitBtn, false);
        }
      };

      let buttons = createModalButtons("İptal", "Onayı Kaldır", () => closeModal($modal), handleUnapprove);
      $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
      $modal = createModal("AI Onayını Kaldır", $mbody);
    });
  }

  // AI Geçmişini yükle
  await loadAIHistory();

  // AI Geçmişini Yükle
  async function loadAIHistory() {
    let $tbody = document.getElementById("CandidateAIHistory");
    if (!$tbody) return;

    $tbody.textContent = "";
    $tbody.append(getMsgLine("Yükleniyor..."));

    let result = await api("AIHistory/GetCandidate", { memberId: candidateId });

    if (!result || result.error || !result.isSuccess) {
      $tbody.textContent = "";
      $tbody.append(getMsgLine("Veri yüklenemedi"));
      return;
    }

    let data = result.data;
    if (!Array.isArray(data) || data.length === 0) {
      $tbody.textContent = "";
      $tbody.append(getMsgLine("Veri yok"));
      return;
    }

    $tbody.textContent = "";
    data.forEach(item => {
      let $tr = tr();

      let aiName = item.aiName || "-";
      let prompt = item.prompt || "-";
      let answer = item.answer || "-";
      let createdAt = item.createdAt || "-";
      let aiId = item.id || item.Id;

      let $tdAI = td(aiName, "AI");

      let $tdPrompt = td(null, "Prompt");
      if (prompt.length > 100) {
        let truncated = prompt.substring(0, 100) + "...";
        let $truncated = spn(truncated);
        $truncated.style.display = "inline-block";
        $truncated.style.fontSize = "15px";
        $truncated.addEventListener(CLICK_EVENT, function (e) {
          e.stopPropagation();
        });
        let $full = spn(prompt);
        $full.style.display = "none";
        $full.addEventListener(CLICK_EVENT, function (e) {
          e.stopPropagation();
        });
        let $toggle = spn(" [detay]");
        $toggle.style.cursor = "pointer";
        $toggle.style.color = "#0066cc";
        $toggle.addEventListener(CLICK_EVENT, function (e) {
          e.stopPropagation();
          e.preventDefault();
          toggleText(this);
        });
        $tdPrompt.append($truncated, $full, $toggle);
      } else {
        $tdPrompt.textContent = prompt;
      }

      let $tdAnswer = td(null, "Cevap");
      if (answer.length > 100) {
        let truncated = answer.substring(0, 100) + "...";
        let $truncated = spn(truncated);
        $truncated.style.display = "inline-block";
        $truncated.style.fontSize = "15px";
        $truncated.addEventListener(CLICK_EVENT, function (e) {
          e.stopPropagation();
        });
        let $full = spn(answer);
        $full.style.display = "none";
        $full.addEventListener(CLICK_EVENT, function (e) {
          e.stopPropagation();
        });
        let $toggle = spn(" [detay]");
        $toggle.style.cursor = "pointer";
        $toggle.style.color = "#0066cc";
        $toggle.addEventListener(CLICK_EVENT, function (e) {
          e.stopPropagation();
          e.preventDefault();
          toggleText(this);
        });
        $tdAnswer.append($truncated, $full, $toggle);
      } else {
        $tdAnswer.textContent = answer;
      }

      let $tdDate = td(formatTimeLong(createdAt), "Tarih");

      let $tdActions = td(null, "");
      let $btnApprove = btn("btn-act", "Onayla");
      let $msg = p();

      $btnApprove.addEventListener(CLICK_EVENT, async function () {
        let $mbody = div();
        let $confirmLabel = p("Bu AI değerlendirmesini onaylamak istediğinize emin misiniz?");
        let $msgDiv = div(CSS_CLASSES.modalMessage);
        let $modal;

        let handleApprove = async function () {
          setButtonLoading(buttons.submitBtn, true);
          setMessageText($msg, LOADING_MESSAGE_WAIT);

          let approveResult = await api("AI/Approve", {
            memberId: candidateId,
            AIId: aiId
          });

          if (approveResult && approveResult.isSuccess) {
            setMessageText($msg, "");

            if ($aiApprovedSpan) { $aiApprovedSpan.textContent = "Evet"; }
            if ($btnAIApprove) {
              $btnAIApprove.disabled = false;
              $btnAIApprove.classList.remove("btn-gray");
              $btnAIApprove.classList.add("btn-act");
            }

            showSuccessAndClose($msgDiv, $modal, "AI değerlendirmesi onaylandı.");

            await loadAIHistory();
          } else {
            setMessageText($msg, ERROR_MESSAGE_DEFAULT);
            showModalMessage($msgDiv, "error", approveResult?.message || ERROR_MESSAGE_DEFAULT);
            setButtonLoading(buttons.submitBtn, false);
          }
        };

        let buttons = createModalButtons("İptal", "Onayla", () => closeModal($modal), handleApprove);
        $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
        $modal = createModal("AI Değerlendirmesini Onayla", $mbody);
      });

      $tdActions.append($btnApprove, $msg);
      $tr.append($tdAI, $tdPrompt, $tdAnswer, $tdDate, $tdActions);
      $tbody.append($tr);
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

        let result = await api("AI/Evaluate", { memberId: candidateId, aiName: selectedAI, prompt: promptValue }, 0, DELAY_6);
        if (result && result.isSuccess) {
          if (result.data) {
            if ($spnAiScore && result.data.aiScore !== undefined) { $spnAiScore.textContent = result.data.aiScore; }
            if ($txtAiEval && result.data.aiEvaluation !== undefined) { $txtAiEval.textContent = result.data.aiEvaluation; }
          }

          setMessageText($msgAIReview, "");
          showSuccessAndClose($msgDiv, $modal, "AI değerlendirmesi tamamlandı.");

          // AI geçmişini yeniden yükle
          await loadAIHistory();
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
