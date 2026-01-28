onAuthReady(async () => {
  const list = createYaninizdayizList({
    tableId: "Business",
    apiEndpoint: "Business/GetAll",
    deleteEndpoint: "Business/Delete",
    exportEndpoint: "Business/Export",
    exportFilename: "isletmeler.csv",
    cityColumnIndex: 4,
    getItemInfo: (item) => `${item.companyTitle} (${item.contactEmail})`,
    transformData: (item) => {
      item.hasTrendyolStore = item.hasTrendyolStore && item.trendyolStoreUrl
        ? item.trendyolStoreUrl
        : "-";
    }
  });

  await list.init();
});
