onAuthReady(async () => {
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
    tbody.innerHTML = "";

    for (let candidate of result.data) {
      let $tr = tr();
      $tr.append(tda(candidate.displayName, "admin-candidate-profile.html?id=" + candidate.id));
      $tr.append(td(candidate.gender));
      $tr.append(td(formatDateLong(candidate.birthDate)));
      $tr.append(td(candidate.city));
      $tr.append(td(candidate.university));
      $tr.append(td(candidate.major));
      $tr.append(td(candidate.status));

      let $btn = createBlockButton(candidate.id, candidate.isBlocked, candidate.displayName, "Member/Block", "Member/Unblock", "memberId");
      $tr.append(tdbtn($btn));

      tbody.append($tr);
    }
  } else { logErr(result); }

  setFilters();
});
