onAuthReady(async () => {
  let result = await api("Candidate/GetAll", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    for (let candidate of result.data) {
      let $tr = tr();

      $tr.append(tda(candidate.displayName, "company-candidate-profile.html?id=" + candidate.id));
      $tr.append(td(candidate.gender));
      $tr.append(td(formatDateLong(candidate.birthDate)));
      $tr.append(td(candidate.city));
      $tr.append(td(candidate.county));
      $tr.append(td(candidate.educationLevel));
      $tr.append(td(candidate.university));
      $tr.append(td(candidate.major));
      tbody.append($tr);
    }
  } else {
    let errText = "Bir hata oluştu.";
    if (result && Array.isArray(result.errors) && result.errors.length) { errText = result.errors.join(", "); }
    console.error(errText);
  }

  setFilters();
});
