let DELAY_00 = 12;
let DELAY_0 = 123;
let DELAY_1 = 1111;
let DELAY_2 = 1987;
let DELAY_6 = 60000;
let DELAY_12 = 120000;

function getId(key = "memberId") {
  let qs = new URLSearchParams(window.location.search);
  let id = qs.get(key) || qs.get("id");

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
  let $tr = tr();
  let $td = td(msg);
  $td.colSpan = 99;
  $td.className = "graytr";
  $tr.append($td);
  return $tr;
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

function chkComp(company) {
  let $l = document.createElement("label");
  let $s = document.createElement("span");
  $s.textContent = company.companyName;
  $l.append(chk(company.id, true), $s);
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

function txt(placeholder) {
  let $t = document.createElement("textarea");
  if (placeholder) { $t.placeholder = placeholder; }
  return $t;
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

function lia(text, href) {
  let $li = li();
  let $a = a(text, href);
  $li.append($a);
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

function td(text, label) {
  let $td = document.createElement("td");
  if (text) { $td.textContent = text; }
  if (label) { $td.setAttribute("data-label", label); }
  return $td;
}

function th(text) {
  let $th = document.createElement("th");
  if (text) { $th.textContent = text; }
  return $th;
}

function table() {
  return document.createElement("table");
}

function thead() {
  return document.createElement("thead");
}

function tbody() {
  return document.createElement("tbody");
}

function details() {
  return document.createElement("details");
}

function smry(text) {
  let $s = document.createElement("summary");
  if (text) { $s.textContent = text; }
  return $s;
}

function strong(text) {
  let $s = document.createElement("strong");
  if (text) { $s.textContent = text; }
  return $s;
}

function spn(text, className) {
  let $s = document.createElement("span");
  if (text) { $s.textContent = text; }
  if (className) { $s.className = className; }
  return $s;
}

function cleanUrlForDisplay(url) {
  if (!url || typeof url !== "string") return url;

  try {
    let cleanUrl = url.split('?')[0];
    let urlObj = new URL(cleanUrl);
    let hostname = urlObj.hostname.replace(/^www\./, '');
    let path = urlObj.pathname.replace(/^\/|\/$/g, '');
    if (!path || path.length <= 2) {
      return hostname;
    }

    return hostname + '/' + path;
  } catch {
    return url;
  }
}

function tda(text, href, label) {
  let $td = td(null, label);

  let displayText = text;
  if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
    displayText = cleanUrlForDisplay(text);
  }

  let $a = a(displayText, href);
  $a.target = "_blank";
  $td.append($a);
  return $td;
}

function tdbtn(btn, label) {
  let $td = td(null, label);
  $td.append(btn, p());
  return $td;
}

function val(id) {
  let $i = document.getElementById(id);
  if ($i) { return ($i.value || "").trim(); }
  return undefined;
}

function set(id, val) {
  let $i = document.getElementById(id);
  if ($i) { $i.value = val || ""; }
}

function formatDateLong(dateStr) {
  if (!dateStr) { return "-"; }
  let dt = new Date(dateStr);
  if (isNaN(dt.getTime())) { return dateStr; }
  if (dt.getFullYear() === 1) { return ""; }
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
  if (phone.length !== 11) return false;
  if (phone[0] !== '0') return false;

  for (let i = 0; i < phone.length; i++) {
    let charCode = phone.charCodeAt(i);
    if (charCode < 48 || charCode > 57) return false;
  }

  return true;
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

function showHeaderMsg(msg) {
  let $existingBanners = document.querySelectorAll(".head-msg");
  $existingBanners.forEach($b => $b.remove());

  let $banner = document.createElement("div");
  $banner.className = "head-msg";
  $banner.textContent = msg;
  let $header = document.querySelector("header");
  if ($header && $header.nextSibling) {
    $header.parentNode.insertBefore($banner, $header.nextSibling);
  } else if ($header) {
    $header.after($banner);
  } else {
    document.body.prepend($banner);
  }
  return $banner;
}

function showContent() {
  let $m = document.querySelector("main");
  if ($m) {
    hideOverlay();
    setTimeout(() => $m.classList.add("show"), DELAY_0);
  }
}

function hideOverlay() {
  let $o = document.querySelector(".overlay");
  if ($o) {
    $o.classList.add("fade-out");
    setTimeout(() => $o.remove(), DELAY_0 * 2);
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

function createExpandableText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return spn(text || "-");
  }

  let truncated = text.substring(0, maxLength) + "...";

  let $truncated = spn(truncated);
  $truncated.style.display = "inline-block";
  $truncated.style.fontSize = "15px";

  let $full = spn(text);
  $full.style.display = "none";

  let $toggle = spn(" [detay]");
  $toggle.style.cursor = "pointer";
  $toggle.style.color = "#0066cc";
  $toggle.addEventListener(CLICK_EVENT, function (e) {
    e.preventDefault();
    toggleText(this);
  });

  let $container = spn();
  $container.append($truncated, $full, $toggle);
  return $container;
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
    $list.textContent = "";
    $list.classList.remove("show");

    if (!text) return;

    await loadData();

    let filtered = items.filter(item => filterFn(item, text));
    if (filtered.length === 0) return;

    filtered.forEach(item => {
      let $item = div();
      $item.textContent = displayFn(item);

      $item.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        e.preventDefault();

        $list.classList.remove("show");
        ignoreNextInput = true;

        onSelect(item, $input, $customInput);
        setTimeout(() => { ignoreNextInput = false; }, DELAY_0);
      });

      $list.append($item);
    });

    if (options.allowCustom) {
      let $custom = div();
      $custom.textContent = options.customText || "Listede yok";
      $custom.style.fontStyle = "italic";
      $custom.style.color = "#666";

      $custom.addEventListener("mousedown", function (e) {
        e.stopPropagation();
        e.preventDefault();

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
    if (ignoreNextInput) { return; }
    search(this.value.trim());
  });

  $input.addEventListener("focus", function () {
    if (this.value.trim()) {
      search(this.value.trim());
    }
  });

  $input.addEventListener("blur", function () {
    setTimeout(() => { $list.classList.remove("show"); }, DELAY_0);
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

function showErrors($msg, errors) {
  if (errors.length) {
    $msg.textContent = errors.map(e => `• ${e}`).join("\n");
    return true;
  }
  return false;
}

function clearErrors($msg) {
  $msg.textContent = "";
}

function validateWordCount(text, maxWords, fieldName) {
  if (!text) return null;
  let wordCount = text.split(/\s+/).filter(Boolean).length;
  if (wordCount > maxWords) {
    return `${fieldName} en fazla ${maxWords} kelime olmalıdır. (Şu an: ${wordCount})`;
  }
  return null;
}

function getRequiredQueryParam(paramName, redirectUrl = "index.html") {
  let prms = new URLSearchParams(window.location.search);
  let value = prms.get(paramName);
  if (paramName === 'email' && value) {
    let regex = new RegExp(`[?&]${paramName}=([^&]*)`);
    let match = window.location.search.match(regex);
    if (match && match[1].includes('+')) {
      value = decodeURIComponent(match[1]);
    }
  }
  if (!value) {
    window.location.href = redirectUrl;
    return null;
  }
  return value;
}

function validateDateRange(startDate, endDate) {
  let errors = [];
  if (startDate && endDate) {
    let s = new Date(startDate);
    let e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      errors.push("Tarih formatı geçersiz.");
    } else if (s > e) {
      errors.push("Bitiş tarihi, başlangıç tarihinden önce olamaz.");
    }
  }
  return errors;
}
