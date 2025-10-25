onAuthReady(async () => {
  let candidateId = await fillSpans("Candidate/Survey");

  let $link = document.querySelector('a[href="admin-candidate-profile.html"]');
  if ($link && candidateId) { $link.href = `admin-candidate-profile.html?id=${candidateId}`; }

  let $surveyWarn = document.getElementById('surveyWarning');
  if ($surveyWarn && $surveyWarn.innerText.trim() === '-') { $surveyWarn.parentElement.remove(); }
});
