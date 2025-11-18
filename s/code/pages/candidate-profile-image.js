onAuthReady(async () => {
  let $btn = document.getElementById("submitBtn");
  let $msg = $btn.nextElementSibling;
  let initialImage = null;

  let imageUploader = createImageUploader({
    fileInputId: "fileInput",
    previewId: "imagePreview",
    messageElement: $msg,
    onImageLoaded: (base64) => {
      $btn.disabled = false;
    }
  });

  try {
    let result = await api("Candidate/Image", { memberId: USER.id });
    if (result && result.isSuccess && result.data) {
      initialImage = result.data;
      imageUploader.setBase64(result.data);
    } else {
      document.getElementById("imagePreview").textContent = "Fotoğraf yüklenmedi";
    }
  } catch (error) {
    document.getElementById("imagePreview").textContent = "Fotoğraf yüklenemedi";
  }

  $btn.addEventListener(CLICK_EVENT, async function () {
    let currentImage = imageUploader.getBase64();
    if (!currentImage || currentImage === initialImage) {
      $msg.textContent = "• Bir fotoğraf seçin";
      return;
    }

    await apiBtn(this, "Candidate/ImageChange", { memberId: USER.id, imageBase64: currentImage }, "Profil fotoğrafınız güncellendi.", ERROR_MESSAGE_DEFAULT, "candidate-profile.html");
  });
});
