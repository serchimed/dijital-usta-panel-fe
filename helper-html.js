let DELAY_00 = 12;
let DELAY_0 = 123;
let DELAY_1 = 1234;
let DELAY_2 = 2345;

function getId(key = "memberId") {
  let qs = new URLSearchParams(window.location.search);
  let id = qs.get("id");

  if (!id) {
    id = USER.id;
    if (key !== "memberId") {
      id = USER.companyId;
    }
  }

  if (!id) {
    console.warn(`No ID in query string or user context for key: ${key}`);
    return null;
  }

  return id;
}

function getTomorrow() {
  let t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().split('T')[0];
}

function getMsgLine(msg) {
  return `<tr><td colspan="99" style="text-align:center; color:gray;">${msg}</td></tr>`;
}

function div(className) {
  let $d = document.createElement("div");
  if (className) { $d.className = className; }
  return $d;
}

function btn(className, text) {
  let $b = document.createElement("button");
  $b.type = "button";
  if (className) { $b.className = className; }
  if (text) { $b.textContent = text; }
  return $b;
}

function h3(text) {
  let $h = document.createElement("h3");
  if (text) { $h.textContent = text; }
  return $h;
}

function lbl(text) {
  let $l = document.createElement("label");
  if (text) { $l.textContent = text; }
  return $l;
}

function date(value) {
  let $i = document.createElement("input");
  $i.type = "date";
  if (value) { $i.value = value; }
  return $i;
}

function url(placeholder) {
  let $i = document.createElement("input");
  $i.type = "url";
  if (placeholder) { $i.placeholder = placeholder; }
  return $i;
}

function inp(placeholder) {
  let $i = document.createElement("input");
  $i.type = "text";
  if (placeholder) { $i.placeholder = placeholder; }
  return $i;
}

function chk(value, checked) {
  let $i = document.createElement("input");
  $i.type = "checkbox";
  if (value !== undefined) { $i.value = value; }
  if (checked !== undefined) { $i.checked = checked; }
  return $i;
}

function ul() {
  return document.createElement("ul");
}

function li(text) {
  let $li = document.createElement("li");
  if (text) { $li.textContent = text; }
  return $li;
}

function tr() {
  return document.createElement("tr");
}

function a(text, href) {
  let $a = document.createElement("a");
  if (href) { $a.href = href; }
  if (text) { $a.textContent = text; }
  return $a;
}

function p(text) {
  let $p = document.createElement("p");
  if (text) { $p.textContent = text; }
  return $p;
}

function td(text) {
  let $td = document.createElement("td");
  if (text) { $td.textContent = text; }
  return $td;
}

function th(text) {
  let $th = document.createElement("th");
  if (text) { $th.textContent = text; }
  return $th;
}

function tda(text, href) {
  let $td = td();
  let $a = a(text, href);
  $a.target = "_blank";
  $td.append($a);
  return $td;
}

function tdbtn(btn) {
  let $td = td();
  $td.append(btn, p());
  return $td;
}

function val(id) {
  let $i = document.getElementById(id);
  if ($i) { return ($i.value || "").trim(); }
  return undefined;
}

function formatDateLong(dateStr) {
  if (!dateStr) return "-";
  let dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return dateStr;
  return dt.toLocaleDateString("tr-TR", { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatTimeLong(dateStr) {
  if (!dateStr) return "-";
  let dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return dateStr;
  return dt.toLocaleDateString("tr-TR", { day: '2-digit', month: 'long', year: 'numeric' }) + " " + dt.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDateInput(dateStr) {
  if (!dateStr) return "";
  let dt = new Date(dateStr);
  if (isNaN(dt.getTime())) return "";
  return dt.toISOString().split('T')[0];
}

function checkEmail(email) {
  return email.includes("@") && email.includes(".") && email.indexOf("@") < email.lastIndexOf(".") && email.indexOf(" ") < 0 && email.length >= 5;
}

function checkPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  return /^0\d{10}$/.test(phone);
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
  $o.className = "overlay";
  let $p = p(msg);
  $p.className = "overlay-p";
  $o.append($p);
  document.body.append($o);
  return $o;
}

function showContent() {
  let $m = document.querySelector("main");
  if ($m) {
    let $o = document.querySelector(".overlay");
    if ($o) { $o.remove(); }
    $m.style.visibility = "visible";
  }
}

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

function hasChanges(initReq, req) {
  for (let key in req) {
    if (req[key] !== initReq[key]) {
      return true;
    }
  }
  return false;
}

let AUTOCOMPLETE_LISTENER_ADDED = false;

function autocomplete($input, data, filterFn, displayFn, onSelect, options = {}) {
  let items = [];
  let dataLoaded = false;
  let ignoreNextInput = false;

  let $list = div();
  $input.after($list);

  let $customInput;
  if (options.allowCustom && options.customInputPlaceholder) {
    $customInput = inp(options.customInputPlaceholder);
    $customInput.style.display = "none";
    $list.after($customInput);
  }

  async function loadData() {
    if (dataLoaded) return;
    if (typeof data === 'function') {
      items = await data();
    } else {
      items = data;
    }
    dataLoaded = true;
  }

  async function search(text) {
    $list.innerHTML = "";
    $list.classList.remove("show");

    if (!text) return;

    await loadData();

    let filtered = items.filter(item => filterFn(item, text));
    if (filtered.length === 0) return;

    filtered.forEach(item => {
      let $item = div();
      $item.textContent = displayFn(item);

      $item.addEventListener(CLICK_EVENT, function (e) {
        e.stopPropagation();
        e.preventDefault();

        $list.classList.remove("show");
        ignoreNextInput = true;

        setTimeout(() => {
          onSelect(item, $input, $customInput);
          setTimeout(() => { ignoreNextInput = false; }, DELAY_0);
        }, DELAY_00);
      });

      $list.append($item);
    });

    if (options.allowCustom) {
      let $custom = div();
      $custom.textContent = options.customText || "Listede yok";
      $custom.style.fontStyle = "italic";
      $custom.style.color = "#666";

      $custom.addEventListener(CLICK_EVENT, function (e) {
        e.stopPropagation();

        if ($customInput) {
          $input.style.display = "none";
          $customInput.style.display = "block";
          $customInput.focus();
        }

        if (options.onCustom) {
          options.onCustom($input, $customInput);
        }

        $list.classList.remove("show");
      });

      $list.append($custom);
    }

    $list.classList.add("show");
  }

  $input.addEventListener("input", function () {
    if (ignoreNextInput) return;
    search(this.value.trim());
  });

  $input.addEventListener("focus", function () {
    if (this.value.trim()) {
      search(this.value.trim());
    }
  });

  $input.addEventListener("blur", function () {
    setTimeout(() => {
      $list.classList.remove("show");
    }, DELAY_0);
  });

  if (!AUTOCOMPLETE_LISTENER_ADDED) {
    document.addEventListener(CLICK_EVENT, function (e) {
      if (!e.target.closest(".sel")) {
        document.querySelectorAll(".sel div").forEach($list => {
          $list.classList.remove("show");
        });
      }
    });
    AUTOCOMPLETE_LISTENER_ADDED = true;
  }

  return { $list, $customInput };
}
