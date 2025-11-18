function createImageUploader(config) {
  let {
    fileInputId,
    previewId,
    messageElement,
    maxSize = 500 * 1024,
    minWidth = 150,
    minHeight = 150,
    maxWidth = 1500,
    maxHeight = 1500,
    onImageLoaded = null
  } = config;

  let $file = document.getElementById(fileInputId);
  let $preview = document.getElementById(previewId);
  let base64String = null;

  if (!$file || !$preview) {
    return null;
  }

  $file.addEventListener("change", (e) => { handleFile(e.target.files[0]); });

  function handleFile(file) {
    if (!file) { return; }

    let validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setMessageText(messageElement, "Geçersiz dosya türü. Sadece JPG veya PNG yükleyebilirsiniz.");
      return;
    }

    if (file.size > maxSize) {
      setMessageText(messageElement, "Dosya boyutu çok büyük. Maksimum 500KB yükleyebilirsiniz.");
      return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
      let img = new Image();
      img.onload = function () {
        if (this.width < minWidth || this.height < minHeight) {
          setMessageText(messageElement, `Fotoğraf boyutu çok küçük. Minimum ${minWidth}x${minHeight} piksel olmalıdır.`);
          return;
        }

        if (this.width > maxWidth || this.height > maxHeight) {
          setMessageText(messageElement, `Fotoğraf boyutu çok büyük. Maksimum ${maxWidth}x${maxHeight} piksel olmalıdır.`);
          return;
        }

        convertToBase64(file);
      };

      img.onerror = function () { setMessageText(messageElement, "Fotoğraf dosyası okunamadı."); };
      img.src = e.target.result;
    };

    reader.onerror = function () { setMessageText(messageElement, "Dosya okunurken bir hata oluştu"); };
    reader.readAsDataURL(file);
  }

  function convertToBase64(file) {
    let reader = new FileReader();

    reader.onload = function (e) {
      base64String = e.target.result;

      let $img = document.createElement("img");
      $img.src = base64String;
      $img.alt = "Önizleme";
      $preview.textContent = "";
      $preview.append($img);

      setMessageText(messageElement, "");

      if (onImageLoaded && typeof onImageLoaded === "function") {
        onImageLoaded(base64String);
      }
    };

    reader.onerror = function () { setMessageText(messageElement, "Dosya okunurken bir hata oluştu"); };
    reader.readAsDataURL(file);
  }

  function getBase64() {
    return base64String;
  }

  function setBase64(value) {
    base64String = value;
    if (value) {
      let $img = document.createElement("img");
      $img.src = value;
      $img.alt = "Mevcut Görsel";
      $preview.textContent = "";
      $preview.append($img);
    }
  }

  function reset() {
    base64String = null;
    $preview.textContent = "";
    if ($file) {
      $file.value = "";
    }
  }

  return {
    getBase64,
    setBase64,
    reset
  };
}
