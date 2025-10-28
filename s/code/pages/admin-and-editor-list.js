onAuthReady(async () => {
  let result = await api("Admin/GetAdmins", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.innerHTML = "";

    for (let admin of result.data) {
      let $tr = tr();
      $tr.append(tda(admin.displayName, "admin-profile.html?id=" + admin.id, "Ad Soyad"));
      $tr.append(td(admin.role, "Rol"));
      $tr.append(td(admin.companyName, "Organizasyon"));
      $tr.append(tda(admin.email, "mailto:" + admin.email, "E-posta"));
      $tr.append(tda(admin.phone, "tel:" + admin.phone, "Telefon"));

      let inviteText = "-";
      let $tdInvite = td(null, "Davet Bilgisi");
      if (admin.isInviteAccepted) {
        if (admin.invitedAt && admin.invitedAt !== "0001-01-01T00:00:00") {
          inviteText = formatDateLong(admin.invitedAt) + " tarihinde davet kabul edildi";
        } else {
          inviteText = "Davet kabul edildi";
        }
        $tdInvite.textContent = inviteText;
      } else {
        inviteText = "Davet beklemede";
        $tdInvite.textContent = inviteText;

        let $btnResend = btn("btn-act", "Daveti Tekrar Gönder");
        $btnResend.style.marginTop = "8px";
        $btnResend.addEventListener(CLICK_EVENT, async function () {
          let $msg = this.nextElementSibling;
          if (!$msg || $msg.tagName !== "P") {
            $msg = p();
            this.after($msg);
          }
          await apiBtn(this, "Admin/SendInviteEditorEmail", { memberId: admin.id }, "Davet e-postası gönderildi.", "E-posta gönderilemedi.", null, $msg);
        });
        $tdInvite.append(document.createElement("br"), $btnResend, p());
      }
      $tr.append($tdInvite);

      let $btn = createBlockButton(admin.id, admin.isBlocked, admin.displayName, "Member/Block", "Member/Unblock", "memberId");
      $tr.append(tdbtn($btn, ""));
      tbody.append($tr);
    }
  } else { logErr(result); }

  setFilters();
});
