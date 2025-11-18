let CITIES = ["Balıkesir", "Denizli", "Gaziantep", "Nevşehir", "Ordu"];
let INTERVIEW_RESULTS = ["Mülakat yapıldı, sonucu olumlu", "Mülakat yapıldı sonucu başarısız, aday beğenilmedi", "Mülakat yapıldı sonucu başarısız, aday mülakata katılmadı", "Mülakat yapıldı sonucu başarısız, aday teklifi reddetti", "Mülakat iptal edildi"];

function formatFieldValue(value, fieldName) {
  if (!value || value === "-") return value;

  let isDateField = fieldName === "start" ||
    fieldName === "end" ||
    fieldName.toLowerCase().includes("date");
  let isTimeField = fieldName === "createdAt" || fieldName.endsWith("At");

  if (typeof value === "string" && value.startsWith("0001-01-01")) {
    return "-";
  }

  if (isDateField && value) {
    return formatDateLong(value);
  }

  if (isTimeField && value) {
    return formatTimeLong(value);
  }

  return value;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    let later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function setFilters() {
  let $fis = document.querySelectorAll('.tblfilter');
  $fis.forEach($i => {
    let filterTable = debounce(function () {
      let tbl = $i.nextElementSibling;
      let txt = ($i.value || '').toLowerCase();
      let rows = tbl.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

      for (let i = 0; i < rows.length; i++) {
        let $r = rows[i];
        let cells = $r.getElementsByTagName('td');
        let rowText = '';

        for (let j = 0; j < cells.length; j++) { rowText += cells[j].textContent.toLowerCase() + ' '; }

        if (rowText.includes(txt)) { $r.style.display = ''; }
        else { $r.style.display = 'none'; }
      }
    }, DELAY_0);

    $i.addEventListener('input', filterTable);
  });
}

async function loadTables(querySelector = "table.load tbody") {
  let tBodies = document.querySelectorAll(querySelector);

  let key = window.location.pathname.includes("candidate") ? "memberId" : "companyId";
  let id = getId(key);
  if (!id) { id = USER.id; }

  let req = {};
  req[key] = id;

  for (let tbody of tBodies) {
    tbody.textContent = "";
    tbody.append(getMsgLine("Yükleniyor..."));

    let result = await api(`${tbody.id}/GetAll`, req);
    if (!result || result.error || !result.isSuccess) {
      tbody.textContent = "";
      tbody.append(getMsgLine("Veri yüklenemedi"));
      tbody.dispatchEvent(new CustomEvent("tableLoaded", { detail: { data: null, error: true } }));
      continue;
    }

    let data = result.data;
    if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      data = [data];
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.textContent = "";
      tbody.append(getMsgLine("Veri yok"));
      tbody.dispatchEvent(new CustomEvent("tableLoaded", { detail: { data: [], error: false } }));
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
        let label = th.textContent || key;

        value = formatFieldValue(value, key);

        let template = th.dataset?.url;
        let $td;

        if (template) {
          let href = template === key ? value : template.replace(/\{([^}]+)\}/g, (_, token) => item[token] ?? "");

          if (href.includes("00000000-0000-0000-0000-000000000000")) {
            $td = td("");
          } else {
            $td = tda(value || href || "", href || "#");
          }
        } else {
          $td = td(value);
        }

        $td.setAttribute("data-label", label);
        $tr.append($td);
      }

      fragment.append($tr);
    }

    tbody.textContent = "";
    tbody.append(fragment);
    tbody.dispatchEvent(new CustomEvent("tableLoaded", { detail: { data: data, error: false } }));
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
    showHeaderMsg("Veriler yüklenemedi, lütfen sayfayı yenileyin.");
    return null;
  }

  if (result.data) {
    for (let prop in result.data) {
      let $s = document.getElementById(prop);
      if ($s) {
        let v = result.data[prop] || "-";
        v = formatFieldValue(v, prop);

        let tag = ($s.tagName || "").toLowerCase();
        if (tag === "img") {
          $s.src = v;
          if (!v || v === "-") { $s.src = "./s/profile.jpg"; }
        } else if (tag === "textarea") {
          $s.value = v;
        } else if (prop.endsWith("Url") && v && v !== "-") {
          $s.textContent = "";
          let displayText = v.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
          let $a = a(displayText, v);
          $a.target = "_blank";
          $s.append($a);
        } else {
          $s.textContent = v;
        }
      }

      if (prop === "hiredCompanyName") {
        let $span = document.getElementById("hiredCompanyName");
        if ($span) {
          let v = result.data[prop] || "-";
          let $parentLink = $span.closest("a");
          if ($parentLink && (v === "-" || v === "")) {
            $parentLink.removeAttribute("href");
          }
        }
      }

      if (prop === "candidateName") {
        let $span = document.getElementById("candidateName");
        if ($span) {
          let v = result.data[prop] || "-";
          let $parentLink = $span.closest("a");
          if ($parentLink && (v === "-" || v === "")) {
            $parentLink.removeAttribute("href");
          }
        }
      }

      let placeholder = `{${prop}}`;
      let $links = document.querySelectorAll(`a[href*="${placeholder}"]`);
      if ($links.length > 0) {
        let v = result.data[prop] || "";
        $links.forEach($link => { $link.href = $link.href.replace(placeholder, v); });
      }
    }

    let name = result.data.displayName || result.data.companyName;
    if (name && name !== "-") {
      document.title = name + " | " + document.title;
    }
  }

  if (!result.isSuccess) { console.error("API error:", result); }
  return id;
}

async function fillInputsViaReq(url, req) {
  let result = await api(url, req);
  if (!result || result.error) {
    console.error("Data fetch error:", result);
    showHeaderMsg("Veriler yüklenemedi, lütfen sayfayı yenileyin.");
    return Object.values(req)[0];
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
        } else if (tag === "input" && type === "date" && v) {
          let formattedDate = formatFieldValue(v, prop);
          if (formattedDate === "-") {
            $i.value = "";
          } else {
            $i.value = formatDateInput(v);
          }
        } else if (tag === "input" && (type === "checkbox" || type === "radio")) {
          if (type === "checkbox") {
            $i.checked = Boolean(v);
          } else {
            $i.checked = ($i.value == v);
          }
        } else if ("value" in $i) { $i.value = v ?? ""; }
        else { $i.textContent = v ?? ""; }
      }
    }

    let $btn = document.querySelector("main button");
    if ($btn) {
      $btn.disabled = false;
      if ($btn.nextElementSibling) { $btn.nextElementSibling.textContent = ""; }
    }

    return req.certificateId || req.experienceId || req.memberId || Object.values(req)[0];
  } else {
    console.error("API error:", result);
    return req.certificateId || req.experienceId || req.memberId || Object.values(req)[0];
  }
}

async function fillInputs(url, key = "memberId") {
  let id = getId(key);
  if (id) {
    let req = {};
    req[key] = id;

    return await fillInputsViaReq(url, req);
  }

  return null;
}
