let $tbl = document.getElementById("CandidateCompany");
$tbl.addEventListener("tableLoaded", function (e) {
  if (e.detail.error || !e.detail.data || e.detail.data.length === 0) { return; }

  let rows = this.querySelectorAll("tr");
  e.detail.data.forEach((item, index) => {
    let $row = rows[index];
    if (!$row) { return; }

    let $btn = createBlockButton(item.companyId, !item.isAllowed, item.companyName, "CandidateCompany/Block", "CandidateCompany/Unblock", "companyId", "İzni Kaldır", "İzin Ver");
    $row.lastElementChild.append($btn);
  });
});

let $expTbl = document.getElementById("CandidateExperience");
if ($expTbl) {
  $expTbl.addEventListener("tableLoaded", function (e) {
    if (e.detail.error || !e.detail.data || e.detail.data.length === 0) {
      return;
    }

    let rows = this.querySelectorAll("tr");
    e.detail.data.forEach((item, index) => {
      let $row = rows[index];
      if (!$row || !item.id) {
        return;
      }

      let $link = a("Düzenle", `candidate-experience-edit.html?id=${item.id}`);
      $link.target = "_blank";

      let $deleteBtn = btn("btn-del", "Sil");
      $deleteBtn.addEventListener(CLICK_EVENT, function () {
        createConfirmationModal({
          confirmMessage: "Bu deneyimi silmek istediğinizden emin misiniz?",
          apiEndpoint: "CandidateExperience/Delete",
          apiParams: {
            memberId: USER.id,
            experienceId: item.id
          },
          confirmButtonText: "Sil",
          sourceButton: $deleteBtn,
          onSuccess: () => $row.remove()
        });
      });

      $row.lastElementChild.append($link, " ", $deleteBtn);
    });
  });
}

let $certTbl = document.getElementById("CandidateCertificate");
if ($certTbl) {
  $certTbl.addEventListener("tableLoaded", function (e) {
    if (e.detail.error || !e.detail.data || e.detail.data.length === 0) {
      return;
    }

    let rows = this.querySelectorAll("tr");
    e.detail.data.forEach((item, index) => {
      let $row = rows[index];
      if (!$row || !item.id) {
        return;
      }

      let $link = a("Düzenle", `candidate-certificate-edit.html?id=${item.id}`);
      $link.target = "_blank";

      let $deleteBtn = btn("btn-del", "Sil");
      $deleteBtn.addEventListener(CLICK_EVENT, function () {
        createConfirmationModal({
          confirmMessage: "Bu sertifikayı silmek istediğinizden emin misiniz?",
          apiEndpoint: "CandidateCertificate/Delete",
          apiParams: {
            memberId: USER.id,
            certificateId: item.id
          },
          confirmButtonText: "Sil",
          sourceButton: $deleteBtn,
          onSuccess: () => $row.remove()
        });
      });

      $row.lastElementChild.append($link, " ", $deleteBtn);
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
    if ($warnLetter) { $warnLetter.classList.add("none"); }
    let $links = document.querySelectorAll('a[href*="candidate-letter-add.html"]');
    if ($links) { $links.forEach(link => link.remove()); }
  } else {
    if ($letter) { $letter.remove(); }
    if ($warnLetter) { $warnLetter.classList.remove("none"); }
  }

  let $warnNewCompany = document.getElementById("newCompanyWarning");
  let $list = document.getElementById("companiesList");
  let result = await api("Company/GetNewForCandidateCity", { memberId: USER.id });

  if (result && result.isSuccess && Array.isArray(result.data) && result.data.length > 0) {
    if ($warnNewCompany) {
      $warnNewCompany.classList.remove("none");
    }
    if ($list) {
      $list.textContent = "";
      result.data.forEach(company => {
        $list.append(chkComp(company));
      });
    }
  } else {
    if (!result || !result.isSuccess) {
      console.error("Yeni şirketler API hatası:", result);
    }
    if ($warnNewCompany) {
      $warnNewCompany.classList.add("none");
    }
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
