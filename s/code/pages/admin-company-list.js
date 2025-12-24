onAuthReady(async () => {
  let $exportMsg = document.getElementById("exportMsg");
  let $exportBtn = document.getElementById("exportBtn");
  $exportBtn.addEventListener(CLICK_EVENT, async function () {
    this.disabled = true;

    // Seçili şehri al
    let $cityFilter = document.getElementById('cityFilter');
    let selectedCity = $cityFilter ? $cityFilter.value : '';

    // Export parametresi
    let exportParams = {};
    if (selectedCity) {
      exportParams.city = selectedCity;
    }

    await downloadCsv("Company/Export", exportParams, "firmalar.csv", $exportMsg);
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
    populateCityFilter();
  }

  function populateCityFilter() {
    let $cityFilter = document.getElementById("cityFilter");
    if (!$cityFilter) return;

    // Unique cities'i topla
    let cities = new Set();
    companies.forEach(company => {
      if (company.city && company.city.trim()) {
        cities.add(company.city.trim());
      }
    });

    // Türkçe sıralama ile sort et
    let sortedCities = Array.from(cities).sort((a, b) =>
      a.localeCompare(b, 'tr-TR')
    );

    // Dropdown'ı doldur (ilk option "Tüm İller" korunur)
    while ($cityFilter.options.length > 1) {
      $cityFilter.remove(1);
    }

    sortedCities.forEach(city => {
      let option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      $cityFilter.appendChild(option);
    });
  }

  function filterCompanyTable() {
    let $textFilter = document.querySelector('.tblfilter');
    let $cityFilter = document.getElementById('cityFilter');
    let $table = document.querySelector('table');

    if (!$table || !$textFilter || !$cityFilter) return;

    let searchText = ($textFilter.value || '').toLowerCase().trim();
    let selectedCity = ($cityFilter.value || '').trim();

    let tbody = $table.querySelector('tbody');
    if (!tbody) return;

    let rows = tbody.querySelectorAll('tr');
    let visibleCount = 0;
    let totalCount = 0;

    rows.forEach(row => {
      let cells = row.querySelectorAll('td');

      // Skip empty/message rows
      if (cells.length === 0 || (cells.length === 1 && cells[0].colSpan > 1)) {
        return;
      }

      totalCount++;

      // City filter (3. kolon = index 2)
      let cityCell = cells[2];
      let cityValue = cityCell ? cityCell.textContent.trim() : '';
      let cityMatch = !selectedCity || cityValue === selectedCity;

      // Text filter (tüm kolonlarda ara)
      let textMatch = true;
      if (searchText) {
        let rowText = '';
        cells.forEach(cell => {
          rowText += cell.textContent.toLowerCase() + ' ';
        });
        textMatch = rowText.includes(searchText);
      }

      // AND mantığı: her ikisi de eşleşmeli
      if (cityMatch && textMatch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });

    updateFilterCounter($textFilter, visibleCount, totalCount, searchText || selectedCity);
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
    filterCompanyTable();
  }

  let result = await api("Company/GetAll", {});
  if (result && result.isSuccess) {
    companies = result.data;
    renderTable();

    // Filter Event Listeners
    let $cityFilter = document.getElementById('cityFilter');
    if ($cityFilter) {
      $cityFilter.addEventListener('change', filterCompanyTable);
    }

    // Text filter: default listener'ı kaldır, custom listener ekle
    let $textFilter = document.querySelector('.tblfilter');
    if ($textFilter) {
      // Clone ile eski listener'ı temizle
      let newTextFilter = $textFilter.cloneNode(true);
      $textFilter.parentNode.replaceChild(newTextFilter, $textFilter);

      // Custom filter listener
      newTextFilter.addEventListener('input', filterCompanyTable);
    }

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
