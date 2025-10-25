onAuthReady(() => {
  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = {
      lines: val("lines"),
      pointType: val("pointType")
    };

    req.lines = (req.lines || "").trim();

    if (!req.lines) {
      $msg.innerHTML = "• E-posta adreslerini ve puanlarını giriniz.";
      return;
    }

    let rows = req.lines.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let errs = [];
    let normalized = [];

    rows.forEach((line, idx) => {
      let i = idx + 1;
      let parts = line.split(",").map(s => s.trim());

      if (parts.length !== 2) {
        errs.push(`Satır ${i}: "eposta,puan" biçiminde olmalıdır.`);
        return;
      }

      let email = parts[0];
      let scoreStr = parts[1];
      let score = Number(scoreStr);

      if (!checkEmail(email)) {
        errs.push(`Satır ${i}: Geçersiz e-posta (${email}).`);
      }
      if (!Number.isFinite(score) || score < 0 || score > 100) {
        errs.push(`Satır ${i}: Puan 0-100 arasında olmalıdır (${scoreStr}).`);
      }

      normalized.push(`${email},${scoreStr}`);
    });

    if (errs.length) {
      $msg.textContent = errs.map(e => `• ${e}`).join("\n");
      return;
    }

    req.lines = normalized.join("\n");
    $msg.textContent = "";

    await apiBtn(
      this,
      "CandidatePoint/Add",
      req,
      "Puanlar eklendi.",
      ERROR_MESSAGE_DEFAULT,
      "admin-candidate-list.html"
    );
  });
});
