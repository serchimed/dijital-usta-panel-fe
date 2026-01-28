onAuthReady(async () => {
  const list = createYaninizdayizList({
    tableId: "Individual",
    apiEndpoint: "Individual/GetAll",
    deleteEndpoint: "Individual/Delete",
    exportEndpoint: "Individual/Export",
    exportFilename: "bireyler.csv",
    cityColumnIndex: 3,
    getItemInfo: (item) => `${item.fullName} (${item.email})`
  });

  await list.init();
});
