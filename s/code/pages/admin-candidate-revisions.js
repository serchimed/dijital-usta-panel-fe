const FIELD_LABELS = {
  displayName: "Ad Soyad",
  email: "Email",
  phone: "Telefon",
  birthDate: "Doğum Tarihi",
  gender: "Cinsiyet",
  city: "İl",
  county: "İlçe",
  educationLevel: "Eğitim Durumu",
  university: "Üniversite",
  major: "Bölüm",
  classYear: "Sınıf",
  languages: "Yabancı Diller",
  motivationLetter: "Motivasyon Mektubu",
  status: "Durum",
  isInviteAccepted: "Davet Kabul Durumu",
  isHireApproved: "İşe Alım Onayı",
  hiredByCompanyId: "İşe Alan Firma ID",
  hiredCompanyName: "İşe Alan Firma",
  hireApprovedAt: "İşe Alım Onay Tarihi",
  isBlocked: "Engelli",
  pointOnlineExam: "Online Sınav Puanı",
  pointA: "Başarı Puanı A",
  pointTobb: "TOBB ETÜ Puanı",
  pointB: "Başarı Puanı B",
  aiApproved: "AI Değerlendirmesi Onayı",
  aiScore: "AI Puanı",
  aiEvaluation: "AI Değerlendirmesi",
  image: "Profil Fotoğrafı",
  name: "Ad",
  surname: "Soyad",
  // Experience fields
  companyName: "Firma Adı",
  position: "Pozisyon",
  start: "Başlangıç Tarihi",
  end: "Bitiş Tarihi",
  isOngoing: "Devam Ediyor",
  description: "Açıklama",
  isDeleted: "Silindi",
  // Certificate fields
  organization: "Kurum",
  year: "Yıl"
};

const TYPE_LABELS = {
  revision: "Profil Güncellemesi",
  letter: "Motivasyon Mektubu",
  history: "İşlem Geçmişi",
  experience: "İş Deneyimi",
  certificate: "Sertifika",
  image: "Fotoğraf Güncellemesi"
};

const ACTION_LABELS = {
  InviteAccepted: "Davet Kabul Edildi",
  FilledQuestions: "Anketi Cevapladı",
  PassedOnlineTraining: "Online Eğitimden Geçti",
  PassedExam: "Online Sınavdan Geçti",
  PassedTobbTraining: "TOBB Eğitiminden Geçti",
  Shortlisted: "Kısa Listeye Eklendi",
  ShortlistRemoved: "Kısa Listeden Çıkarıldı",
  Unshortlisted: "Kısa Listeden Çıkarıldı",
  InterviewReported: "Mülakat Raporu Girildi",
  InterviewedSuccess: "Mülakat Başarılı",
  InterviewedFailedNotLiked: "Mülakat Başarısız - Aday Beğenilmedi",
  InterviewedFailedNoShow: "Mülakat Başarısız - Aday Katılmadı",
  InterviewedFailedOfferRejected: "Mülakat Başarısız - Teklif Reddedildi",
  InterviewedFailedCancelled: "Mülakat İptal Edildi",
  HireApproved: "İşe Alım Onaylandı",
  HireInformed: "İşe Alım Bildirildi",
  Hired: "İşe Alındı",
  HireFailed: "İşe Alım İptal Edildi",
  Blocked: "Engellendi",
  Unblocked: "Engelleme Kaldırıldı"
};

// Karşılaştırmadan hariç tutulan alanlar:
// - Teknik alanlar: id, memberId, createdAt, updatedAt, revisionId, updatedBy, updatedByName, updatedByEmail, type, timestamp
// - Sadece current'ta olan alanlar (revision'da yok): motivationLetter, aIApproved, isInviteAccepted, isHired, isHireInformed, hiredCompanyName
const EXCLUDED_KEYS = ["id", "memberId", "createdAt", "updatedAt", "revisionId", "updatedBy", "updatedByName", "updatedByEmail", "type", "timestamp", "motivationLetter", "aIApproved", "isInviteAccepted", "isHired", "isHireInformed", "hiredCompanyName"];

function fmtVal(v) {
  if (v === null || v === undefined || v === "") {
    return "-";
  }
  if (v === "00000000-0000-0000-0000-000000000000") {
    return "-";
  }
  if (typeof v === "boolean") {
    return v ? "Evet" : "Hayır";
  }
  if (typeof v === "object") {
    return JSON.stringify(v);
  }
  return String(v);
}

function createImageEl(base64) {
  if (!base64 || base64 === "-") {
    let $span = spn();
    $span.textContent = "-";
    return $span;
  }
  let $img = document.createElement("img");
  $img.src = base64.startsWith("data:") ? base64 : "data:image/jpeg;base64," + base64;
  $img.style.maxWidth = "100px";
  $img.style.maxHeight = "100px";
  $img.style.borderRadius = "4px";
  return $img;
}

function isFalsy(v) {
  return v === null || v === undefined || v === false || v === "" || v === "00000000-0000-0000-0000-000000000000";
}

function getDiff(older, newer) {
  let changes = {};
  let allKeys = new Set([...Object.keys(older || {}), ...Object.keys(newer || {})]);

  for (let key of allKeys) {
    if (EXCLUDED_KEYS.includes(key)) {
      continue;
    }

    let oldRaw = older?.[key];
    let newRaw = newer?.[key];

    if (isFalsy(oldRaw) && isFalsy(newRaw)) {
      continue;
    }

    let oldVal = fmtVal(oldRaw);
    let newVal = fmtVal(newRaw);

    if (oldVal !== newVal) {
      changes[key] = { old: oldVal, new: newVal };
    }
  }
  return changes;
}

function renderRevisionDiff(changes, $content) {
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

function renderRevisionFull(data, $content) {
  for (let key in data) {
    if (EXCLUDED_KEYS.includes(key)) {
      continue;
    }
    let $label = lbl(FIELD_LABELS[key] || key);
    let $span = spn();
    $span.textContent = fmtVal(data[key]);
    $label.append($span);
    $content.append($label);
  }
}

function renderLetter(data, $content) {
  let $label = lbl("Motivasyon Mektubu");
  let $span = spn();
  $span.textContent = data.letter || "-";
  $span.style.whiteSpace = "pre-wrap";
  $label.append($span);
  $content.append($label);
}

function renderHistory(data, $content) {
  let actionText = ACTION_LABELS[data.action] || data.action;
  let $label = lbl("İşlem");
  let $span = spn();
  $span.textContent = actionText;
  $label.append($span);
  $content.append($label);

  if (data.companyName) {
    let $companyLabel = lbl("Firma");
    let $companySpan = spn();
    $companySpan.textContent = data.companyName;
    $companyLabel.append($companySpan);
    $content.append($companyLabel);
  }
}

function renderExperience(data, $content) {
  let fields = [
    { key: "companyName", label: "Firma Adı" },
    { key: "position", label: "Pozisyon" },
    { key: "start", label: "Başlangıç Tarihi", isDate: true },
    { key: "end", label: "Bitiş Tarihi", isDate: true },
    { key: "isOngoing", label: "Devam Ediyor" },
    { key: "description", label: "Açıklama" }
  ];

  if (data.isDeleted) {
    let $delLabel = lbl("Durum");
    let $delSpan = spn();
    $delSpan.textContent = "Silindi";
    $delSpan.style.color = "var(--red)";
    $delLabel.append($delSpan);
    $content.append($delLabel);
  }

  for (let field of fields) {
    let val = data[field.key];
    if (val === null || val === undefined) {
      continue;
    }

    let $label = lbl(field.label);
    let $span = spn();

    if (field.isDate && val) {
      $span.textContent = formatTimeLong(val);
    } else if (typeof val === "boolean") {
      $span.textContent = val ? "Evet" : "Hayır";
    } else {
      $span.textContent = val || "-";
    }

    if (field.key === "description") {
      $span.style.whiteSpace = "pre-wrap";
    }

    $label.append($span);
    $content.append($label);
  }
}

function renderCertificate(data, $content) {
  let fields = [
    { key: "name", label: "Sertifika Adı" },
    { key: "organization", label: "Kurum" },
    { key: "year", label: "Yıl" },
    { key: "description", label: "Açıklama" }
  ];

  if (data.isDeleted) {
    let $delLabel = lbl("Durum");
    let $delSpan = spn();
    $delSpan.textContent = "Silindi";
    $delSpan.style.color = "var(--red)";
    $delLabel.append($delSpan);
    $content.append($delLabel);
  }

  for (let field of fields) {
    let val = data[field.key];
    if (val === null || val === undefined) {
      continue;
    }

    let $label = lbl(field.label);
    let $span = spn();
    $span.textContent = val || "-";

    if (field.key === "description") {
      $span.style.whiteSpace = "pre-wrap";
    }

    $label.append($span);
    $content.append($label);
  }
}

function renderImage(data, $content) {
  let $label = lbl("Profil Fotoğrafı");
  $label.append(createImageEl(data.image));
  $content.append($label);
}

onAuthReady(async () => {
  let $container = document.getElementById("revisionsContainer");
  let $infoMsg = document.getElementById("infoMsg");
  let $displayName = document.getElementById("displayName");

  $infoMsg.textContent = "Yükleniyor...";

  let memberId = getId("memberId");

  // .qs linklerine ?id= parametresi ekle (admin-candidate-profile.html ?id= bekliyor)
  let $qsLinks = document.querySelectorAll(".qs");
  $qsLinks.forEach($a => $a.href = $a.href + "?id=" + memberId);

  let currentResult = await api("Candidate/Get", { MemberId: memberId });
  if (!currentResult || !currentResult.isSuccess) {
    $infoMsg.textContent = "Aday bilgileri yüklenemedi.";
    return;
  }

  let current = currentResult.data;
  if ($displayName && current.displayName) {
    $displayName.textContent = current.displayName;
  }

  let revisionsResult = await api("Candidate/Revisions", { MemberId: memberId });
  if (!revisionsResult || !revisionsResult.isSuccess) {
    $infoMsg.textContent = "Revizyon bilgileri yüklenemedi.";
    return;
  }

  let items = revisionsResult.data;
  if (!Array.isArray(items) || items.length === 0) {
    $infoMsg.textContent = "Henüz kayıt bulunmuyor.";
    return;
  }

  $infoMsg.textContent = items.length + " kayıt bulundu.";

  items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // revision tipindeki itemları ayır (diff için)
  let revisionItems = items.filter(item => item.type === "revision");

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    let itemData = item.data || item;
    let itemType = item.type || "revision";

    let $details = document.createElement("details");
    let $summary = document.createElement("summary");

    let dateStr = item.timestamp ? formatTimeLong(item.timestamp) : "-";
    let updatedBy = item.updatedByName ? item.updatedByName + " (" + item.updatedByEmail + ")" : "";
    let typeLabel = TYPE_LABELS[itemType] || itemType;

    let $content = div();

    if (itemType === "revision") {
      let revisionIndex = revisionItems.indexOf(item);
      let isLastRevision = revisionIndex === revisionItems.length - 1;

      if (isLastRevision) {
        let summaryText = dateStr;
        if (updatedBy) {
          summaryText += " - " + updatedBy;
        }
        $summary.textContent = summaryText;
        renderRevisionFull(itemData, $content);
      } else {
        // Daha eski revizyonla karşılaştır (eski → bu)
        let olderRevision = revisionItems[revisionIndex + 1];
        let olderData = olderRevision.data || olderRevision;
        let changes = getDiff(olderData, itemData);
        let changeCount = Object.keys(changes).length;

        if (changeCount === 0) {
          continue;
        }

        let summaryText = dateStr;
        if (updatedBy) {
          summaryText += " - " + updatedBy;
        }
        summaryText += " - " + changeCount + " alan değişti";
        $summary.textContent = summaryText;

        renderRevisionDiff(changes, $content);
      }
    } else if (itemType === "letter") {
      let summaryText = dateStr;
      if (updatedBy) {
        summaryText += " - " + updatedBy;
      }
      summaryText += " - " + typeLabel;
      $summary.textContent = summaryText;
      renderLetter(itemData, $content);
    } else if (itemType === "history") {
      let summaryText = dateStr;
      if (updatedBy) {
        summaryText += " - " + updatedBy;
      }
      summaryText += " - " + typeLabel;
      $summary.textContent = summaryText;
      renderHistory(itemData, $content);
    } else if (itemType === "experience") {
      let summaryText = dateStr;
      if (updatedBy) {
        summaryText += " - " + updatedBy;
      }
      summaryText += " - " + typeLabel;
      if (itemData.companyName) {
        summaryText += ": " + itemData.companyName;
      }
      if (itemData.isDeleted) {
        summaryText += " (Silindi)";
      }
      $summary.textContent = summaryText;
      renderExperience(itemData, $content);
    } else if (itemType === "certificate") {
      let summaryText = dateStr;
      if (updatedBy) {
        summaryText += " - " + updatedBy;
      }
      summaryText += " - " + typeLabel;
      if (itemData.name) {
        summaryText += ": " + itemData.name;
      }
      if (itemData.isDeleted) {
        summaryText += " (Silindi)";
      }
      $summary.textContent = summaryText;
      renderCertificate(itemData, $content);
    } else if (itemType === "image") {
      let summaryText = dateStr;
      if (updatedBy) {
        summaryText += " - " + updatedBy;
      }
      summaryText += " - " + typeLabel;
      $summary.textContent = summaryText;
      renderImage(itemData, $content);
    }

    $details.append($summary, $content);
    $container.append($details);
  }
});
