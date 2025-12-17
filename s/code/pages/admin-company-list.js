onAuthReady(async () => {
  let $exportMsg = document.getElementById("exportMsg");
  let $exportBtn = document.getElementById("exportBtn");
  $exportBtn.addEventListener(CLICK_EVENT, async function () {
    this.disabled = true;
    await downloadCsv("Company/Export", {}, "firmalar.csv", $exportMsg);
    this.disabled = false;
  });

  let companies = [];
  let sortState = { column: null, ascending: true };

  function renderTable() {
    let tbody = document.querySelector("table tbody");
    tbody.textContent = "";

    for (let company of companies) {
      let $tr = tr();

      $tr.append(tda(company.companyName, "admin-company-profile.html?id=" + company.id, "Firma"));
      $tr.append(td(company.email, "E-posta"));
      $tr.append(td(company.city, "İl"));
      $tr.append(td(company.responsibleMemberName, "Yetkili"));
      $tr.append(tda(company.trendyolUrl, company.trendyolUrl, "Trendyol Satıcı Profili"));
      $tr.append(tda(company.webUrl, company.webUrl, "Web Sitesi"));

      let $tdInvite = createInviteInfoCell(company, {
        isAcceptedKey: "isAccepted",
        acceptedAtKey: "acceptedAt",
        endpoint: "Company/SendInviteCompanyEmail",
        idParamKey: "companyId"
      });
      $tr.append($tdInvite);

      let $btn = createBlockButton(company.id, company.isBlocked, company.companyName, "Company/Block", "Company/Unblock", "companyId");
      $tr.append(tdbtn($btn));

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

    companies.sort((a, b) => {
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

  let result = await api("Company/GetAll", {});
  if (result && result.isSuccess) {
    companies = result.data;
    renderTable();

    setTimeout(() => {
      let headers = document.querySelectorAll("table thead th");
      let columnMapping = [
        "companyName",
        "email",
        "city",
        "responsibleMemberName",
        "trendyolUrl",
        "webUrl",
        null,
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
