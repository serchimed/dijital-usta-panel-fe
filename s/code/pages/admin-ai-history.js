onAuthReady(async () => {
  await loadTables("#AIHistory");

  setTimeout(() => {
    document.querySelectorAll('td[data-label="Giden Prompt"], td[data-label="Gelen Cevap"]').forEach($td => {
      $td.addEventListener(CLICK_EVENT, function(e) {
        e.stopPropagation();
        this.classList.toggle('expanded');
      });
    });
  }, DELAY_0);
});
