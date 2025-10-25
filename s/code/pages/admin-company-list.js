onAuthReady(async () => {
  let $exportBtn = document.getElementById("exportBtn");
  let $exportMsg = document.getElementById("exportMsg");

  $exportBtn.addEventListener(CLICK_EVENT, async function () {
    this.disabled = true;

    await downloadCsv("Company/Export", {}, "firmalar.csv", $exportMsg);

    this.disabled = false;
  });

  let result = await api("Company/GetAll", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    for (let company of result.data) {
      let $tr = tr();

      $tr.append(tda(company.companyName, "admin-company-profile.html?id=" + company.id));
      $tr.append(td(company.city));
      $tr.append(td(company.responsibleMemberName));
      $tr.append(tda(company.trendyolUrl, company.trendyolUrl));
      $tr.append(tda(company.webUrl, company.webUrl));

      let $btn = createBlockButton(
        company.id,
        company.isBlocked,
        company.companyName,
        "Company/Block",
        "Company/Unblock",
        "companyId"
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
