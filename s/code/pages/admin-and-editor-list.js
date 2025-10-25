onAuthReady(async () => {
  let result = await api("Admin/GetAdmins", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    for (let admin of result.data) {
      let $tr = tr();
      $tr.append(tda(admin.displayName, "admin-profile.html?id=" + admin.id));
      $tr.append(td(admin.role));
      $tr.append(td(admin.companyName));
      $tr.append(tda(admin.email, "mailto:" + admin.email));
      $tr.append(tda(admin.phone, "tel:" + admin.phone));

      let inviteText = "-";
      let $inviteTd = td();
      if (admin.isInviteAccepted) {
        if (admin.invitedAt && admin.invitedAt !== "0001-01-01T00:00:00") {
          inviteText = formatDateLong(admin.invitedAt) + " tarihinde davet kabul edildi";
        } else {
          inviteText = "Davet kabul edildi";
        }
        $inviteTd.textContent = inviteText;
      } else {
        inviteText = "Davet beklemede";
        $inviteTd.textContent = inviteText;

        let $resendBtn = btn("btn-act", "Daveti Tekrar Gönder");
        $resendBtn.style.marginTop = "8px";
        $resendBtn.addEventListener("click", async function () {
          let $msg = this.nextElementSibling;
          if (!$msg || $msg.tagName !== "P") {
            $msg = p();
            this.after($msg);
          }
          await apiBtn(this, "Admin/SendInviteEditorEmail", { memberId: admin.id },
            "Davet e-postası gönderildi.",
            "E-posta gönderilemedi.",
            null,
            $msg);
        });
        $inviteTd.append(document.createElement("br"), $resendBtn, p());
      }
      $tr.append($inviteTd);

      let $btn = createBlockButton(
        admin.id,
        admin.isBlocked,
        admin.displayName,
        "Member/Block",
        "Member/Unblock",
        "memberId"
      );
      $tr.append(tdbtn($btn));
      tbody.append($tr);
    }
  } else {
    let errText = "Bir hata oluştu.";
    if (result && Array.isArray(result.errors) && result.errors.length) { errText = result.errors.join(", "); }
    console.error(errText);
  }

  setFilters();
});
