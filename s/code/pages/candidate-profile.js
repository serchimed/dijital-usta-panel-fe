let $tbl = document.getElementById("CandidateCompany");
$tbl.addEventListener("tableLoaded", function (e) {
  if (e.detail.error || !e.detail.data || e.detail.data.length === 0) { return; }

  let rows = this.querySelectorAll("tr");
  e.detail.data.forEach((item, index) => {
    let $row = rows[index];
    if (!$row) { return; }

    let $btn = createBlockButton(item.companyId, item.isBlocked, item.companyName, "CandidateCompany/Block", "CandidateCompany/Unblock", "companyId");
    $row.lastElementChild.append($btn);
  });
});

let $expTbl = document.getElementById("CandidateExperience");
if ($expTbl) {
  $expTbl.addEventListener("tableLoaded", function (e) {
    if (e.detail.error || !e.detail.data || e.detail.data.length === 0) { return; }

    let rows = this.querySelectorAll("tr");
    e.detail.data.forEach((item, index) => {
      let $row = rows[index];
      if (!$row || !item.id) { return; }

      let $link = a("Düzenle", `candidate-experience-edit.html?id=${item.id}`);
      $link.target = "_blank";
      $row.lastElementChild.append($link);
    });
  });
}

let $certTbl = document.getElementById("CandidateCertificate");
if ($certTbl) {
  $certTbl.addEventListener("tableLoaded", function (e) {
    if (e.detail.error || !e.detail.data || e.detail.data.length === 0) { return; }

    let rows = this.querySelectorAll("tr");
    e.detail.data.forEach((item, index) => {
      let $row = rows[index];
      if (!$row || !item.id) { return; }

      let $link = a("Düzenle", `candidate-certificate-edit.html?id=${item.id}`);
      $link.target = "_blank";
      $row.lastElementChild.append($link);
    });
  });
}

onAuthReady(async () => {
  await Promise.all([
    fillSpans("Candidate/Get"),
    loadTables()
  ]);

  let $warnLetter = document.getElementById("motivationLetterWarning");
  let $letter = document.getElementById("motivationLetter");
  if ($letter && $letter.value.trim() && $letter.value.trim() != "-") {
    $letter.style.height = "333px";
    if ($warnLetter) { $warnLetter.style.display = "none"; }
    let $links = document.querySelectorAll('a[href*="candidate-letter-add.html"]');
    if ($links) { $links.forEach(link => link.remove()); }
  } else {
    if ($letter) { $letter.remove(); }
    if ($warnLetter) { $warnLetter.style.display = "block"; }
  }

  let $warnNewCompany = document.getElementById("newCompanyWarning");
  let $list = document.getElementById("companiesList");
  let result = await api("Company/GetNewForCandidateCity", { memberId: USER.id });
  if (!result || result.error || !result.isSuccess || !Array.isArray(result.data) || result.data.length === 0) {
    $warnNewCompany.style.display = "none";
  } else {
    $warnNewCompany.style.display = "block";
    $list.innerHTML = "";
    result.data.forEach(company => { $list.append(chkComp(company)); });
  }

  let $btnGiveAccess = document.getElementById("giveAccessButton");
  let $msg = $btnGiveAccess.nextElementSibling;
  $btnGiveAccess.addEventListener(CLICK_EVENT, async function () {
    let selectedIds = Array.from(document.querySelectorAll('#companiesList input[type="checkbox"]:checked')).map(cb => cb.value);
    let req = {
      memberId: USER.id,
      companyIds: selectedIds
    };

    let errors = [];
    if (selectedIds.length === 0) { errors.push("En az bir firma seçmelisiniz."); }

    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);
    await apiBtn(this, "Candidate/GiveAccess", req, "Firmalara erişim verildi.", ERROR_MESSAGE_DEFAULT, "candidate-profile.html");
  });
});
