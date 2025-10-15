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
