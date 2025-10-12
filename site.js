let MAX_RETRIES = 3;
(function loadHelpers() {
  let helpers = ["html", "modal", "menu", "event", "api"];
  let index = 0;
  let retries = 0;

  function loadNext() {
    if (index >= helpers.length) { return; }

    let $s = document.createElement("script");
    $s.src = `helper-${helpers[index]}.js`;
    $s.onload = () => {
      retries = 0;
      index++;
      loadNext();
    };
    $s.onerror = () => {
      retries++;
      console.error(`Failed to load helper-${helpers[index]}.js (attempt ${retries}/${MAX_RETRIES})`);

      if (retries >= MAX_RETRIES) {
        console.error(`Max retries reached for helper-${helpers[index]}.js, redirecting to error page`);
        window.location.replace("error-client.html");
        return;
      }

      setTimeout(loadNext, 234);
    };
    document.head.append($s);
  }

  loadNext();
})();

let USER;
async function initAuth() {
  USER = await api("Member/Check");
  if (!USER || USER.error) {
    window.location.replace("error-server.html");
    return;
  }

  let path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  page = page.replace(".html", "");

  if (!PUBLIC_PAGES.includes(page)) {
    if (!USER.isAuthenticated) {
      showOverMsg("Sisteme giriş yapmanız gerekiyor...");
      setTimeout(() => window.location.replace("demand-password.html"), 1000);
      return;
    }
    buildUserMenu();

    let allowedRoles = PAGE_ROLES[page];
    if (!allowedRoles || !allowedRoles.includes(USER.role.toLowerCase())) {
      showOverMsg("Access denied. Redirecting...");
      setTimeout(() => window.location.replace("access-denied.html"), 1000);
      return;
    }

    if (page === "index") { buildRoleMenu(); }
  }

  showContent();
  dispatchAuthReady();
}


function setFilters() {
  let $fis = document.querySelectorAll('.tblfilter');
  $fis.forEach($i => {
    $i.addEventListener('input', function () {
      let tbl = $i.nextElementSibling;
      let txt = this.value.toLowerCase();
      let rows = tbl.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

      for (let i = 0; i < rows.length; i++) {
        let $r = rows[i];
        let cells = $r.getElementsByTagName('td');
        let rowText = '';

        for (let j = 0; j < cells.length; j++) { rowText += cells[j].textContent.toLowerCase() + ' '; }

        if (rowText.includes(txt)) { $r.style.display = ''; }
        else { $r.style.display = 'none'; }
      }
    });
  });
}

async function loadTables() {
  let tBodies = document.querySelectorAll("table.load tbody");

  let key = window.location.pathname.includes("candidate") ? "memberId" : "companyId";
  let id = getId(key);
  if (!id) { return; }

  let req = {};
  req[key] = id;

  for (let tbody of tBodies) {
    tbody.innerHTML = getMsgLine("Yükleniyor...");

    let data = await api(`${tbody.id}/GetAll`, req);
    if (!data || data.error) {
      tbody.innerHTML = getMsgLine("Veri yüklenemedi");
      tbody.dispatchEvent(new CustomEvent('tableLoaded', { detail: { data: null, error: true } }));
      continue;
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = getMsgLine("Veri bulunamadı");
      tbody.dispatchEvent(new CustomEvent('tableLoaded', { detail: { data: [], error: false } }));
      continue;
    }

    let table = tbody.closest("table");
    let headers = Array.from(table.querySelectorAll("thead th"));
    let fragment = document.createDocumentFragment();

    for (let item of data) {
      let $tr = tr();

      for (let th of headers) {
        let key = th.id;
        let value = item[key] ?? "";
        let template = th.dataset?.url;

        if (template) {
          let href = template === key ? value : template.replace(/\{([^}]+)\}/g, (_, token) => item[token] ?? "");
          $tr.append(tda(value || href || "", href || "#"));
        } else {
          $tr.append(td(value));
        }
      }

      fragment.append($tr);
    }

    tbody.innerHTML = "";
    tbody.append(fragment);
    tbody.dispatchEvent(new CustomEvent('tableLoaded', { detail: { data: data, error: false } }));
  }
}

async function fillSpans(url, key = "memberId") {
  let id = getId(key);
  if (!id) { return null; }

  let req = {};
  req[key] = id;

  let $a = document.querySelectorAll(".qs");
  if ($a) { $a.forEach(a => a.href = a.href + `?id=${id}`); }

  let result = await api(url, req);
  if (!result || result.error) {
    console.error("Data fetch error:", result);
    return null;
  }

  if (result.isSuccess) {
    for (let prop in result.data) {
      let $s = document.getElementById(prop);
      if ($s) {
        let v = result.data[prop] ?? "-";
        if (prop == "birthDate" && v) {
          let dt = new Date(v);
          v = dt.toLocaleDateString("tr-TR", { day: '2-digit', month: 'long', year: 'numeric' });
        }

        let tag = ($s.tagName || "").toLowerCase();
        if (tag === "img") {
          $s.src = v;
        } else {
          $s.innerHTML = v;
        }
      }
    }
  } else {
    console.error("API error:", result);
    return null;
  }

  return id;
}

async function fillInputs(url, key = "memberId") {
  let id = getId(key);
  if (id) {
    let req = {};
    req[key] = id;

    let result = await api(url, req);
    if (!result || result.error) {
      console.error("Data fetch error:", result);
      return id;
    }

    if (result.isSuccess) {
      for (let prop in result.data) {
        let $i = document.getElementById(prop);
        if ($i) {
          let v = result.data[prop];
          let tag = ($i.tagName || "").toLowerCase();
          let type = ($i.type || "").toLowerCase();

          if (tag === "textarea") {
            $i.value = v ?? "";
          } else if (tag === "input" && (type === "checkbox" || type === "radio")) {
            if (type === "checkbox") {
              $i.checked = Boolean(v);
            } else {
              $i.checked = ($i.value == v);
            }
          } else if ("value" in $i) {
            $i.value = v ?? "";
          } else {
            $i.textContent = v ?? "";
          }
        }
      }

      let $btn = document.querySelector("button");
      $btn.disabled = false;
      $btn.nextElementSibling.innerHTML = "";
    } else {
      console.error("API error:", result);
      return id;
    }
  }

  return id;
}


function createBlockButton(entityId, isBlocked, displayName, blockEndpoint, unblockEndpoint, idKey = "memberId") {
  let $btn = btn(null, isBlocked ? "Engeli Kaldır" : "Engelle");
  $btn.dataset.entityId = entityId;
  $btn.dataset.isBlocked = isBlocked ? "true" : "false";

  $btn.addEventListener(CLICK_EVENT, async function () {
    let btn = this;
    let isCurrentlyBlocked = btn.dataset.isBlocked === "true";
    let endpoint = isCurrentlyBlocked ? unblockEndpoint : blockEndpoint;
    let confirmMessage = isCurrentlyBlocked
      ? `${displayName}'in engelini kaldırmak istediğinize emin misiniz?`
      : `${displayName}'i engellemek istediğinize emin misiniz?`;

    if (!confirm(confirmMessage)) { return; }

    btn.disabled = true;
    btn.nextElementSibling.innerText = LOADING_MESSAGE_WAIT;

    let req = {};
    req[idKey] = btn.dataset.entityId;
    let result = await api(endpoint, req);

    if (result && result.isSuccess) {
      isCurrentlyBlocked = !isCurrentlyBlocked;
      btn.dataset.isBlocked = isCurrentlyBlocked ? "true" : "false";
      btn.innerText = isCurrentlyBlocked ? "Engeli Kaldır" : "Engelle";
      btn.nextElementSibling.innerText = "";
    } else {
      btn.nextElementSibling.innerText = ERROR_MESSAGE_DEFAULT;
    }

    btn.disabled = false;
  });

  return $btn;
}

function createFavoriteButton(memberId, companyId, displayName) {
  let $btn = btn(null, "Favoriden Çıkar");

  $btn.addEventListener(CLICK_EVENT, async function () {
    if (!confirm(`${displayName}'i favorilerden çıkarmak istediğinize emin misiniz?`)) { return; }

    let btn = this;
    btn.disabled = true;
    btn.nextElementSibling.innerText = LOADING_MESSAGE_WAIT;

    let result = await api("CompanyFavorite/Remove", { memberId: memberId, companyId: companyId });

    if (result && result.isSuccess) {
      btn.closest("tr").remove();
    } else {
      btn.nextElementSibling.innerText = ERROR_MESSAGE_DEFAULT;
      btn.disabled = false;
    }
  });

  return $btn;
}

function createInterviewScheduleButton(memberId, companyId, displayName) {
  let $btn = btn(null, "Mülakata Davet Et");
  $btn.style.marginLeft = "8px";
  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.style.color = "#666";

    let $dateLabel = lbl("Mülakat Tarihi");
    let $dateInput = date(getTomorrow());
    $dateInput.required = true;
    $dateInput.min = new Date().toISOString().split('T')[0];
    $dateLabel.append($dateInput);

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleSchedule = async function () {
      let date = $dateInput.value;
      if (!date) {
        showModalMessage($msgDiv, "error", "Lütfen tarih seçiniz.");
        return;
      }

      let selectedDate = new Date(date);
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        showModalMessage($msgDiv, "error", "Geçmiş bir tarih seçemezsiniz.");
        return;
      }

      setButtonLoading(buttons.submitBtn, true);

      let result = await api("CandidateInterview/Schedule", {
        candidateId: memberId,
        companyId: companyId,
        scheduledAt: date
      });

      if (result && result.isSuccess) {
        showModalMessage($msgDiv, "success", `${displayName} mülakata davet edildi. Tarih: ${date}`);
        setTimeout(() => { closeModal($modal); }, MODAL_AUTO_CLOSE_DELAY);
      }
      else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false, "Mülakata Davet Et");
      }
    };

    let buttons = createModalButtons("İptal", "Mülakata Davet Et",
      () => closeModal($modal),
      handleSchedule
    );

    $mbody.append($candidateLabel, $dateLabel, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("Mülakat Planla", $mbody);
  });

  return $btn;
}

function createHireCandidateButton(memberId, companyId, displayName) {
  let $btn = btn(null, "İşe Al");
  $btn.style.marginLeft = "8px";
  $btn.addEventListener(CLICK_EVENT, async function () {
    let $mbody = div();

    let $candidateLabel = lbl(`Aday: ${displayName}`);
    $candidateLabel.style.color = "#666";

    let $urlLabel = lbl("İşe Alım Evrak Linki (Google Drive URL)");
    let $urlInput = url("https://drive.google.com/...");
    $urlInput.required = true;
    $urlLabel.append($urlInput);

    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleHire = async function () {
      let url = $urlInput.value.trim();
      if (!url || !checkUrl(url)) {
        showModalMessage($msgDiv, "error", "Lütfen geçerli bir evrak linkini giriniz.");
        return;
      }

      setButtonLoading(buttons.submitBtn, true);

      let result = await api("Candidate/Hire", {
        candidateId: memberId,
        companyId: companyId,
        hirePaperDriveUrl: url
      });

      if (result && result.isSuccess) {
        showModalMessage($msgDiv, "success", `${displayName} başarıyla işe alındı!`);
        setTimeout(() => { closeModal($modal); }, MODAL_AUTO_CLOSE_DELAY);
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false, "İşe Al");
      }
    };

    let buttons = createModalButtons("İptal", "İşe Al", () => closeModal($modal), handleHire);

    $mbody.append($candidateLabel, $urlLabel, buttons.buttonsDiv, $msgDiv);

    $modal = createModal("Aday İşe Al", $mbody);
  });

  return $btn;
}


onReady(async () => {
  await initAuth();
});

onAuthReady(() => {
  setTimeout(loadTables, 1234);
  setTimeout(setFilters, 2345);
});
