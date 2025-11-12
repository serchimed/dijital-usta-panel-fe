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

  let result = await api("EmailTemplate/GetAll", {});
  if (result && result.isSuccess) {
    let tbody = document.getElementById("EmailTemplates");
    tbody.textContent = "";

    for (let template of result.data) {
      let $tr = tr();
      $tr.append(td(template.subject, "Konu"));
      $tr.append(td(template.textContent, "Metin İçerik"));
      $tr.append(td(template.htmlContent, "HTML İçerik"));
      $tr.append(tda("Güncelle", "admin-email-edit.html?id=" + template.id, ""));

      tbody.append($tr);
    }
  } else { logErr(result); }

  setFilters();
});
