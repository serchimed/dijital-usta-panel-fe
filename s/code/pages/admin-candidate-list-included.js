onAuthReady(async () => {
  let result = await api("Candidate/GetAllIncluded", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    for (let candidate of result.data) {
      let $tr = tr();
      $tr.append(tda(candidate.displayName, "admin-candidate-profile.html?id=" + candidate.id));
      $tr.append(td(candidate.city));
      $tr.append(td(candidate.status));
      tbody.append($tr);
    }
  } else {
    let errText = "Bir hata oluştu.";
    if (result && Array.isArray(result.errors) && result.errors.length) { errText = result.errors.join(", "); }
    console.error(errText);
  }

  setFilters();
});
