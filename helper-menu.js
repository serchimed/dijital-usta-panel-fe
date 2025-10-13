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
  "candidate-profile-image": ["candidate"],
  "candidate-company-profile": ["candidate"],
  "candidate-experience-add": ["candidate"],
  "candidate-experience-edit": ["candidate"],
  "candidate-certificate-add": ["candidate"],
  "candidate-certificate-edit": ["candidate"]
};

function buildUserMenu() {
  let $m = document.querySelector("menu");
  if (!$m) { return; }

  let role = USER.role === "editor" ? "admin" : USER.role;
  let id = USER.role === "company" ? USER.companyId : USER.id;

  $m.innerHTML = "";
  let $profileLink = a(USER.name, `${role}-profile.html?id=${id}`);
  let $logoutLink = a("Çıkış", "logout.html");
  $m.append($profileLink, $logoutLink);
}

function buildRoleMenu() {
  let $m = document.querySelector("main");
  if (!$m) { return; }
  if (!$m.firstElementChild) { return; }

  let items = MENU[USER.role];
  if (items.length === 1) { window.location.href = items[0].href + ".html"; return; }

  items.forEach(i => {
    let $a = a(i.text, i.href + ".html");
    $m.firstElementChild.append($a);
  });
}
