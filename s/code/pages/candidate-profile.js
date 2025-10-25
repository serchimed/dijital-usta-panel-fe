let $tbl = document.getElementById("CandidateCompany");
$tbl.addEventListener("tableLoaded", function (e) {
  if (e.detail.error || !e.detail.data || e.detail.data.length === 0) { return; }

  let rows = this.querySelectorAll("tr");
  e.detail.data.forEach((item, index) => {
    let $row = rows[index];
    if (!$row) { return; }

    let $btn = createBlockButton(
      item.companyId,
      item.isBlocked,
      item.companyName,
      "CandidateCompany/Block",
      "CandidateCompany/Unblock",
      "companyId"
    );

    $row.lastElementChild.append($btn);
  });
});

onAuthReady(async () => {
  await Promise.all([
    fillSpans("Candidate/Get"),
    loadTables()
  ]);

  let $warn = document.getElementById("motivationLetterWarning");
  let $letter = document.getElementById("motivationLetter");
  if ($letter && $letter.value.trim() && $letter.value.trim() != "-") {
    $letter.style.height = "333px";
    if ($warn) { $warn.style.display = "block"; }
    let $links = document.querySelectorAll('a[href*="candidate-letter-add.html"]');
    if ($links) { $links.forEach(link => link.remove()); }
  } else {
    if ($letter) { $letter.remove(); }
    if ($warn) { $warn.style.display = "none"; }
  }
});
