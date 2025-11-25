let $city = document.getElementById("city");
autocomplete($city, CITIES, (city, searchText) => city.toLowerCase().includes(searchText.toLowerCase()), (city) => city, (city, $input) => { $input.value = city; });

onAuthReady(() => {
  let $btn = document.querySelector("main button");
  let $msg = $btn.nextElementSibling;
  $btn.addEventListener(CLICK_EVENT, async function () {
    let req = { city: val("city") };

    let errors = [];
    if (!req.city) { errors.push("İl bilgisini giriniz."); }
    else if (!CITIES.includes(req.city)) { errors.push(`Sadece şu iller geçerli: ${CITIES.join(", ")}`); }

    if (showErrors($msg, errors)) { return; }

    await apiBtn(this, "Candidate/ReInvite", req, "Adaylar tekrar davet edildi.", ERROR_MESSAGE_DEFAULT, "admin-candidate-list.html", null, DELAY_12, false);
  });
});
