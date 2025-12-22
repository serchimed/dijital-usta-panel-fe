onAuthReady(async () => {
  let prms = new URLSearchParams(window.location.search);
  let id = prms.get("memberId");
  if (!id) {
    window.location.href = "admin-candidate-list.html";
    return;
  }

  let result = await api("Candidate/GetEmail", { memberId: id });
  if (result && result.isSuccess && result.data) {
    let candidateName = result.data.displayName || "Aday";
    let currentEmail = result.data.email || "";

    let info = document.getElementById("candidateInfo");
    if (info) { info.textContent = `${candidateName} adlı adayın email adresini güncelleyeceksiniz.`; }

    set("currentEmail", currentEmail);
  } else {
    logErr(result);
    return;
  }

  let $btn = document.getElementById("updateEmailBtn");
  let $msg = document.getElementById("message");
  $btn.addEventListener(CLICK_EVENT, async function () {
    let newEmail = val("newEmail");
    let currentEmail = val("currentEmail");

    let req = {
      memberId: id,
      email: newEmail
    };

    let errors = [];
    if (!newEmail) {
      errors.push("Yeni email adresini giriniz.");
    } else if (!checkEmail(newEmail)) {
      errors.push("Geçerli bir email adresi giriniz.");
    }

    if (showErrors($msg, errors)) { return; }

    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      if (!confirm("Girdiğiniz email adresi mevcut adresle aynı. Yine de güncellemek istiyor musunuz?")) {
        return;
      }
    }

    clearErrors($msg);
    await apiBtn(this, "Candidate/UpdateEmail", req, "Email güncellendi.", ERROR_MESSAGE_DEFAULT, "admin-candidate-profile.html?id=" + id);
  });
});
