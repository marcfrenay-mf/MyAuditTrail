sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/m/MessageBox",
	"sap/f/library",
	"sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, Sorter, MessageBox, fioriLibrary, JSONModel) {
	"use strict";

	return Controller.extend("pcc.statistic.sdwp.controller.Master", {
		onInit: function () {
			this.LocalModel = new JSONModel({
				"IsDataLoading": true
			});
			this.getView().setModel(this.LocalModel, "LocalModel");

			this._bDescendingSort = false;
			this.oprocessesTable = this.oView.byId("processesTable");
			this.oRouter = this.getOwnerComponent().getRouter();

			// Default drop down
			this.CurrentYear = new Date().getFullYear();
			this.getView().byId("YearComboBox").setSelectedKey(this.CurrentYear);
			//Default OverviewModel (Component.JS known by all views)
			this.getOwnerComponent().getModel("OverviewModel").setProperty("/CurrentYear", this.CurrentYear);

			this.oODataModel = this.getOwnerComponent().getModel("OData"); //read onpremise data
			this._bind();
		},

		_bind: function () {
			this.getView().getModel("LocalModel").setProperty("/IsDataLoading", true);
			var that = this;
			this._readYear().then(function (oRetrievedResult) {
				that.getOwnerComponent().getModel("OverviewModel").setProperty("/Filter/Years", oRetrievedResult.results);
			});

			this._readProcesses().then(function (oRetrievedResult) {
				that.getOwnerComponent().getModel("OverviewModel").setProperty("/ListOfProcess", oRetrievedResult.results);
				that.getView().getModel("LocalModel").setProperty("/IsDataLoading", false);
			});
		},

		_readProcesses: function () {
			return new Promise(function (resolve, reject) {
				this.oODataModel.read("/ProcessSet", {
					filters: [					    
						new Filter("CurrentYear", FilterOperator.EQ, this.CurrentYear)
					],
					success: function (oRetrievedResult) {
						resolve(oRetrievedResult);
					}.bind(this),
					error: function (oError) {
						resolve(oError);
					}
				});
			}.bind(this));
		},

		_readYear: function () {
			return new Promise(function (resolve, reject) {
				this.oODataModel.read("/PeriodSet", {
					success: function (oRetrievedResult) {
						resolve(oRetrievedResult);
					}.bind(this),
					error: function (oError) {
						resolve(oError);
					}
				});
			}.bind(this));
		},

		onChangeYear: function (oEvent) {
			this.CurrentYear = oEvent.getSource().getSelectedKey();
			this.getOwnerComponent().getModel("OverviewModel").setProperty("/CurrentYear", this.CurrentYear);
			this.process = '';
			this._bind();
		},

		onSearch: function (oEvent) {
			var oTableSearchState = [],
				//sQuery = oEvent.getParameter("query");
				sQuery = oEvent.getSource().getValue();

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("name", FilterOperator.Contains, sQuery)];
			}
			this.oprocessesTable.getBinding("items").filter(oTableSearchState, "Application");
		},

		onAdd: function () {
			MessageBox.information("This functionality is not ready yet.", {
				title: "Aw, Snap!"
			});
		},

		onSort: function () {
			this._bDescendingSort = !this._bDescendingSort;
			var oBinding = this.oprocessesTable.getBinding("items"),
				oSorter = new Sorter("name", this._bDescendingSort);

			oBinding.sort(oSorter);
		},

		onListItemPress: function (oEvent) {
			var processPath = oEvent.getSource().getBindingContext("OverviewModel").getPath();
			this.process = processPath.split("/").slice(-1).pop();
			var oNextUIState;
			this.getOwnerComponent().getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(1);
				this.oRouter.navTo("detail", {
					layout: oNextUIState.layout,
					process: this.process
				});
			}.bind(this));
		}
	});
});