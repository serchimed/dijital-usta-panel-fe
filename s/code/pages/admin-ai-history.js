onAuthReady(async () => {
  let $tbody = document.getElementById("AIHistory");

  if ($tbody) {
    $tbody.addEventListener("tableLoaded", (e) => {
      let data = e.detail.data;
      if (!data || data.length === 0) { return; }

      let rows = e.target.querySelectorAll("tr");
      rows.forEach((tr, index) => {
        let item = data[index];
        if (!item) return;

        let promptCell = tr.querySelector('td[data-label="Giden Prompt"]');
        let answerCell = tr.querySelector('td[data-label="Gelen Cevap"]');

        if (promptCell && item.prompt) {
          promptCell.innerHTML = "";
          promptCell.append(createExpandableText(item.prompt));
        }

        if (answerCell && item.answer) {
          answerCell.innerHTML = "";
          answerCell.append(createExpandableText(item.answer));
        }
      });
    });
  }

  await loadTables("#AIHistory");
});
