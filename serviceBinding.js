function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZSDW_PCC_STAT_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}