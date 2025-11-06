onAuthReady(async () => {
  let result = await api("Candidate/GetAllIncluded", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.textContent = "";

    for (let candidate of result.data) {
      let $tr = tr();
      $tr.append(tda(candidate.displayName, "admin-candidate-profile.html?id=" + candidate.id));
      $tr.append(td(candidate.email));
      $tr.append(td(candidate.city));
      $tr.append(td(candidate.status));
      $tr.append(td(formatTimeLong(candidate.wordpressRegisterDate)));
      tbody.append($tr);
    }
  } else { logErr(result); }

  setFilters();
});
