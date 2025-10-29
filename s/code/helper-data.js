let CITIES = ["Balıkesir", "Denizli", "Gaziantep", "Nevşehir", "Ordu"];
let INTERVIEW_RESULTS = ["Mülakat yapıldı, sonucu olumlu", "Mülakat yapıldı sonucu başarısız, aday beğenilmedi", "Mülakat yapıldı sonucu başarısız, aday mülakata katılmadı", "Mülakat yapıldı sonucu başarısız, aday teklifi reddetti", "Mülakat iptal edildi"];
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

async function loadTables(querySelector = "table.load tbody") {
  let tBodies = document.querySelectorAll(querySelector);

  let key = window.location.pathname.includes("candidate") ? "memberId" : "companyId";
  let id = getId(key);
  if (!id) { id = USER.id; }

  let req = {};
  req[key] = id;

  for (let tbody of tBodies) {
    tbody.innerHTML = getMsgLine("Yükleniyor...");

    let result = await api(`${tbody.id}/GetAll`, req);
    if (!result || result.error || !result.isSuccess) {
      tbody.innerHTML = getMsgLine("Veri yüklenemedi");
      tbody.dispatchEvent(new CustomEvent("tableLoaded", { detail: { data: null, error: true } }));
      continue;
    }

    let data = result.data;
    if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
      data = [data];
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = getMsgLine("Veri yok");
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

        if ((key === "start" || key === "end" || key.toLowerCase().includes("date")) && value && value !== "-") {
          value = formatDateLong(value);
        }
        else if (key === "createdAt" && value && value !== "-") {
          value = formatTimeLong(value);
        }

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

    tbody.innerHTML = "";
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
    return null;
  }

  if (result.data) {
    for (let prop in result.data) {
      let $s = document.getElementById(prop);
      if ($s) {
        let v = result.data[prop] || "-";
        if ((prop === "start" || prop === "end" || prop.toLowerCase().includes("date")) && v && v !== "-") {
          v = formatDateLong(v);
        }

        let tag = ($s.tagName || "").toLowerCase();
        if (tag === "img") {
          $s.src = v;
          if (!v || v === "-") { $s.src = "./s/profile.png"; }
        } else if (tag === "textarea") {
          $s.value = v;
        } else if (prop.endsWith("Url") && v && v !== "-") {
          $s.innerHTML = "";
          let $a = a(v, v);
          $a.target = "_blank";
          $s.append($a);
        } else {
          $s.textContent = v;
        }
      }

      let placeholder = `{${prop}}`;
      let $links = document.querySelectorAll(`a[href*="${placeholder}"]`);
      if ($links.length > 0) {
        let v = result.data[prop] || "";
        $links.forEach($link => {
          $link.href = $link.href.replace(placeholder, v);
        });
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
          } else if (tag === "input" && type === "date" && v) {
            $i.value = formatDateInput(v);
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

      let $btn = document.querySelector("main button");
      if ($btn) {
        $btn.disabled = false;
        if ($btn.nextElementSibling) {
          $btn.nextElementSibling.innerHTML = "";
        }
      }
    } else {
      console.error("API error:", result);
      return id;
    }
  }

  return id;
}
