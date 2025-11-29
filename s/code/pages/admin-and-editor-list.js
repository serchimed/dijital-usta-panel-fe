onAuthReady(async () => {
  let result = await api("Admin/GetAdmins", {});
  if (result && result.isSuccess) {
    let tbody = document.querySelector("table tbody");
    tbody.textContent = "";

    for (let admin of result.data) {
      let $tr = tr();
      $tr.append(tda(admin.displayName, "admin-profile.html?id=" + admin.id, "Ad Soyad"));
      $tr.append(td(admin.role, "Rol"));
      $tr.append(td(admin.city, "İl"));
      $tr.append(td(admin.companyName, "Organizasyon"));
      $tr.append(tda(admin.email, "mailto:" + admin.email, "E-posta"));
      $tr.append(tda(admin.phone, "tel:" + admin.phone, "Telefon"));

      let $tdInvite = createInviteInfoCell(admin, {
        isAcceptedKey: "isInviteAccepted",
        acceptedAtKey: "invitedAt",
        endpoint: "Admin/SendInviteEditorEmail",
        idParamKey: "memberId"
      });
      $tr.append($tdInvite);

      let $btn = createBlockButton(admin.id, admin.isBlocked, admin.displayName, "Member/Block", "Member/Unblock", "memberId");
      $tr.append(tdbtn($btn, ""));
      tbody.append($tr);
    }
  } else { logErr(result); }

  setFilters();
});
