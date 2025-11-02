onAuthReady(async () => {
  let candidateId = await fillSpans("Candidate/Get");

  if (!USER.companyId || !candidateId) {
    document.getElementById("msg").innerText = "Firma veya aday bilgisi alınamadı.";
    return;
  }

  let infoResult = await api("Candidate/CompanyInfo", { memberId: candidateId, companyId: USER.companyId });
  if (!infoResult || !infoResult.isSuccess) {
    document.getElementById("msg").innerText = "Aday bilgileri yüklenemedi.";
    return;
  }

  await loadTables();

  let $letter = document.getElementById("motivationLetter");
  if ($letter.value === "-") {
    $letter.value = "Motivasyon mektubu bulunmamaktadır.";
    $letter.style.height = "auto";
  }

  let candidateName = document.getElementById("displayName")?.textContent;
  let isShortlisted = infoResult.data.isShortlisted || false;
  let isInterviewResulted = infoResult.data.isInterviewResulted || false;
  let interviewResult = infoResult.data.interviewResult || "";
  let isInterviewSuccess = infoResult.data.isInterviewSuccess || false;
  let isHired = infoResult.data.isHired || false;
  let isHireInformed = infoResult.data.isHireInformed || false;

  let $actionButtons = document.getElementById("actionButtons");

  if (isInterviewResulted && interviewResult && !isInterviewSuccess) {
    let $resultP = p(`Mülakat Sonucu: ${interviewResult}`);
    $resultP.className = "lbl-warn";
    $actionButtons.append($resultP);
  } else {
    let $msg = p();
    let $hireInformBtn = createHireInformButton(candidateId, USER.companyId, candidateName, isInterviewResulted, isInterviewSuccess, isHired, isHireInformed);
    let $interviewBtn = createInterviewReportButton(candidateId, USER.companyId, candidateName, isShortlisted, $hireInformBtn, isInterviewResulted, isHired, isHireInformed);
    let $shortlistBtn = createShortlistButton(candidateId, USER.companyId, candidateName, isShortlisted, $msg, $interviewBtn, isInterviewResulted, isHired, isHireInformed);
    $interviewBtn.$shortlistBtn = $shortlistBtn;

    $actionButtons.append($shortlistBtn, $interviewBtn, $hireInformBtn, $msg);
  }
});
