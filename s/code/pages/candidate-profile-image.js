onAuthReady(async () => {
  let fileInput = document.getElementById("fileInput");
  let imagePreview = document.getElementById("imagePreview");
  let submitBtn = document.getElementById("submitBtn");
  let base64String = null;
  let initialImage = null;

  try {
    let result = await api("Candidate/Image", { memberId: USER.id });
    if (result && result.isSuccess && result.data) {
      base64String = initialImage = result.data;
      let $img = document.createElement("img");
      $img.src = base64String;
      $img.alt = "Profil Fotoğrafı";
      imagePreview.innerHTML = "";
      imagePreview.append($img);
    } else {
      imagePreview.textContent = "Fotoğraf yüklenmedi";
    }
  } catch (error) {
    imagePreview.textContent = "Fotoğraf yüklenemedi";
  }

  fileInput.addEventListener("change", (e) => { handleFile(e.target.files[0]); });
  submitBtn.addEventListener("click", async function () {
    if (!base64String || base64String === initialImage) {
      let p = this.nextElementSibling;
      p.textContent = "• Bir fotoğraf seçin";
      return;
    }

    await apiBtn(
      this,
      "Candidate/ImageChange",
      { memberId: USER.id, imageBase64: base64String },
      "Profil fotoğrafınız güncellendi.",
      ERROR_MESSAGE_DEFAULT,
      "candidate-profile.html"
    );
  });

  function handleFile(file) {
    if (!file) { return; }

    let validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      let p = submitBtn.nextElementSibling;
      p.textContent = "• Geçersiz dosya türü. Sadece JPG veya PNG yükleyebilirsiniz.";
      return;
    }

    let maxSize = 500 * 1024; // 500KB
    if (file.size > maxSize) {
      let p = submitBtn.nextElementSibling;
      p.textContent = "• Dosya boyutu çok büyük. Maksimum 500KB yükleyebilirsiniz.";
      return;
    }

    let img = new Image();
    img.onload = function () {
      if (this.width < 150 || this.height < 150) {
        let p = submitBtn.nextElementSibling;
        p.textContent = "• Fotoğraf boyutu çok küçük. Minimum 150x150 piksel olmalıdır.";
        return;
      }

      if (this.width > 1500 || this.height > 1500) {
        let p = submitBtn.nextElementSibling;
        p.textContent = "• Fotoğraf boyutu çok büyük. Maksimum 1500x1500 piksel olmalıdır.";
        return;
      }

      convertToBase64(file);
    };

    img.onerror = function () {
      let p = submitBtn.nextElementSibling;
      p.textContent = "• Fotoğraf dosyası okunamadı.";
    };

    img.src = URL.createObjectURL(file);
  }

  function convertToBase64(file) {
    let reader = new FileReader();

    reader.onload = function (e) {
      base64String = e.target.result;

      let $img = document.createElement("img");
      $img.src = base64String;
      $img.alt = "Önizleme";
      imagePreview.innerHTML = "";
      imagePreview.append($img);

      submitBtn.disabled = false;
      let p = submitBtn.nextElementSibling;
      p.textContent = "";
    };

    reader.onerror = function () {
      let p = submitBtn.nextElementSibling;
      p.textContent = "• Dosya okunurken bir hata oluştu";
    };

    reader.readAsDataURL(file);
  }
});
