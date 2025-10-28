onAuthReady(() => {
  let $city = document.getElementById("city");
  let $allCities = document.getElementById("allCities");
  let $cityLabel = document.getElementById("cityLabel");

  autocomplete($city, CITIES, (city, searchText) => city.toLowerCase().includes(searchText.toLowerCase()), (city) => city, (city, $input) => { $input.value = city; });

  $allCities.addEventListener("change", function () {
    if (this.checked) {
      $cityLabel.style.display = "none";
      $city.value = "";
    } else {
      $cityLabel.style.display = "";
    }
  });

  let $btn = document.querySelector("main button");
  $btn.addEventListener(CLICK_EVENT, async function () {
    let isAllCities = $allCities.checked;

    let req = {
      companyName: val("companyName"),
      editorNameSurname: val("editorNameSurname"),
      phone: val("phone"),
      email: val("email"),
      city: isAllCities ? "" : val("city")
    };

    let errors = [];
    if (!req.companyName) { errors.push("Çalışılan firma adını giriniz."); }
    if (!isAllCities) {
      if (!req.city) { errors.push("İl bilgisini giriniz."); }
      else if (!CITIES.includes(req.city)) { errors.push(`Sadece şu iller geçerli: ${CITIES.join(", ")}`); }
    }
    if (!req.editorNameSurname) { errors.push("Firma yetkilisi adını ve soyadını giriniz."); }
    if (!req.phone) { errors.push("Firma yetkilisi telefonunu giriniz."); }
    else if (!checkPhone(req.phone)) { errors.push("Geçerli bir telefon numarası giriniz (0 ile başlayan 11 haneli, örn: 05556667788)."); }
    if (!req.email) { errors.push("E-posta adresini giriniz."); }
    else if (!checkEmail(req.email)) { errors.push("Geçerli bir e-posta adresi giriniz."); }

    let $msg = $btn.nextElementSibling;
    if (showErrors($msg, errors)) { return; }
    clearErrors($msg);
    await apiBtn(this, "Admin/InviteEditor", req, "Davet gönderildi.", ERROR_MESSAGE_DEFAULT, "admin-and-editor-list.html");
  });
});
