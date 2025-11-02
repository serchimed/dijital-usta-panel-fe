onAuthReady(async () => {
  if (USER && USER.role === "editor") {
    let $link = document.querySelector('a[href="admin-candidate-list-included.html"]');
    if ($link) { $link.style.visibility = "hidden"; }
  }

  let $exportMsg = document.getElementById("exportMsg");
  let $exportBtn = document.getElementById("exportBtn");
  $exportBtn.addEventListener(CLICK_EVENT, async function () {
    this.disabled = true;
    await downloadCsv("Candidate/Export", {}, "adaylar.csv", $exportMsg);
    this.disabled = false;
  });

  let result = await api("Candidate/GetAll", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.textContent = "";

    for (let candidate of result.data) {
      let $tr = tr();
      $tr.append(tda(candidate.displayName, "admin-candidate-profile.html?id=" + candidate.id, "Aday"));
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
  } else { logErr(result); }

  setFilters();
});
