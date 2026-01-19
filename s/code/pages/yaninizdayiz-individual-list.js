onAuthReady(async () => {
  let $exportMsg = document.getElementById("exportMsg");
  let $exportBtn = document.getElementById("exportBtn");

  $exportBtn.addEventListener(CLICK_EVENT, async function () {
    this.disabled = true;
    let $cityFilter = document.getElementById('cityFilter');
    let selectedCity = $cityFilter ? $cityFilter.value : '';
    let exportParams = selectedCity ? { city: selectedCity } : {};
    await downloadCsv("Individual/Export", exportParams, "bireyler.csv", $exportMsg, DELAY_CONFIG._6);
    this.disabled = false;
  });

  let individuals = [];
  let $tbody = document.getElementById("Individual");
  const CITY_COLUMN_INDEX = 3;
  const COLUMN_MAPPING = ["fullName", "email", "phone", "province", "gender", "educationLevel", "isEmployed"];

  $tbody.addEventListener("tableLoaded", (e) => {
    if (e.detail.error) return;

    individuals = e.detail.data || [];
    populateCityFilter(individuals, "province");
    initCityFilterEvents(CITY_COLUMN_INDEX);
    initTableSort(individuals, COLUMN_MAPPING, () => renderTableFromData(individuals, $tbody), () => filterTableWithCity(CITY_COLUMN_INDEX));
  });

  await loadTables();
});
