const YANINIZDAYIZ_CONFIG = {
  PAGE_SIZE: 50,
  MIN_SEARCH_LENGTH: 2,
  MESSAGES: {
    LOADING: "Yükleniyor...",
    NO_DATA: "Veri yok",
    LOAD_ERROR: "Veri yüklenemedi",
    DELETE_CONFIRM: "Bu kaydı silmek istediğinize emin misiniz?",
    DELETE_TITLE: "Kaydı Sil"
  }
};

function createYaninizdayizList(config) {
  let state = {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    searchTerm: "",
    data: []
  };

  let elements = {};

  function initElements() {
    elements = {
      $tbody: document.getElementById(config.tableId),
      $exportMsg: document.getElementById("exportMsg"),
      $exportBtn: document.getElementById("exportBtn"),
      $textFilter: document.querySelector('.tblfilter'),
      $cityFilter: document.getElementById('cityFilter'),
      $serverSearchBtn: document.getElementById('serverSearchBtn'),
      $clearSearchBtn: document.getElementById('clearSearchBtn'),
      $pagination: document.getElementById('pagination'),
      $pageStats: document.getElementById('pageStats'),
      $pageButtons: document.getElementById('pageButtons')
    };
  }

  function setupEventListeners() {
    elements.$exportBtn.addEventListener(CLICK_EVENT, handleExport);
    elements.$textFilter.addEventListener('input', handleTextFilterInput);
    elements.$serverSearchBtn.addEventListener(CLICK_EVENT, handleServerSearch);
    elements.$clearSearchBtn.addEventListener(CLICK_EVENT, handleClearSearch);
    if (elements.$cityFilter) {
      elements.$cityFilter.addEventListener('change', () => filterTableWithCity(config.cityColumnIndex));
    }
  }

  async function handleExport() {
    elements.$exportBtn.disabled = true;
    let selectedCity = elements.$cityFilter ? elements.$cityFilter.value : '';
    let exportParams = selectedCity ? { city: selectedCity } : {};
    await downloadCsv(config.exportEndpoint, exportParams, config.exportFilename, elements.$exportMsg, DELAY_CONFIG._6);
    elements.$exportBtn.disabled = false;
  }

  function handleTextFilterInput() {
    let searchText = elements.$textFilter.value.trim();
    if (searchText.length >= YANINIZDAYIZ_CONFIG.MIN_SEARCH_LENGTH && searchText !== state.searchTerm) {
      elements.$serverSearchBtn.classList.remove('hidden');
    } else if (searchText === state.searchTerm || searchText.length === 0) {
      elements.$serverSearchBtn.classList.add('hidden');
    }
    filterTableWithCity(config.cityColumnIndex);
  }

  async function handleServerSearch() {
    state.searchTerm = elements.$textFilter.value.trim();
    state.currentPage = 1;
    await loadData();
    elements.$serverSearchBtn.classList.add('hidden');
    if (state.searchTerm) {
      elements.$clearSearchBtn.classList.remove('hidden');
    }
  }

  async function handleClearSearch() {
    state.searchTerm = "";
    elements.$textFilter.value = "";
    elements.$cityFilter.value = "";
    state.currentPage = 1;
    await loadData();
    elements.$clearSearchBtn.classList.add('hidden');
    elements.$serverSearchBtn.classList.add('hidden');
  }

  function showLoading() {
    elements.$tbody.textContent = "";
    elements.$tbody.append(getMsgLine(YANINIZDAYIZ_CONFIG.MESSAGES.LOADING));
  }

  function showError() {
    elements.$tbody.textContent = "";
    elements.$tbody.append(getMsgLine(YANINIZDAYIZ_CONFIG.MESSAGES.LOAD_ERROR));
    elements.$pagination.classList.add('hidden');
  }

  function showNoData() {
    elements.$tbody.textContent = "";
    elements.$tbody.append(getMsgLine(YANINIZDAYIZ_CONFIG.MESSAGES.NO_DATA));
    elements.$pagination.classList.add('hidden');
  }

  function buildRequest() {
    let req = {
      pageNumber: state.currentPage,
      pageSize: YANINIZDAYIZ_CONFIG.PAGE_SIZE
    };
    if (state.searchTerm) {
      req.searchTerm = state.searchTerm;
    }
    if (elements.$cityFilter && elements.$cityFilter.value) {
      req.cityFilter = elements.$cityFilter.value;
    }
    return req;
  }

  async function fetchData() {
    showLoading();
    let req = buildRequest();
    let result = await api(config.apiEndpoint, req);

    if (!result || result.error || !result.isSuccess) {
      showError();
      return null;
    }

    state.totalCount = result.totalCount || 0;
    state.totalPages = result.totalPages || 1;
    state.currentPage = result.pageNumber || 1;
    state.data = result.data || [];

    return result;
  }

  function renderTable() {
    if (state.data.length === 0) {
      showNoData();
      return false;
    }

    if (config.transformData) {
      state.data.forEach(config.transformData);
    }

    renderTableFromData(state.data, elements.$tbody);
    return true;
  }

  function addDeleteButtons() {
    let rows = elements.$tbody.querySelectorAll("tr");

    rows.forEach((tr, index) => {
      let item = state.data[index];
      let itemId = item?.id || item?.Id;

      if (!item || !itemId) return;

      let $td = tr.lastElementChild;
      if (!$td) return;

      let $btn = btn("btn-danger", "Sil");
      $btn.addEventListener(CLICK_EVENT, () => showDeleteModal(item, tr, itemId));
      $td.append($btn);
    });
  }

  function showDeleteModal(item, $row, itemId) {
    let $mbody = div();
    let $confirmLabel = p(YANINIZDAYIZ_CONFIG.MESSAGES.DELETE_CONFIRM);
    let $itemInfo = p(config.getItemInfo(item));
    $itemInfo.style.fontWeight = "bold";
    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleDelete = async function () {
      setButtonLoading(buttons.submitBtn, true);
      let result = await api(config.deleteEndpoint, { id: itemId });
      if (result && result.isSuccess) {
        $row.remove();
        closeModal($modal);
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false);
      }
    };

    let buttons = createModalButtons("İptal", "Sil", () => closeModal($modal), handleDelete);
    $mbody.append($confirmLabel, $itemInfo, buttons.buttonsDiv, $msgDiv);
    $modal = createModal(YANINIZDAYIZ_CONFIG.MESSAGES.DELETE_TITLE, $mbody);
  }

  function updatePagination() {
    if (state.totalPages <= 1 && state.totalCount <= YANINIZDAYIZ_CONFIG.PAGE_SIZE) {
      elements.$pagination.classList.add('hidden');
      return;
    }

    elements.$pagination.classList.remove('hidden');
    updatePaginationStats();
    updatePaginationButtons();
  }

  function updatePaginationStats() {
    let startRecord = (state.currentPage - 1) * YANINIZDAYIZ_CONFIG.PAGE_SIZE + 1;
    let endRecord = Math.min(state.currentPage * YANINIZDAYIZ_CONFIG.PAGE_SIZE, state.totalCount);
    elements.$pageStats.textContent = `Toplam ${state.totalCount} kayıt | ${startRecord}-${endRecord} arası gösteriliyor`;
  }

  function updatePaginationButtons() {
    elements.$pageButtons.textContent = "";

    if (state.currentPage > 1) {
      let $first = btn("page-btn", "«");
      $first.addEventListener(CLICK_EVENT, () => goToPage(1));
      elements.$pageButtons.append($first);
    }

    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(state.totalPages, state.currentPage + 2);

    if (startPage > 1) {
      let $dots = spn("...", "page-dots");
      elements.$pageButtons.append($dots);
    }

    for (let i = startPage; i <= endPage; i++) {
      let $pageBtn = btn(i === state.currentPage ? "page-btn active" : "page-btn", i.toString());
      if (i !== state.currentPage) {
        $pageBtn.addEventListener(CLICK_EVENT, () => goToPage(i));
      }
      elements.$pageButtons.append($pageBtn);
    }

    if (endPage < state.totalPages) {
      let $dots = spn("...", "page-dots");
      elements.$pageButtons.append($dots);
    }

    if (state.currentPage < state.totalPages) {
      let $last = btn("page-btn", "»");
      $last.addEventListener(CLICK_EVENT, () => goToPage(state.totalPages));
      elements.$pageButtons.append($last);
    }
  }

  async function goToPage(page) {
    if (page < 1 || page > state.totalPages || page === state.currentPage) {
      return;
    }
    state.currentPage = page;
    await loadData();
  }

  async function loadData() {
    let result = await fetchData();
    if (!result) {
      return;
    }

    let rendered = renderTable();
    if (!rendered) {
      return;
    }

    addDeleteButtons();
    populateCityFilter(state.data, "province");
    updatePagination();
    filterTableWithCity(config.cityColumnIndex);
  }

  return {
    async init() {
      initElements();
      setupEventListeners();
      await loadData();
    },
    loadData,
    getState() {
      return { ...state };
    }
  };
}
