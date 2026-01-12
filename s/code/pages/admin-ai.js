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

  let $d = document.getElementById("AIHistoryDetails");
  $d.addEventListener(CLICK_EVENT, async (e) => {
    if (!$d.hasAttribute("open") && !$d.dataset.loaded) {
      $d.dataset.loaded = true;
      await loadTables("#AIHistory");

      setTimeout(() => {
        document.querySelectorAll('td[data-label="Giden Prompt"], td[data-label="Gelen Cevap"]').forEach($td => {
          $td.addEventListener(CLICK_EVENT, function(e) {
            e.stopPropagation();
            this.classList.toggle('expanded');
          });
        });
      }, DELAY_CONFIG._0);
    }
  });
});
