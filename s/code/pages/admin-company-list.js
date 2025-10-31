onAuthReady(async () => {
  let $exportMsg = document.getElementById("exportMsg");
  let $exportBtn = document.getElementById("exportBtn");
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

      let $tdCompanyName = tda(company.companyName, "admin-company-profile.html?id=" + company.id);
      $tdCompanyName.setAttribute("data-label", "Firma");
      $tr.append($tdCompanyName);

      let $tdCity = td(company.city);
      $tdCity.setAttribute("data-label", "İl");
      $tr.append($tdCity);

      let $tdResponsible = td(company.responsibleMemberName);
      $tdResponsible.setAttribute("data-label", "Yetkili");
      $tr.append($tdResponsible);

      let $tdTrendyol = tda(company.trendyolUrl, company.trendyolUrl);
      $tdTrendyol.setAttribute("data-label", "Trendyol Satıcı Profili");
      $tr.append($tdTrendyol);

      let $tdWeb = tda(company.webUrl, company.webUrl);
      $tdWeb.setAttribute("data-label", "Web Sitesi");
      $tr.append($tdWeb);

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
  } else { logErr(result); }

  setFilters();
});
