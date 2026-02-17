const FIELD_LABELS = {
  companyName: "Firma Adı",
  city: "İl",
  sector: "Sektör",
  webUrl: "Web Sitesi",
  trendyolUrl: "Trendyol Satıcı Profili",
  driveUrl: "Drive Klasörü",
  responsibleMemberName: "Yetkili Adı Soyadı",
  email: "Yetkili E-posta",
  phone: "Yetkili Telefon",
  status: "Durum",
  isInviteAccepted: "Davet Kabul Durumu",
  candidateId: "İşe Alınan Aday ID",
  candidateName: "İşe Alınan Aday",
  hireApprovedAt: "İşe Alım Onay Tarihi"
};

function fmtVal(v) {
  if (v === null || v === undefined || v === "") return "-";
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function isFalsy(v) {
  return v === null || v === undefined || v === false || v === "" || v === "00000000-0000-0000-0000-000000000000";
}

function getDiff(older, newer) {
  let changes = {};
  let allKeys = new Set(Object.keys(newer || {}));

  for (let key of allKeys) {
    if (key === "id" || key === "companyId" || key === "createdAt" || key === "updatedAt" || key === "revisionId" || key === "updatedBy" || key === "updatedByName" || key === "updatedByEmail") continue;

    let oldRaw = older?.[key];
    let newRaw = newer?.[key];

    if (isFalsy(oldRaw) && isFalsy(newRaw)) continue;

    let oldVal = fmtVal(oldRaw);
    let newVal = fmtVal(newRaw);

    if (oldVal !== newVal) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }
  return changes;
}

onAuthReady(async () => {
  let $container = document.getElementById("revisionsContainer");
  let $infoMsg = document.getElementById("infoMsg");
  let $companyName = document.getElementById("companyName");

  $infoMsg.textContent = "Yükleniyor...";

  let companyId = getId("companyId");

  let $qsLinks = document.querySelectorAll(".qs");
  $qsLinks.forEach($a => $a.href = $a.href + "?id=" + companyId);

  let currentResult = await api("Company/Get", { CompanyId: companyId });
  if (!currentResult || !currentResult.isSuccess) {
    $infoMsg.textContent = "Firma bilgileri yüklenemedi.";
    return;
  }

  let current = currentResult.data;
  if ($companyName && current.companyName) {
    $companyName.textContent = current.companyName;
  }
  let revisionsResult = await api("Company/Revisions", { CompanyId: companyId });
  if (!revisionsResult || !revisionsResult.isSuccess) {
    $infoMsg.textContent = "Revizyon bilgileri yüklenemedi.";
    return;
  }

  let revisions = revisionsResult.data;
  if (!Array.isArray(revisions) || revisions.length === 0) {
    $infoMsg.textContent = "Henüz revizyon kaydı bulunmuyor.";
    return;
  }

  $infoMsg.textContent = revisions.length + " revizyon bulundu.";

  revisions.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  for (let i = 0; i < revisions.length; i++) {
    let revision = revisions[i];
    let isLastItem = i === revisions.length - 1;

    let $details = document.createElement("details");
    let $summary = document.createElement("summary");

    let revDate = revision.updatedAt || revision.createdAt;
    let dateStr = revDate ? formatTimeLong(revDate) : "-";
    let updatedBy = revision.updatedByName ? revision.updatedByName + " (" + revision.updatedByEmail + ")" : "";
    let summaryBase = updatedBy ? dateStr + " - " + updatedBy : dateStr;

    let $content = div();

    if (isLastItem) {
      $summary.textContent = summaryBase;

      for (let key in revision) {
        if (key === "id" || key === "companyId" || key === "createdAt" || key === "updatedAt" || key === "revisionId" || key === "updatedBy" || key === "updatedByName" || key === "updatedByEmail") continue;
        let $label = lbl(FIELD_LABELS[key] || key);
        let $span = spn();
        $span.textContent = fmtVal(revision[key]);
        $label.append($span);
        $content.append($label);
      }
    } else {
      let compareWith = i === 0 ? current : revisions[i - 1];
      let changes = getDiff(revision, compareWith);
      let changeCount = Object.keys(changes).length;

      if (changeCount === 0) continue;

      $summary.textContent = summaryBase + " - " + changeCount + " alan değişti";

      for (let key in changes) {
        let $label = lbl(FIELD_LABELS[key] || key);
        let $span = spn();

        let $del = document.createElement("del");
        $del.textContent = changes[key].old;

        let $ins = document.createElement("ins");
        $ins.textContent = changes[key].new;

        $span.append($del, " → ", $ins);
        $label.append($span);
        $content.append($label);
      }
    }

    $details.append($summary, $content);
    $container.append($details);
  }
});
