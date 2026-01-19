onAuthReady(async () => {
  let $exportMsg = document.getElementById("exportMsg");
  let $exportBtn = document.getElementById("exportBtn");

  $exportBtn.addEventListener(CLICK_EVENT, async function () {
    this.disabled = true;
    let $cityFilter = document.getElementById('cityFilter');
    let selectedCity = $cityFilter ? $cityFilter.value : '';
    let exportParams = selectedCity ? { city: selectedCity } : {};
    await downloadCsv("Business/Export", exportParams, "isletmeler.csv", $exportMsg, DELAY_CONFIG._6);
    this.disabled = false;
  });

  let businesses = [];
  let $tbody = document.getElementById("Business");
  const CITY_COLUMN_INDEX = 4;
  const COLUMN_MAPPING = ["companyTitle", "contactFullName", "contactEmail", "contactPhone", "province", "yearsInOperation", "hasTrendyolStore"];

  $tbody.addEventListener("tableLoaded", (e) => {
    if (e.detail.error) return;

    businesses = e.detail.data || [];

    // hasTrendyolStore: true ise URL göster, false ise "-"
    businesses.forEach(item => {
      item.hasTrendyolStore = item.hasTrendyolStore && item.trendyolStoreUrl
        ? item.trendyolStoreUrl
        : "-";
    });

    // Dönüştürülmüş veriyle tabloyu yeniden render et
    renderTableFromData(businesses, $tbody);

    populateCityFilter(businesses, "province");
    initCityFilterEvents(CITY_COLUMN_INDEX);
    initTableSort(businesses, COLUMN_MAPPING, () => renderTableFromData(businesses, $tbody), () => filterTableWithCity(CITY_COLUMN_INDEX));
  });

  await loadTables();
});
