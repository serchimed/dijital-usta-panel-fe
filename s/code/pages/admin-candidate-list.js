onAuthReady(async () => {
  let $exportBtn = document.getElementById("exportBtn");
  let $exportMsg = document.getElementById("exportMsg");

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

      let $btn = createBlockButton(
        candidate.id,
        candidate.isBlocked,
        candidate.displayName,
        "Member/Block",
        "Member/Unblock",
        "memberId"
      );
      $tr.append(tdbtn($btn));

      tbody.append($tr);
    }
  } else {
    let errText = "Bir hata oluştu.";
    if (result && Array.isArray(result.errors) && result.errors.length) { errText = result.errors.join(", "); }
    console.error(errText);
  }

  setFilters();
});
