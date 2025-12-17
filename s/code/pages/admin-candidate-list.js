onAuthReady(async () => {
  if (USER && USER.role === "editor") {
    let $link = document.querySelector('a[href="admin-candidate-list-included.html"]');
    if ($link) { $link.style.visibility = "hidden"; }
    $link = document.querySelector('a[href="admin-point-update.html"]');
    if ($link) { $link.style.visibility = "hidden"; }
    $link = document.querySelector('a[href="admin-candidate-invite.html"]');
    if ($link) { $link.style.visibility = "hidden"; }
  }

  let $exportMsg = document.getElementById("exportMsg");
  let $exportBtn = document.getElementById("exportBtn");
  $exportBtn.addEventListener(CLICK_EVENT, async function () {
    this.disabled = true;
    await downloadCsv("Candidate/Export", {}, "adaylar.csv", $exportMsg);
    this.disabled = false;
  });

  let candidates = [];
  let sortState = { column: null, ascending: true };

  function renderTable() {
    let tbody = document.querySelector("table tbody");
    tbody.textContent = "";

    for (let candidate of candidates) {
      let $tr = tr();
      $tr.append(tda(candidate.displayName, "admin-candidate-profile.html?id=" + candidate.id, "Aday"));
      $tr.append(td(candidate.email, "E-posta"));
      $tr.append(td(candidate.gender, "Cinsiyet"));
      $tr.append(td(formatDateLong(candidate.birthDate), "Doğum Tarihi"));
      $tr.append(td(candidate.city, "İl"));
      $tr.append(td(candidate.university, "Üniversite"));
      $tr.append(td(candidate.major, "Bölüm"));
      $tr.append(td(candidate.status, "Durum"));

      let $btn = createBlockButton(candidate.id, candidate.isBlocked, candidate.displayName, "Member/Block", "Member/Unblock", "memberId");
      $tr.append(tdbtn($btn, ""));

      tbody.append($tr);
    }

    setFilters();
  }

  function sortTable(column) {
    if (sortState.column === column) {
      sortState.ascending = !sortState.ascending;
    } else {
      sortState.column = column;
      sortState.ascending = true;
    }

    candidates.sort((a, b) => {
      let valA = a[column] || "";
      let valB = b[column] || "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortState.ascending ? -1 : 1;
      if (valA > valB) return sortState.ascending ? 1 : -1;
      return 0;
    });

    renderTable();
  }

  let result = await api("Candidate/GetAll", {});
  if (result && result.isSuccess) {
    candidates = result.data;
    renderTable();

    setTimeout(() => {
      let headers = document.querySelectorAll("table thead th");
      let columnMapping = [
        "displayName",
        "email",
        "gender",
        "birthDate",
        "city",
        "university",
        "major",
        "status",
        null
      ];

      headers.forEach((th, index) => {
        if (columnMapping[index]) {
          th.style.cursor = "pointer";
          th.addEventListener(CLICK_EVENT, () => sortTable(columnMapping[index]));
        }
      });
    }, 5000);
  } else { logErr(result); }
});
