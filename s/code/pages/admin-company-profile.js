let $tbody = document.getElementById("CompanyShortlist");
if ($tbody) {
  $tbody.addEventListener("tableLoaded", (e) => {
    let data = e.detail.data;
    if (!data || data.length === 0 || e.detail.error) { return; }

    let companyId = getUrlParam("id");
    let rows = $tbody.querySelectorAll('tr');
    rows.forEach((tr, index) => {
      let item = data[index];
      if (item && item.memberId) {
        let $msg = p();
        let $hireBtn = createHireInformButton(item.memberId, companyId, item.displayName, item.isInterviewResulted, item.isInterviewSuccess, item.isHireApproved, item.isHireInformed);
        let $interviewBtn = createInterviewReportButton(item.memberId, companyId, item.displayName, item.isCurrentlyShortlisted, $hireBtn, item.isInterviewResulted, item.isHireApproved);
        let $shortlistBtn = createShortlistButton(item.memberId, companyId, item.displayName, item.isCurrentlyShortlisted, $msg, $interviewBtn, item.isInterviewResulted, item.isHireApproved);
        $interviewBtn.$shortlistBtn = $shortlistBtn;
        tr.lastElementChild.append(
          $shortlistBtn,
          $interviewBtn,
          $hireBtn,
          $msg);
      }
    });
  });
}

onAuthReady(async () => {
  await Promise.all([
    fillSpans("Company/Get", "companyId"),
    loadTables()
  ]);
  setFilters();
});
