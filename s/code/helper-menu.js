let MENU = {
  "admin": [
    { text: "Firmalar", href: "admin-company-list" },
    { text: "Adaylar", href: "admin-candidate-list" },
    { text: "Adminler ve Editörler", href: "admin-and-editor-list" },
    { text: "Toplu Puan Güncelle", href: "admin-point-update" },
    { text: "TOBB ETÜ Eğitiminden Geçenleri Davet Et", href: "admin-candidate-invite" },
    { text: "Yapay Zeka Ayarları", href: "admin-ai" },
    { text: "Data İşlemleri", href: "admin-data" }
  ],
  "company": [
    { text: "Adaylar", href: "company-candidate-list" }
  ],
  "candidate": [],
  "editor": [
    { text: "Firmalar", href: "admin-company-list" },
    { text: "Adaylar", href: "admin-candidate-list" }
  ],
  "guest": [
    { text: "Ana Sayfa", href: "index" },
    { text: "Giriş Yap", href: "login" },
    { text: "Şifre İste", href: "demand-password" }
  ]
};

let PUBLIC_PAGES = [
  "login",
  "demand-password",
  "access-denied",
  "error-client",
  "error-server",
  "candidate-invite-accept",
  "concent",
  "company-concent",
  "404"
];

let PAGE_ROLES = {
  "index": ["admin"],
  "logout": ["admin", "editor", "candidate", "company"],

  "admin-company-list": ["admin", "editor"],
  "admin-company-profile": ["admin", "editor"],
  "admin-candidate-list": ["admin", "editor"],
  "admin-candidate-list-included": ["admin"],
  "admin-candidate-profile": ["admin", "editor"],

  "admin-and-editor-list": ["admin"],
  "admin-company-add": ["admin", "editor"],
  "admin-editor-invite": ["admin"],
  "admin-candidate-invite": ["admin"],
  "admin-candidate-survey": ["admin"],
  "admin-point-update": ["admin"],
  "admin-ai": ["admin"],
  "admin-data": ["admin"],
  "admin-profile": ["admin"],
  "admin-profile-edit": ["admin"],

  "company-profile": ["company"],
  "company-profile-edit": ["company", "admin", "editor"],
  "company-candidate-list": ["company"],
  "company-candidate-profile": ["company"],

  "candidate-profile": ["candidate"],
  "candidate-profile-edit": ["candidate", "admin", "editor"],
  "candidate-profile-image": ["candidate"],
  "candidate-company-profile": ["candidate"],
  "candidate-letter-add": ["candidate"],
  "candidate-experience-add": ["candidate"],
  "candidate-experience-edit": ["candidate"],
  "candidate-certificate-add": ["candidate"],
  "candidate-certificate-edit": ["candidate"]
};

function initHamburgerMenu() {
  let $btn = document.querySelector("header button");
  let $nav = document.querySelector("nav");
  let $main = document.querySelector("main");

  if (!$btn || !$nav) return;

  function toggle() {
    let isOpen = $nav.classList.contains("active");
    if (isOpen) {
      $nav.classList.remove("active");
      $btn.classList.remove("active");
      if ($main) $main.classList.remove("dimmed");
      document.body.style.overflow = "";
    } else {
      $nav.classList.add("active");
      $btn.classList.add("active");
      if ($main) $main.classList.add("dimmed");
      document.body.style.overflow = "hidden";
    }
  }

  $btn.addEventListener(CLICK_EVENT, toggle);

  document.addEventListener(CLICK_EVENT, (e) => {
    if ($nav.classList.contains('active') &&
      !$nav.contains(e.target) &&
      !$btn.contains(e.target)) {
      toggle();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $nav.classList.contains('active')) {
      toggle();
    }
  });
}

function buildGuestMenu() {
  let $nav = document.querySelector("nav ul");
  if (!$nav) return;

  let path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  page = page.replace(".html", "");

  $nav.innerHTML = "";

  MENU.guest.forEach(item => {
    if (item.href === page) {
      let $li = li();
      $li.append(spn(item.text, "current-page"));
      $nav.append($li);
    } else {
      $nav.append(lia(item.text, item.href + ".html"));
    }
  });
}

function buildAuthenticatedMenu() {
  let $nav = document.querySelector("nav ul");
  if (!$nav) return;

  let path = window.location.pathname;
  let page = path.split("/").pop() || "index.html";
  page = page.replace(".html", "");

  $nav.innerHTML = "";

  if (USER.role === "admin") {
    if (page === "index") {
      let $li = li();
      $li.append(spn("Ana Sayfa", "current-page"));
      $nav.append($li);
    } else {
      $nav.append(lia("Ana Sayfa", "index.html"));
    }
  }

  let role = USER.role.toLowerCase();
  let items = MENU[role] || [];
  items.forEach(item => {
    if (item.href === page) {
      let $li = li();
      $li.append(spn(item.text, "current-page"));
      $nav.append($li);
    } else {
      $nav.append(lia(item.text, item.href + ".html"));
    }
  });

  $nav.append(li(""));

  let userRole = USER.role === "editor" ? "admin" : USER.role;
  let userId = USER.role === "company" ? USER.companyId : USER.id;
  $nav.append(lia(USER.name, `${userRole}-profile.html?id=${userId}`));
  $nav.append(lia("Çıkış", "logout.html"));

  updateLogoLink();
}

function updateLogoLink() {
  let $logoLink = document.querySelector("header a");
  if (!$logoLink || !USER) return;

  let role = USER.role.toLowerCase();

  if (role === "candidate") {
    $logoLink.href = `candidate-profile.html?id=${USER.id}`;
  } else if (role === "company") {
    $logoLink.href = "company-candidate-list.html";
  } else if (role === "admin") {
    $logoLink.href = "index.html";
  } else if (role === "editor") {
    $logoLink.href = "admin-company-list.html";
  }
}

onReady(() => {
  buildGuestMenu();
  initHamburgerMenu();
});


