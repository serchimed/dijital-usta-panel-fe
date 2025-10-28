let $tbody = document.getElementById("CompanyShortlist");
if ($tbody) {
  $tbody.addEventListener("tableLoaded", (e) => {
    let data = e.detail.data;
    if (!data || data.length === 0) { return; }

    let rows = e.target.querySelectorAll('tr');
    rows.forEach((tr, index) => {
      let item = data[index];
      if (item && item.memberId) {
        let $msg = p();
        let $hireBtn = createHireInformButton(item.memberId, USER.companyId, item.displayName, item.isInterviewResulted, item.isInterviewSuccess, item.isHired, item.isHireInformed);
        let $interviewBtn = createInterviewReportButton(item.memberId, USER.companyId, item.displayName, true, $hireBtn, item.isInterviewResulted, item.isHired);
        let $shortlistBtn = createShortlistButton(item.memberId, USER.companyId, item.displayName, true, $msg, $interviewBtn, item.isInterviewResulted, item.isHired);
        $interviewBtn.$shortlistBtn = $shortlistBtn;

        tr.lastElementChild.append($shortlistBtn, $interviewBtn, $hireBtn, $msg);
      }
    });
  });
}

onAuthReady(async () => {
  await Promise.all([
    fillSpans("Company/Get", "companyId"),
    loadTables()
  ]);
});
