let $city = document.getElementById("city");
autocomplete($city, CITIES, (city, searchText) => city.toLowerCase().includes(searchText.toLowerCase()), (city) => city, (city, $input) => { $input.value = city; });

onAuthReady(() => {
  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = { lines: val("lines"), city: val("city") };
    req.lines = (req.lines || "").trim();

    let errors = [];
    if (!req.city) { errors.push("İl bilgisini giriniz."); }
    else if (!CITIES.includes(req.city)) { errors.push(`Sadece şu iller geçerli: ${CITIES.join(", ")}`); }
    if (!req.lines) {
      errors.push("E-posta adreslerini ve puanlarını giriniz.");
      if (showErrors($msg, errors)) { return; }
    }

    let rows = req.lines.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let normalized = [];

    rows.forEach((line, idx) => {
      let i = idx + 1;
      let parts = line.split(",").map(s => s.trim());

      if (parts.length !== 2) {
        errors.push(`Satır ${i}: "eposta,puan" biçiminde olmalıdır.`);
        return;
      }

      let email = parts[0];
      let scoreStr = parts[1];
      let score = Number(scoreStr);

      if (!checkEmail(email)) { errors.push(`Satır ${i}: Geçersiz e-posta (${email}).`); }
      if (!Number.isFinite(score) || score < 0 || score > 100) { errors.push(`Satır ${i}: Puan 0-100 arasında olmalıdır (${scoreStr}).`); }

      normalized.push(`${email},${scoreStr}`);
    });

    if (showErrors($msg, errors)) { return; }

    req.lines = normalized.join("\n");
    clearErrors($msg);

    await apiBtn(this, "Candidate/InviteAfterTobb", req, "Puanlar eklendi.", ERROR_MESSAGE_DEFAULT, "admin-candidate-list.html", null, DELAY_CONFIG._12, false);
  });
});
