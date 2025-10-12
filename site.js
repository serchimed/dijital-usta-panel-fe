const API = "https://api.dijitalusta.net/";
const MODAL_AUTO_CLOSE_DELAY = 2000;
const DEFAULT_INTERVIEW_TIME = "10:00:00";
const ERROR_MESSAGE_DEFAULT = "İşlem başarısız oldu, lütfen tekrar deneyiniz.";
const LOADING_MESSAGE = "İşlem yapılıyor...";
const LOADING_MESSAGE_WAIT = "İşlem yapılıyor, lütfen bekleyiniz.";

const CSS_CLASSES = {
  modalButtons: "modal-buttons",
  modalBtnCancel: "modal-btn-cancel",
  modalBtnPrimary: "modal-btn-primary",
  modalMessage: "modal-message"
};

let USER;
let MENU = {
  "admin": [
    { text: "Firmalar", href: "admin-company-list" },
    { text: "Adaylar", href: "admin-candidate-list" },
    { text: "Adminler ve Editörler", href: "admin-and-editor-list" },
    { text: "TOBB Eğitimden Geçen Adayları Davet Et", href: "admin-tobb-add" },
    { text: "Yapay Zeka İşlemleri", href: "admin-ai" },
    { text: "Data İşlemleri", href: "admin-data" }
  ],
  "company": [
    { text: "Profil", href: "company-profile" },
    { text: "Adaylar", href: "company-candidate-list" }
  ],
  "candidate": [
    { text: "Profil", href: "candidate-profile" }
  ],
  "editor": [
    { text: "Firmalar", href: "admin-company-list" },
    { text: "Adaylar", href: "admin-candidate-list" }
  ]
};

let PUBLIC_PAGES = [
  "login",
  "demand-password",
  "access-denied"
];

let PAGE_ROLES = {
  "index": ["admin", "editor", "candidate", "company"],
  "logout": ["admin", "editor", "candidate", "company"],

  "admin-company-list": ["admin", "editor"],
  "admin-company-profile": ["admin", "editor"],
  "admin-company-block": ["admin", "editor"],
  "admin-company-unblock": ["admin", "editor"],
  "admin-candidate-list": ["admin", "editor"],
  "admin-candidate-profile": ["admin", "editor"],

  "admin-and-editor-list": ["admin"],
  "admin-company-add": ["admin"],
  "admin-editor-invite": ["admin"],
  "admin-tobb-add": ["admin"],
  "admin-ai": ["admin"],
  "admin-data": ["admin"],
  "admin-profile": ["admin"],
  "admin-profile-edit": ["admin"],

  "company-profile": ["company"],
  "company-profile-edit": ["company"],
  "company-candidate-list": ["company"],
  "company-candidate-profile": ["company"],

  "candidate-profile": ["candidate"],
  "candidate-profile-edit": ["candidate"],
  "candidate-company-profile": ["candidate"],
  "candidate-experience-add": ["candidate"],
  "candidate-experience-edit": ["candidate"],
  "candidate-certificate-add": ["candidate"],
  "candidate-certificate-edit": ["candidate"]
};

function buildUserMenu() {
  let $m = document.querySelector("menu");
  if (!$m) { return; }

  let role = USER.role.toLowerCase() === "editor" ? "admin" : USER.role.toLowerCase();
  $m.innerHTML = `<a href="${role}-profile.html?id=${USER.id}">${USER.name}</a><a href="logout.html">Çıkış</a>`;
}

function buildRoleMenu() {
  let $main = document.querySelector("main");
  if (!$main) { return; }
  if (!$main.firstElementChild) { return; }

  let menuItems = MENU[USER.role.toLowerCase()];
  menuItems.forEach(item => {
    let $a = document.createElement("a");
    $a.href = item.href + ".html";
    $a.textContent = item.text;
    $main.firstElementChild.append($a);
  });
}

async function initAuth() {
  USER = await api("Member/Check");
  if (!USER || USER.error) {
    window.location.replace("server-error.html");
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
}

function onReady(callback) {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  }
}

async function api(callName, data = {}) {
  let url = `${API}${callName}`;

  try {
    let response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (response.status >= 500) {
      console.error("API call failed:", callName, response.text());
      return { error: true, status: response.status, message: "Server error" };
    }

    if (!response.ok) {
      let text = await response.text();
      console.error(`HTTP ${response.status} from ${url}: ${text}`);
      return { error: true, status: response.status, message: text };
    }

    let result = await response.json();
    console.debug("API response:", callName, result);
    return result;
  } catch (error) {
    console.error("API call failed:", callName, error);
    return { error: true, message: error.message };
  }
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

function getTrMsg(msg) {
  return `<tr><td colspan="99" style="text-align:center; color:gray;">${msg}</td></tr>`;
}

async function loadTables() {
  let tBodies = document.querySelectorAll("table.load tbody");

  let id = getQueryParam("id");
  if (!id) {
    console.warn("No ID in query string, skipping table loads.");
  }

  var req = {};
  if (window.location.pathname.includes("candidate")) {
    req["memberId"] = id;
  } else {
    req["companyId"] = id;
  }

  for (let tbody of tBodies) {
    tbody.innerHTML = getTrMsg("Yükleniyor...");

    let data = await api(`${tbody.id}/GetAll`, req);
    if (!data || data.error) {
      tbody.innerHTML = getTrMsg("Veri yüklenemedi");
      tbody.dispatchEvent(new CustomEvent('tableLoaded', { detail: { data: null, error: true } }));
      continue;
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = getTrMsg("Veri bulunamadı");
      tbody.dispatchEvent(new CustomEvent('tableLoaded', { detail: { data: [], error: false } }));
      continue;
    }

    let table = tbody.closest("table");
    let headers = Array.from(table.querySelectorAll("thead th"));
    let fragment = document.createDocumentFragment();

    for (let item of data) {
      let tr = document.createElement("tr");

      for (let th of headers) {
        let key = th.id;
        let value = item[key] ?? "";
        let template = th.dataset?.url;

        if (template) {
          let href = template === key ? value : template.replace(/\{([^}]+)\}/g, (_, token) => item[token] ?? "");
          tr.append(tda(value || href || "", href || "#"));
        } else {
          tr.append(td(value));
        }
      }

      fragment.append(tr);
    }

    tbody.innerHTML = "";
    tbody.append(fragment);
    tbody.dispatchEvent(new CustomEvent('tableLoaded', { detail: { data: data, error: false } }));
  }
}

async function fillSpans(url, key = "memberId") {
  let id = getQueryParam("id");
  if (id) {
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
  }

  return id;
}

async function fillInputs(url, key = "memberId") {
  let id = getQueryParam("id");
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

function td(text) {
  let $td = document.createElement("td");
  $td.innerText = text;
  return $td;
}

function tda(text, href) {
  let $td = document.createElement("td");

  let $a = document.createElement("a");
  $a.href = href;
  $a.innerText = text;
  $a.target = "_blank";

  $td.append($a);
  return $td;
}

function tdbtn(btn) {
  let $td = document.createElement("td");

  $td.append(btn);
  let $p = document.createElement("p");
  $td.append($p);

  return $td;
}

function val(id) {
  let $i = document.getElementById(id);
  if ($i) { return ($i.value || "").trim(); }
  return undefined;
}

function valin(id) {
  let $i = document.getElementById(id);
  if ($i) { return ($i.innerText || "").trim(); }
  return undefined;
}

function checkEmail(email) {
  return email.includes("@") && email.includes(".") && email.indexOf("@") < email.lastIndexOf(".") && email.indexOf(" ") < 0 && email.length >= 5;
}

function checkUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function showOverMsg(msg) {
  let $o = document.createElement("div");
  $o.id = "over";
  $o.textContent = msg;
  document.body.append($o);
  return $o;
}

function showContent() {
  let $m = document.querySelector("main");
  if ($m) {
    let $o = document.getElementById("over");
    if ($o) { $o.remove(); }
    $m.style.visibility = "visible";
  }
}

function frm(ids) {
  let result = {};
  let inputs = ids.split(",").map(id => id.trim());

  for (let id of inputs) {
    let el = document.getElementById(id);
    if (!el) {
      console.error(`${id} not found`);
      continue;
    }

    if (el.type === "checkbox") {
      result[id] = el.checked;
    } else if (el.type === "radio") {
      let checked = document.querySelector(`input[name="${el.name}"]:checked`);
      result[id] = checked ? checked.value : null;
    } else if (el.tagName === "SELECT") {
      result[id] = el.value;
    } else {
      result[id] = el.value ?? el.innerText;
    }
  }

  return result;
}

onReady(async () => {
  await initAuth();
  await loadTables();
  setFilters();
});


function toggleText(element) {
  let truncated = element.parentElement.firstChild;
  let full = truncated.nextElementSibling;
  if (truncated.style.display == "none") {
    truncated.style.display = "inline-block";
    full.style.display = "none";
  }
  else {
    truncated.style.display = "none";
    full.style.display = "inline-block";
  }
}

function createBlockButton(entityId, isBlocked, displayName, blockEndpoint, unblockEndpoint, idKey = "memberId") {
  let $btn = document.createElement("button");
  $btn.dataset.entityId = entityId;
  $btn.dataset.isBlocked = isBlocked ? "true" : "false";
  $btn.innerText = isBlocked ? "Engeli Kaldır" : "Engelle";

  $btn.addEventListener("click", async function () {
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
  let $btn = document.createElement("button");
  $btn.innerText = "Favoriden Çıkar";

  $btn.addEventListener("click", async function () {
    let btn = this;
    let confirmMessage = `${displayName}'i favorilerden çıkarmak istediğinize emin misiniz?`;

    if (!confirm(confirmMessage)) { return; }

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

function createModal(title, bodyContent) {
  let $overlay = document.createElement("div");
  $overlay.className = "modal-overlay";

  let $modal = document.createElement("div");
  $modal.className = "modal";

  let $header = document.createElement("div");
  $header.className = "modal-header";

  let $title = document.createElement("h3");
  $title.innerText = title;

  let $closeBtn = document.createElement("button");
  $closeBtn.className = "modal-close";
  $closeBtn.innerText = "×";
  $closeBtn.addEventListener("click", () => closeModal($overlay));

  $header.append($title, $closeBtn);

  let $body = document.createElement("div");
  $body.className = "modal-body";
  if (typeof bodyContent === "string") {
    $body.innerHTML = bodyContent;
  } else {
    $body.append(bodyContent);
  }

  $modal.append($header, $body);
  $overlay.append($modal);
  $overlay.addEventListener("click", (e) => {
    if (e.target === $overlay) {
      closeModal($overlay);
    }
  });

  document.body.append($overlay);

  return $overlay;
}

function closeModal($overlay) {
  if ($overlay && $overlay.parentNode) {
    $overlay.remove();
  }
}

function showModalMessage($msgDiv, type, message) {
  $msgDiv.style.display = "block";
  $msgDiv.className = `modal-message ${type}`;
  $msgDiv.innerText = message;
}

function setButtonLoading($btn, isLoading, originalText) {
  $btn.disabled = isLoading;
  $btn.innerText = isLoading ? LOADING_MESSAGE : originalText;
}

function getQueryParam(key) {
  let qs = new URLSearchParams(window.location.search);
  return qs.get(key);
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowDateString() {
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

function createElement(tag, className = null, textContent = null) {
  let element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.innerText = textContent;
  return element;
}

function createModalButtons(cancelText, submitText, onCancel, onSubmit) {
  let $buttonsDiv = createElement("div", CSS_CLASSES.modalButtons);

  let $cancelBtn = createElement("button", CSS_CLASSES.modalBtnCancel, cancelText);
  $cancelBtn.addEventListener("click", onCancel);

  let $submitBtn = createElement("button", CSS_CLASSES.modalBtnPrimary, submitText);
  $submitBtn.addEventListener("click", onSubmit);

  $buttonsDiv.append($cancelBtn, $submitBtn);

  return { buttonsDiv: $buttonsDiv, cancelBtn: $cancelBtn, submitBtn: $submitBtn };
}

function createInterviewScheduleButton(memberId, companyId, displayName) {
  let $btn = document.createElement("button");
  $btn.innerText = "Mülakata Davet Et";
  $btn.style.marginLeft = "8px";

  $btn.addEventListener("click", async function () {
    let $mbody = document.createElement("div");

    let $candidateLabel = document.createElement("label");
    $candidateLabel.innerText = `Aday: ${displayName}`;
    $candidateLabel.style.color = "#666";

    // Date input
    let $dateLabel = document.createElement("label");
    $dateLabel.innerText = "Mülakat Tarihi";
    let $dateInput = document.createElement("input");
    $dateInput.type = "date";
    $dateInput.required = true;
    $dateInput.value = getTomorrowDateString();
    $dateInput.min = getTodayDateString();
    $dateLabel.append($dateInput);

    let $msgDiv = createElement("div", CSS_CLASSES.modalMessage);

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
        scheduledAt: `${date} ${DEFAULT_INTERVIEW_TIME}`
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

    let $modal = createModal("Mülakat Planla", $mbody);
  });

  return $btn;
}

function createHireCandidateButton(memberId, companyId, displayName) {
  let $btn = document.createElement("button");
  $btn.innerText = "İşe Al";
  $btn.style.marginLeft = "8px";

  $btn.addEventListener("click", async function () {
    let $mbody = document.createElement("div");

    let $candidateLabel = document.createElement("label");
    $candidateLabel.innerText = `Aday: ${displayName}`;
    $candidateLabel.style.color = "#666";

    let $urlLabel = document.createElement("label");
    $urlLabel.innerText = "İşe Alım Evrak Linki (Google Drive URL)";
    let $urlInput = document.createElement("input");
    $urlInput.type = "url";
    $urlInput.placeholder = "https://drive.google.com/...";
    $urlInput.required = true;
    $urlLabel.append($urlInput);

    let $msgDiv = createElement("div", CSS_CLASSES.modalMessage);

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

        setTimeout(() => {
          closeModal($modal);
        }, MODAL_AUTO_CLOSE_DELAY);
      } else {
        showModalMessage($msgDiv, "error", result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false, "İşe Al");
      }
    };

    let buttons = createModalButtons("İptal", "İşe Al", () => closeModal($modal), handleHire);

    $mbody.append($candidateLabel, $urlLabel, buttons.buttonsDiv, $msgDiv);

    let $modal = createModal("Aday İşe Al", $mbody);
  });

  return $btn;
}
