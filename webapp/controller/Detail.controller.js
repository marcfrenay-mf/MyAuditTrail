sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, MessageToast, ResourceModel, JSONModel) {
	"use strict";

	return Controller.extend("pcc.statistic.sdwp.controller.Detail", {
		onInit: function () {
			this.LocalModel = new JSONModel({
				"IsDataLoading": false,
				"KPI": [
					{
						"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
						"Name": "Notebook Basic 15",
						"ProductPicUrl": "test-resources/sap/ui/documentation/sdk/images/HT-1000.jpg",
						"Status": "Information",					
						"Quantity": 24
					},
					{
						"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
						"Name": "Notebook Basic 17",
						"ProductPicUrl": "test-resources/sap/ui/documentation/sdk/images/HT-1001.jpg",
						"Status": "Success",
						"Quantity": 14
					}
				]
			});
			this.prevProcess = "-1";
			this.getView().setModel(this.LocalModel, "LocalModel");

			this.oOwnerComponent = this.getOwnerComponent();

			//Object for navigation
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.getRoute("master").attachPatternMatched(this.onProcessMatched, this);
			this.oRouter.getRoute("detail").attachPatternMatched(this.onProcessMatched, this);
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this.onProcessMatched, this);

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
			MessageToast.show("Request details for item with ID " + oEvent.getSource().getId());
		},

		onProcessMatched: function (oEvent) {
			this._process = oEvent.getParameter("arguments").process || this._process || "0";
			//if (this.prevProcess !== this._process) {
			this._bind();
			//}

			this.getView().bindElement({
				path: "/ListOfProcess/" + this._process,
				model: "OverviewModel"
			});
		},

		_bind: function () {
			if (this._process !== null) {
				this.getView().getModel("LocalModel").setProperty("/IsDataLoading", true);
				var that = this;
				this._readData().then(function (oRetrievedResult) {
					if (oRetrievedResult.results.length !== 0) {
						that.getView().getModel("OverviewModel").setProperty("/ValidationRule", oRetrievedResult.results);
					}
					that.getView().getModel("LocalModel").setProperty("/IsDataLoading", false);
					that.prevProcess = that._process;
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