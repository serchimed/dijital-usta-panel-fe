onAuthReady(async () => {
  let btnWP = document.getElementById("btnWP");
  btnWP.addEventListener(CLICK_EVENT, function () {
    createConfirmationModal({
      confirmMessage: "Wordpress güncel CSV'sini indirmeyi başlatmak istediğinize emin misiniz?",
      apiEndpoint: "Data/GetWordpressData",
      confirmButtonText: "Başlat",
      sourceButton: this
    });
  });

  let btnSync = document.getElementById("btnSync");
  btnSync.addEventListener(CLICK_EVENT, function () {
    createConfirmationModal({
      confirmMessage: "Wordpress verilerini eşlemek istediğinize emin misiniz?",
      apiEndpoint: "Data/SyncWordpressData",
      confirmButtonText: "Eşle",
      sourceButton: this
    });
  });

  async function loadFileTable(tableId, apiEndpoint, downloadEndpoint) {
    let $tbody = document.getElementById(tableId);
    let result = await api(apiEndpoint, {});

    if (!result || result.error || !result.isSuccess) {
      $tbody.innerHTML = getMsgLine("Veri yüklenemedi");
      return;
    }

    let files = result.data;
    if (!Array.isArray(files) || files.length === 0) {
      $tbody.innerHTML = getMsgLine("Veri yok");
      return;
    }

    $tbody.innerHTML = "";
    for (let file of files) {
      let $tr = tr();
      $tr.append(td(file.fileName));
      $tr.append(td(file.sizeKB));

      let $downloadBtn = btn("btn-gray", "İndir");
      $downloadBtn.addEventListener(CLICK_EVENT, async function () {
        this.disabled = true;
        let $msg = this.nextElementSibling;

        await downloadCsv(downloadEndpoint, { fileName: file.fileName }, file.fileName, $msg);

        this.disabled = false;
      });

      $tr.append(tdbtn($downloadBtn));
      $tbody.append($tr);
    }
  }

  await loadFileTable("wpResultsTable", "Data/GetWordpressResults", "Data/GetWordpressResultFile");
  await loadFileTable("backupsTable", "Data/GetBackups", "Data/GetBackupFile");

  setFilters();

  let btnTriggerBackup = document.getElementById("btnTriggerBackup");
  btnTriggerBackup.addEventListener(CLICK_EVENT, function () {
    let $mbody = div();
    let $confirmLabel = p("Sistemin bu anki durumunun yedeğini almak istediğinize emin misiniz?");
    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleConfirm = async function () {
      setButtonLoading(buttons.submitBtn, true);
      btnTriggerBackup.disabled = true;

      let result = await api("Data/TriggerBackup", {});

      if (result && result.isSuccess) {
        showModalMessage($msgDiv, "success", "Yedek başarıyla oluşturuldu!");
        setButtonLoading(buttons.submitBtn, false);
        setTimeout(async () => {
          closeModal($modal);
          await loadFileTable("backupsTable", "Data/GetBackups", "Data/GetBackupFile");
          btnTriggerBackup.disabled = false;
        }, DELAY_2);
      } else {
        showModalMessage($msgDiv, "error", result?.data || result?.message || ERROR_MESSAGE_DEFAULT);
        setButtonLoading(buttons.submitBtn, false);
        btnTriggerBackup.disabled = false;
      }
    };

    let buttons = createModalButtons("İptal", "Evet, Backup Al", () => closeModal($modal), handleConfirm);
    $mbody.append($confirmLabel, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("Backup Onayı", $mbody);
  });

  let btnBackupCheck = document.getElementById("btnBackupCheck");
  let btnBackupApprove = document.getElementById("btnBackupApprove");
  let backupFileInput = document.getElementById("backupFile");

  backupFileInput.value = "";

  btnBackupCheck.addEventListener(CLICK_EVENT, async function () {
    if (!backupFileInput.files || !backupFileInput.files[0]) {
      let $mbody = div();
      let $msgDiv = div(CSS_CLASSES.modalMessage);
      showModalMessage($msgDiv, "error", "Lütfen önce bir yedek dosyası seçin");
      $mbody.append($msgDiv);
      let $modal = createModal("Uyarı", $mbody);
      setTimeout(() => closeModal($modal), DELAY_2);
      return;
    }

    this.disabled = true;
    this.classList.remove("btn-act");
    this.classList.add("btn-gray");

    btnBackupApprove.disabled = true;

    try {
      let formData = new FormData();
      formData.append('File', backupFileInput.files[0]);

      let response = await fetch(`${API}Data/CheckBackup`, {
        method: "POST",
        credentials: "include",
        body: formData
      });

      if (!response.ok) {
        let $mbody = div();
        let $msgDiv = div(CSS_CLASSES.modalMessage);
        showModalMessage($msgDiv, "error", "Yedek analizi başarısız");
        $mbody.append($msgDiv);
        let $modal = createModal("Hata", $mbody);
        setTimeout(() => closeModal($modal), DELAY_2);
        document.getElementById("backupAnalysisResults").style.display = "none";
        return;
      }

      let result = await response.json();

      if (!result || result.error || !result.isSuccess) {
        let $mbody = div();
        let $msgDiv = div(CSS_CLASSES.modalMessage);
        showModalMessage($msgDiv, "error", result?.message || "Yedek analizi başarısız");
        $mbody.append($msgDiv);
        let $modal = createModal("Hata", $mbody);
        setTimeout(() => closeModal($modal), DELAY_2);
        document.getElementById("backupAnalysisResults").style.display = "none";
        return;
      }

      displayBackupAnalysis(result.data);
      btnBackupApprove.disabled = false;
      btnBackupApprove.classList.remove("btn-gray");
      btnBackupApprove.classList.add("btn-act");

    } catch (error) {
      let $mbody = div();
      let $msgDiv = div(CSS_CLASSES.modalMessage);
      showModalMessage($msgDiv, "error", "Yedek analizi sırasında hata oluştu: " + error.message);
      $mbody.append($msgDiv);
      let $modal = createModal("Hata", $mbody);
      setTimeout(() => closeModal($modal), DELAY_2);
      document.getElementById("backupAnalysisResults").style.display = "none";
    } finally {
      this.disabled = false;
      this.classList.remove("btn-gray");
      this.classList.add("btn-act");
    }
  });

  btnBackupApprove.addEventListener(CLICK_EVENT, function () {
    if (!backupFileInput.files || !backupFileInput.files[0]) {
      let $mbody = div();
      let $msgDiv = div(CSS_CLASSES.modalMessage);
      showModalMessage($msgDiv, "error", "Lütfen önce bir yedek dosyası seçin");
      $mbody.append($msgDiv);
      let $modal = createModal("Uyarı", $mbody);
      setTimeout(() => closeModal($modal), DELAY_2);
      return;
    }

    let $mbody = div();
    let $confirmLabel = p("Veritabanını yedek dosyası ile geri yüklemek istediğinize emin misiniz?");
    let $warningP = p("⚠️ DİKKAT: Bu işlem geri alınamaz! Mevcut veriler yedeklenip, sistem tamamen seçili yedek dosyasına geri yüklenecektir.");
    $warningP.style.color = "#c0392b";
    $warningP.style.fontWeight = "bold";
    $warningP.style.marginTop = "10px";
    let $msgDiv = div(CSS_CLASSES.modalMessage);
    let $modal;

    let handleConfirm = async function () {
      setButtonLoading(buttons.submitBtn, true);
      btnBackupApprove.disabled = true;
      btnBackupApprove.classList.remove("btn-act");
      btnBackupApprove.classList.add("btn-gray");

      try {
        let formData = new FormData();
        formData.append('File', backupFileInput.files[0]);

        let response = await fetch(`${API}Data/Restore`, {
          method: "POST",
          credentials: "include",
          body: formData
        });

        if (!response.ok) {
          showModalMessage($msgDiv, "error", "Geri yükleme işlemi başarısız");
          setButtonLoading(buttons.submitBtn, false);
          btnBackupApprove.disabled = false;
          btnBackupApprove.classList.remove("btn-gray");
          btnBackupApprove.classList.add("btn-act");
          return;
        }

        let result = await response.json();

        if (result && result.isSuccess) {
          let data = result.data;
          let successMsg = "Geri yükleme başarılı! ";

          if (data && typeof data === 'object') {
            successMsg += `\n• Toplam: ${data.totalRecords || 0} kayıt`;
            if (data.addedRecordsCount > 0) successMsg += `\n• Eklenen: ${data.addedRecordsCount}`;
            if (data.updatedRecordsCount > 0) successMsg += `\n• Güncellenen: ${data.updatedRecordsCount}`;
            if (data.skippedRecordsCount > 0) successMsg += `\n• Atlanan: ${data.skippedRecordsCount}`;
            if (data.errorRecordsCount > 0) successMsg += `\n• Hatalı: ${data.errorRecordsCount}`;
            successMsg += "\n\nSayfa yeniden yükleniyor...";
          } else {
            successMsg += "Sayfa yeniden yükleniyor...";
          }

          showModalMessage($msgDiv, "success", successMsg);
          setButtonLoading(buttons.submitBtn, false);
          setTimeout(() => {
            closeModal($modal);
            location.reload();
          }, DELAY_2);
        } else {
          showModalMessage($msgDiv, "error", result?.data || result?.message || ERROR_MESSAGE_DEFAULT);
          setButtonLoading(buttons.submitBtn, false);
          btnBackupApprove.disabled = false;
          btnBackupApprove.classList.remove("btn-gray");
          btnBackupApprove.classList.add("btn-act");
        }

      } catch (error) {
        showModalMessage($msgDiv, "error", "Geri yükleme sırasında hata oluştu: " + error.message);
        setButtonLoading(buttons.submitBtn, false);
        btnBackupApprove.disabled = false;
        btnBackupApprove.classList.remove("btn-gray");
        btnBackupApprove.classList.add("btn-act");
      }
    };

    let buttons = createModalButtons("İptal", "Evet, Geri Yükle", () => closeModal($modal), handleConfirm);
    $mbody.append($confirmLabel, $warningP, buttons.buttonsDiv, $msgDiv);
    $modal = createModal("Geri Yükleme Onayı", $mbody);
  });

  function displayBackupAnalysis(data) {
    console.log("Backup analysis data:", data);

    if (!data || !data.summary) {
      let $mbody = div();
      let $msgDiv = div(CSS_CLASSES.modalMessage);
      showModalMessage($msgDiv, "error", "Yedek analiz verisi hatalı. Lütfen backend'i kontrol edin.");
      $mbody.append($msgDiv);
      let $modal = createModal("Hata", $mbody);
      setTimeout(() => closeModal($modal), DELAY_2);
      document.getElementById("backupAnalysisResults").style.display = "none";
      return;
    }

    document.getElementById("backupAnalysisResults").style.display = "block";

    let $summaryTable = document.getElementById("summaryTable");
    $summaryTable.innerHTML = "";
    let $tr = tr();
    $tr.append(td(data.summary.totalRecordsInBackup || 0));
    $tr.append(td(data.summary.totalRecordsInSystem || 0));
    $tr.append(td(data.summary.newRecordsCount || 0));
    $tr.append(td(data.summary.updatedRecordsCount || 0));
    $tr.append(td(data.summary.deletedRecordsCount || 0));
    $tr.append(td(data.summary.unchangedRecordsCount || 0));
    $summaryTable.append($tr);

    let $recordsByTypeTable = document.getElementById("recordsByTypeTable");
    $recordsByTypeTable.innerHTML = "";
    if (data.recordsByType && Array.isArray(data.recordsByType)) {
      for (let record of data.recordsByType) {
        let $tr = tr();
        let $tdType = td();
        $tdType.append(strong(record.typeName || '-'));
        $tr.append($tdType);
        $tr.append(td(record.totalInBackup || 0));
        $tr.append(td(record.totalInSystem || 0));
        $tr.append(td(record.new || 0));
        $tr.append(td(record.updated || 0));
        $tr.append(td(record.deleted || 0));
        $tr.append(td(record.unchanged || 0));
        $recordsByTypeTable.append($tr);
      }
    }

    displayRecordGroup(data.newRecords || [], "newRecordsSection", false);
    displayRecordGroup(data.updatedRecords || [], "updatedRecordsSection", true);
    displayRecordGroup(data.deletedRecords || [], "deletedRecordsSection", false);
  }

  function displayRecordGroup(records, sectionId, showDates) {
    let $section = document.getElementById(sectionId);
    $section.innerHTML = "";

    if (!records || records.length === 0) {
      $section.innerHTML = '<p class="graytr">Hiç kayıt yok</p>';
      return;
    }

    for (let group of records) {
      let $details = details();
      $details.style.marginBottom = "15px";

      let $summary = summary();
      let $strong = strong(group.typeName);
      $summary.append($strong);
      $summary.append(` (${group.count} kayıt)`);
      $details.append($summary);

      let $div = div();
      let $table = table();

      let $thead = thead();
      let $theadTr = tr();
      $theadTr.append(th("ID"));
      if (showDates) {
        $theadTr.append(th("Yedek Tarihi"));
        $theadTr.append(th("Sistem Tarihi"));
      } else {
        $theadTr.append(th("Tarih"));
      }
      $thead.append($theadTr);
      $table.append($thead);

      let $tbody = tbody();
      for (let record of group.records) {
        let $tr = tr();
        $tr.append(td(record.id));
        if (showDates) {
          $tr.append(td(record.backupCreatedAt || '-'));
          $tr.append(td(record.currentCreatedAt || '-'));
        } else {
          $tr.append(td(record.createdAt || record.backupCreatedAt || '-'));
        }
        $tbody.append($tr);
      }
      $table.append($tbody);
      $div.append($table);

      if (group.hasMore) {
        let $p = p();
        $p.style.color = "gray";
        $p.style.fontStyle = "italic";
        $p.style.marginTop = "10px";
        $p.textContent = `... ve ${group.count - 5} kayıt daha`;
        $div.append($p);
      }

      $details.append($div);
      $section.append($details);
    }
  }

  setFilters();
});
