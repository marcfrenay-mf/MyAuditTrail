sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/ColumnListItem",
	"sap/m/Column",
	"sap/m/Label",
	"sap/m/Text"
], function (JSONModel, Controller, Filter, FilterOperator, ColumnListItem, Column, Label, Text) {
	"use strict";

	return Controller.extend("pcc.statistic.sdwp.controller.DetailDetailKPI", {
		onInit: function () {
			var LocalModel = new JSONModel({
				"TimeSeries": [],
				"Stacked": [],
				"Title": "",
				"IsDataLoading": false
			});

			this.getView().setModel(LocalModel, "LocalModel");
			this.oOwnerComponent = this.getOwnerComponent();

			//read onpremise data bounded with the manifest source
			this.oODataModel = this.getOwnerComponent().getModel("OData"); //manifest ZSDW_PCC_STAT_SRV

			//Object for navigation
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.getRoute("detailDetailKPI").attachPatternMatched(this.onValidationRuleMatch, this);
			this.oModel = this.oOwnerComponent.getModel();

			this.getView().setModel(new JSONModel(this.settingsModel));
		},

		// onTablePress: function (oEvent) {
		// 	var oVizFrameDataForTable = this.getView().byId("chartContainerContentTable");
		// 	oVizFrameDataForTable.setModel("/mockdata/OverviewModel.json");
		// },

		onValidationRuleMatch: function (oEvent) {
			this._KPIRule = oEvent.getParameter("arguments").KPIRule || this._KPIRule || "0";
			this._process = oEvent.getParameter("arguments").process || this._process || "0";
			/* To display KPI name above */
			this.getView().bindElement({
				path: "/KPI/" + this._KPIRule,
				model: "OverviewModel"
			});
			/* Creation the the table based on the current KPI */
			var oTable = this.byId("kpiTable");
			oTable.removeAllColumns();
			oTable.unbindItems();
			oTable.destroyItems(); // Détruire les items existants
			var oNameColumn;
			var oColumnListItem;
			switch (this._KPIRule) {
				case "0":
					oNameColumn = new Column({
						header: new Label({ text: "{i18n>Processor}" })
					});
					oTable.addColumn(oNameColumn);

					oNameColumn = new Column({
						header: new Label({ text: "{i18n>VR}" })
					});
					oTable.addColumn(oNameColumn);

					oNameColumn = new Column({
						header: new Label({ text: "{i18n>Date}" })
					});
					oTable.addColumn(oNameColumn);

					// Create column list item template
					oColumnListItem = new ColumnListItem({
						cells: [
							new Text({ text: "{OverviewModel>Processor}" }),
							new Text({ text: "{OverviewModel>IdCheck}" }),
							new Text({ text: "{path: 'OverviewModel>Date', type: 'sap.ui.model.type.DateTime', formatOptions: { pattern: 'dd/MM/yyyy' }}" })
						]
					});
					break;
				case "1":
					oNameColumn = new Column({
						header: new Label({ text: "{i18n>VR}" })
					});
					oTable.addColumn(oNameColumn);

					// Create column list item template
					oColumnListItem = new ColumnListItem({
						cells: [
							new Text({ text: "{OverviewModel>IdCheck}" })
						]
					});
					break;
				default:
			};

			oTable.bindItems({
				path: "/KPIOdata" + this._KPIRule,
				template: oColumnListItem,
				model: "OverviewModel"
			});
		},

		// handleAboutPress: function () {
		// 	var oNextUIState;
		// 	this.oOwnerComponent.getHelper().then(function (oHelper) {
		// 		oNextUIState = oHelper.getNextUIState(3);
		// 		this.oRouter.navTo("page2", {layout: oNextUIState.layout});
		// 	}.bind(this));
		// },

		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
			this.oRouter.navTo("detailDetailKPI", {
				layout: sNextLayout,
				process: this._process,
				KPIRule: this._KPIRule
			});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
			this.oRouter.navTo("detailDetailKPI", {
				layout: sNextLayout,
				process: this._process,
				KPIRule: this._KPIRule
			});
		},

		onAfterRendering: function () {
			//this.VizChartComboBox = this.getView().byId('VizChartComboBox');
			//this.oVizFrame = this.getView().byId("idVizFrame");
		},

		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/closeColumn");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				process: this._process
			});
		},

		onExit: function () {
			this.oRouter.getRoute("detailDetailKPI").detachPatternMatched(this.onValidationRuleMatch, this);
		},


		/************************ */
		onExport: function (oEvent) {			
			var oSource = oEvent.getSource().getBindingContext("OverviewModel");
			var oFile = oSource.getModel().getProperty(oSource.getPath());

			/*try {
				// 1. the URI of the main OData service (as stored in the manifest.json)
				var sServiceUri = this.getOwnerComponent().getManifestEntry("/sap.app/dataSources/mainService/uri");
				// 2. the URL of the OData call to get the attachment
				var oAnchor = document.createElement("a");
				var sLink = "C:\test";
				oAnchor.href = sLink;
				var sUrl = oAnchor.pathname;
				// 3. the URL of the metadata of the main OData service
				var sDataPath = "";
				var oModel = this.getModel("OverviewModel");
				if (oModel) {
					if (oModel.getMetadataUrl) {
						// the main model has a getter for the URL of the metadata/service 
						sDataPath = oModel.getMetadataUrl();
					} else if (oModel.sServiceUrl) {
						// the main model has a variable for the metadata/service URL
						sDataPath = oModel.sServiceUrl;
					}
					// now we need to 'strip and combine' to create the correct URL
					// 1. strip dots from the metadata/service URL
					sDataPath = sDataPath.replace("..", "");
					// 2. strip the URI of the main OData service of manifest.json
					// from the metadata/service URL
					sDataPath = sDataPath.substr(0, sDataPath.indexOf(sServiceUri));
					// 3. combine metadata/service URL with URL of OData call to get the attachment
					sUrl = sDataPath.concat(sUrl);

					// finally we pass the actual call to the UI5 framework
					// and we make sure double slashes are avoided in the URL
					sap.m.URLHelper.redirect(sUrl.replace("//", "/"), true);
				}
			}
			catch (err) {
				// something goes wrong
				// show error message
				MessageBox.error(this.getResourceBundle().getText("errorMessageUnableToOpenAttachment"), err);
			}*/
		}
	});
});