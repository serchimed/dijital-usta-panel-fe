onAuthReady(async () => {
  await fillInputs("AI/GetSettings");

  let $btnSaveAPI = document.getElementById("btnSaveAPI");
  $btnSaveAPI.addEventListener(CLICK_EVENT, async function () {
    let apiKeyGoogle = val("apiKeyGoogle");
    let apiKeyOpenAI = val("apiKeyOpenAI");

    if (!apiKeyGoogle && !apiKeyOpenAI) {
      let $msg = this.nextElementSibling;
      $msg.textContent = "En az bir API key girilmelidir.";
      return;
    }

    await apiBtn(this, "AI/UpdateAPIKeys", { apiKeyGoogle: apiKeyGoogle, apiKeyOpenAI: apiKeyOpenAI }, "API Key'ler güncellendi.", "API Key güncellenemedi.");
  });

  let $btnSavePrompt = document.getElementById("btnSavePrompt");
  $btnSavePrompt.addEventListener(CLICK_EVENT, async function () {
    let promptText = val("promptText");

    if (!promptText) {
      let $msg = this.nextElementSibling;
      $msg.textContent = "Prompt metni boş olamaz.";
      return;
    }
    if (promptText.length > 5000) {
      let $msg = this.nextElementSibling;
      $msg.textContent = "Prompt metni 5000 karakterden uzun olamaz.";
      return;
    }

    await apiBtn(this, "AI/UpdatePrompt", { promptText: promptText }, "Prompt güncellendi.", "Prompt güncellenemedi.");
  });

  let cityResult = await api("City/GetAll", {});
  if (cityResult && cityResult.isSuccess) {
    let cityTbody = document.getElementById("City");
    cityTbody.textContent = "";

    for (let city of cityResult.data) {
      let $tr = tr();
      $tr.append(td(city.name, "İl"));
      $tr.append(td(formatDateLong(city.listFinalization), "Liste Teslim"));
      $tr.append(td(formatDateLong(city.informingEvent), "Bilgilendirme Buluşması"));
      $tr.append(td(formatDateLong(city.tobbTrainingStart), "TOBB ETÜ Eğitimi Başlangıç"));
      $tr.append(td(formatDateLong(city.tobbTrainingEnd), "TOBB ETÜ Eğitimi Bitiş"));
      $tr.append(td(formatDateLong(city.graduationEvent), "Mezuniyet Buluşması"));
      $tr.append(td(formatDateLong(city.candidateProfileCompletionStart), "Aday Profil Tamamlama Başlangıç"));
      $tr.append(td(formatDateLong(city.candidateLetterEnd), "Motivasyon Mektubu Yazma Bitiş"));
      $tr.append(td(formatDateLong(city.companyCandidateSelectionStart), "Firma Aday Eşleşme Başlangıç"));
      $tr.append(td(formatDateLong(city.companyCandidateSelectionEnd), "Firma Aday Eşleşme Bitiş"));
      $tr.append(td(formatDateLong(city.workStart), "İşe Başlama"));
      $tr.append(tda("Güncelle", "admin-city-edit.html?id=" + city.id, ""));

      cityTbody.append($tr);
    }
  } else { logErr(cityResult); }

  let result = await api("EmailTemplate/GetAll", {});
  if (result && result.isSuccess) {
    let tbody = document.getElementById("EmailTemplates");
    tbody.textContent = "";

    for (let template of result.data) {
      let $tr = tr();
      $tr.append(td(template.subject, "Konu"));
      $tr.append(td(template.textContent, "Metin İçerik"));
      $tr.append(td(template.htmlContent, "HTML İçerik"));

      let $previewBtn = btn("btn-act", "Önizle");
      $previewBtn.addEventListener(CLICK_EVENT, function () {
        let $mbody = div();

        let $iframe = document.createElement("iframe");
        $iframe.style.width = "100%";
        $iframe.style.minHeight = "500px";
        $iframe.style.border = "1px solid #ddd";
        $iframe.style.borderRadius = "4px";
        $iframe.style.backgroundColor = "#fff";

        $mbody.append($iframe);

        let $modal = createModal("Eposta Önizleme: " + template.subject, $mbody);

        setTimeout(() => {
          let iframeDoc = $iframe.contentDocument || $iframe.contentWindow.document;
          iframeDoc.open();
          iframeDoc.write(template.htmlContent || "<p>HTML içerik bulunamadı.</p>");
          iframeDoc.close();
        }, 100);
      });

      let $tdActions = td(null, "");
      $tdActions.append($previewBtn);
      $tdActions.append(document.createElement("br"));
      let $updateLink = a("Güncelle", "admin-email-edit.html?id=" + template.id);
      $updateLink.target = "_blank";
      $tdActions.append($updateLink);

      $tr.append($tdActions);

      tbody.append($tr);
    }
  } else { logErr(result); }

  setFilters();
});
