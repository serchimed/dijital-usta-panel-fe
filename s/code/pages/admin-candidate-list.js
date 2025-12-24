onAuthReady(async () => {
  if (USER && USER.role === "editor") {
    let $link = document.querySelector('a[href="admin-candidate-list-included.html"]');
    if ($link) { $link.style.visibility = "hidden"; }
    $link = document.querySelector('a[href="admin-point-update.html"]');
    if ($link) { $link.style.visibility = "hidden"; }
    $link = document.querySelector('a[href="admin-candidate-invite.html"]');
    if ($link) { $link.style.visibility = "hidden"; }
  }

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

    await downloadCsv("Candidate/Export", exportParams, "adaylar.csv", $exportMsg);
    this.disabled = false;
  });

  let candidates = [];
  let sortState = { column: null, ascending: true };

  function renderTable() {
    let tbody = document.querySelector("table tbody");
    tbody.textContent = "";

    for (let candidate of candidates) {
      let $tr = tr();
      $tr.append(tda(candidate.displayName, "admin-candidate-profile.html?id=" + candidate.id, "Aday"));
      $tr.append(td(candidate.email, "E-posta"));
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

    setFilters();
    populateCityFilter();
  }

  function populateCityFilter() {
    let $cityFilter = document.getElementById("cityFilter");
    if (!$cityFilter) return;

    // Unique cities'i topla
    let cities = new Set();
    candidates.forEach(candidate => {
      if (candidate.city && candidate.city.trim()) {
        cities.add(candidate.city.trim());
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

  function filterCandidateTable() {
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

      // City filter (5. kolon = index 4)
      let cityCell = cells[4];
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

    candidates.sort((a, b) => {
      let valA = a[column] || "";
      let valB = b[column] || "";

      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortState.ascending ? -1 : 1;
      if (valA > valB) return sortState.ascending ? 1 : -1;
      return 0;
    });

    renderTable();
    filterCandidateTable();
  }

  let result = await api("Candidate/GetAll", {});
  if (result && result.isSuccess) {
    candidates = result.data;
    renderTable();

    // Filter Event Listeners
    let $cityFilter = document.getElementById('cityFilter');
    if ($cityFilter) {
      $cityFilter.addEventListener('change', filterCandidateTable);
    }

    // Text filter: default listener'ı kaldır, custom listener ekle
    let $textFilter = document.querySelector('.tblfilter');
    if ($textFilter) {
      // Clone ile eski listener'ı temizle
      let newTextFilter = $textFilter.cloneNode(true);
      $textFilter.parentNode.replaceChild(newTextFilter, $textFilter);

      // Custom filter listener
      newTextFilter.addEventListener('input', filterCandidateTable);
    }

    setTimeout(() => {
      let headers = document.querySelectorAll("table thead th");
      let columnMapping = [
        "displayName",
        "email",
        "gender",
        "birthDate",
        "city",
        "university",
        "major",
        "status",
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
