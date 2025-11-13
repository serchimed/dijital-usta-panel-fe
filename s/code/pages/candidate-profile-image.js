onAuthReady(async () => {
  let $file = document.getElementById("fileInput");
  let $preview = document.getElementById("imagePreview");
  let $btn = document.getElementById("submitBtn");
  let $msg = $btn.nextElementSibling;
  let base64String = null;
  let initialImage = null;

  try {
    let result = await api("Candidate/Image", { memberId: USER.id });
    if (result && result.isSuccess && result.data) {
      base64String = initialImage = result.data;
      let $img = document.createElement("img");
      $img.src = base64String;
      $img.alt = "Profil Fotoğrafı";
      $preview.textContent = "";
      $preview.append($img);
    } else { $preview.textContent = "Fotoğraf yüklenmedi"; }
  } catch (error) { $preview.textContent = "Fotoğraf yüklenemedi"; }

  $file.addEventListener("change", (e) => { handleFile(e.target.files[0]); });
  $btn.addEventListener(CLICK_EVENT, async function () {
    if (!base64String || base64String === initialImage) {
      $msg.textContent = "• Bir fotoğraf seçin";
      return;
    }

    await apiBtn(this, "Candidate/ImageChange", { memberId: USER.id, imageBase64: base64String }, "Profil fotoğrafınız güncellendi.", ERROR_MESSAGE_DEFAULT, "candidate-profile.html");
  });

  function handleFile(file) {
    if (!file) { return; }

    let validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      let p = $btn.nextElementSibling;
      p.textContent = "• Geçersiz dosya türü. Sadece JPG veya PNG yükleyebilirsiniz.";
      return;
    }

    let maxSize = 500 * 1024;
    if (file.size > maxSize) {
      $msg.textContent = "• Dosya boyutu çok büyük. Maksimum 500KB yükleyebilirsiniz.";
      return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
      let img = new Image();
      img.onload = function () {
        if (this.width < 150 || this.height < 150) {
          $msg.textContent = "• Fotoğraf boyutu çok küçük. Minimum 150x150 piksel olmalıdır.";
          return;
        }

        if (this.width > 1500 || this.height > 1500) {
          $msg.textContent = "• Fotoğraf boyutu çok büyük. Maksimum 1500x1500 piksel olmalıdır.";
          return;
        }

        convertToBase64(file);
      };

      img.onerror = function () { $msg.textContent = "• Fotoğraf dosyası okunamadı."; };
      img.src = e.target.result;
    };

    reader.onerror = function () { $msg.textContent = "• Dosya okunurken bir hata oluştu"; };
    reader.readAsDataURL(file);
  }

  function convertToBase64(file) {
    let reader = new FileReader();

    reader.onload = function (e) {
      base64String = e.target.result;

      let $img = document.createElement("img");
      $img.src = base64String;
      $img.alt = "Önizleme";
      $img.style.height = "222px";
      $preview.textContent = "";
      $preview.append($img);

      $btn.disabled = false;
      $msg.textContent = "";
    };

    reader.onerror = function () { $msg.textContent = "• Dosya okunurken bir hata oluştu"; };
    reader.readAsDataURL(file);
  }
});
