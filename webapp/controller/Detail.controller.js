sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel",
	//	"MyPCC/model/Format"  // Chemin vers votre fichier format.js
], function (Controller, Filter, FilterOperator, MessageToast, ResourceModel, JSONModel) {
	"use strict";

	return Controller.extend("pcc.statistic.sdwp.controller.Detail", {
		//formatter: formatter,

		onInit: function () {
			this.LocalModel = new JSONModel({
				"IsDataLoadingVR": false,
				"IsDataLoadingKPI": false
			});


			this.getView().setModel(this.LocalModel, "LocalModel");

			this.oOwnerComponent = this.getOwnerComponent();

			//Object for navigation
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.getRoute("master").attachPatternMatched(this.onProcessMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this.onProcessMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this.onProcessMatched, this);
			this.oRouter.getRoute("detailDetailKPI").attachPatternMatched(this.onProcessMatched, this);

			this.oModel = this.oOwnerComponent.getModel();

			//Link with oData 
			this.oODataModel = this.getOwnerComponent().getModel("OData"); //read onpremise data
		},

		onValidationRulePress: function (oEvent) {
			var validationRulePath = oEvent.getSource().getBindingContext("OverviewModel").getPath(),
				validationRule = validationRulePath.split("/").slice(-1).pop(),
				oNextUIState;

			this.oOwnerComponent.getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(2);
				this.oRouter.navTo("detailDetail", {
					layout: oNextUIState.layout,
					validationRule: validationRule,
					process: this._process
				});
			}.bind(this));
		},

		onKPIPress: function (oEvent) {
			//var KPIPath = oEvent.getParameter("listItem").getBindingContext("OverviewModel").getPath(),
			var KPIPath = oEvent.getSource().getBindingContext("OverviewModel").getPath(),
				KPIRule = KPIPath.split("/").slice(-1).pop(),
				oNextUIState;

			this.oOwnerComponent.getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(2);
				this.oRouter.navTo("detailDetailKPI", {
					layout: oNextUIState.layout,
					KPIRule: KPIRule,
					process: this._process
				});
			}.bind(this));
		},

		onProcessMatched: function (oEvent) {
			this._process = oEvent.getParameter("arguments").process || this._process || "0";
			this._bind();
			this.getView().bindElement({
				path: "/ListOfProcess/" + this._process,
				model: "OverviewModel"
			});
		},

		_bind: function () {
			if (this._process !== null) {
				this.getView().getModel("LocalModel").setProperty("/IsDataLoadingVR", true);
				this.getView().getModel("LocalModel").setProperty("/IsDataLoadingKPI", true);
				var that = this;
				this._readData().then(function (oRetrievedResult) {
					if (oRetrievedResult.results.length !== 0) {
						that.getView().getModel("OverviewModel").setProperty("/ValidationRule", oRetrievedResult.results);
					}
					that.getView().getModel("LocalModel").setProperty("/IsDataLoadingVR", false);
				});
				this._readData_VR_without_change().then(function (oRetrievedResult) {
					that.getView().getModel("OverviewModel").setProperty("/KPIOdata0", oRetrievedResult.results);
					if (oRetrievedResult.results.length == 0) {
						that.getView().getModel("OverviewModel").setProperty("/KPI/0/TotAlert", 0);
						that.getView().getModel("OverviewModel").setProperty("/KPI/0/Status", "None");
					}
					else {
						//Below the "0" is hardcoded because we know that its index is 0
						that.getView().getModel("OverviewModel").setProperty("/KPI/0/TotAlert", oRetrievedResult.results[0].TotAlert);
						that.getView().getModel("OverviewModel").setProperty("/KPI/0/Status", oRetrievedResult.results[0].Status);
					}
					that.getView().getModel("LocalModel").setProperty("/IsDataLoadingKPI", false);
				});

				this._readData_VR_test().then(function (oRetrievedResult) {
					that.getView().getModel("OverviewModel").setProperty("/KPIOdata1", oRetrievedResult.results);
					if (oRetrievedResult.results.length == 0) {
						that.getView().getModel("OverviewModel").setProperty("/KPI/1/TotAlert", 0);
						that.getView().getModel("OverviewModel").setProperty("/KPI/1/Status", "None");
					}
					else {
						//Below the "1" is hardcoded because we know that its index is 1
						that.getView().getModel("OverviewModel").setProperty("/KPI/1/TotAlert", oRetrievedResult.results[0].TotAlert);
						that.getView().getModel("OverviewModel").setProperty("/KPI/1/Status", oRetrievedResult.results[0].Status);
					}
					that.getView().getModel("LocalModel").setProperty("/IsDataLoadingKPI", false);
				});
			}
		},

		_readData: function () {
			return new Promise(function (resolve, reject) {
				var currentProcess = this.getOwnerComponent().getModel("OverviewModel").getProperty("/ListOfProcess");
				if (currentProcess.length !== 0) {
					this.oODataModel.read("/ValidationRuleSet", {
						filters: [
							new Filter("Id", FilterOperator.EQ, currentProcess[this._process].Id)
						],
						success: function (oRetrievedResult) {
							resolve(oRetrievedResult);
						}.bind(this),
						error: function (oError) {
							resolve(oError);
						}
					});
				}

			}.bind(this));
		},

		_readData_VR_without_change: function () {
			return new Promise(function (resolve, reject) {
				var currentProcess = this.getOwnerComponent().getModel("OverviewModel").getProperty("/ListOfProcess");
				if (currentProcess.length !== 0) {
					this.oODataModel.read("/VR_without_changeset", {
						filters: [
							new Filter("IdProcessInst", FilterOperator.EQ, currentProcess[this._process].Id)
						],
						success: function (oRetrievedResult) {
							resolve(oRetrievedResult);
						}.bind(this),
						error: function (oError) {
							resolve(oError);
						}
					});
				}
			}.bind(this));
		},

		_readData_VR_test: function () {
			return new Promise(function (resolve, reject) {
				var currentProcess = this.getOwnerComponent().getModel("OverviewModel").getProperty("/ListOfProcess");
				if (currentProcess.length !== 0) {
					this.oODataModel.read("/VR_test_Set", {
						filters: [
							new Filter("IdProcessInst", FilterOperator.EQ, currentProcess[this._process].Id)
						],
						success: function (oRetrievedResult) {
							resolve(oRetrievedResult);
						}.bind(this),
						error: function (oError) {
							resolve(oError);
						}
					});
				}
			}.bind(this));
		},

		onActionPress: function () {
			var msg = 'No ready Yet';
			MessageToast.show(msg);
		},

		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				process: this._process
			});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {
				layout: sNextLayout,
				process: this._process
			});
		},

		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {
				layout: sNextLayout
			});
		},

		onExit: function () {
			this.oRouter.getRoute("master").detachPatternMatched(this.onProcessMatched, this);
			this.oRouter.getRoute("detail").detachPatternMatched(this.onProcessMatched, this);
		}
	});
});