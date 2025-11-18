sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/mvc/Controller",
	"sap/viz/ui5/data/FlattenedDataset",
	"sap/viz/ui5/controls/common/feeds/FeedItem",
	'sap/viz/ui5/format/ChartFormatter',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, Controller, FlattenedDataset, FeedItem, ChartFormatter, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("pcc.statistic.sdwp.controller.DetailDetail", {
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
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this.onValidationRuleMatch, this);
			this.oModel = this.oOwnerComponent.getModel();

			this.getView().setModel(new JSONModel(this.settingsModel));

			this.currentVizIndex = '2'; //Default Value
			var vizChartComboBox = this.getView().byId("VizChartComboBox");
			vizChartComboBox.setSelectedKey(this.currentVizIndex);

			//fill in the dropdownlist with the correct i18n value
			//and the value on the model is changed as well (do this way cause i18n is not manage inside the model)
			for (let i = 0; i < vizChartComboBox.getItems().length; i++) {
				var i18nChartName = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(this.settingsModel.chartType.values[i].name);
				this.settingsModel.chartType.values[i].name = i18nChartName;
			}

			//Set the VizFrame
			this.oVizFrame = this.getView().byId("idVizFrame");
			this.setChartType();

			this.selectedData = []; //unused for the time being

			// var vizPopover = new sap.viz.ui5.controls.Popover({});
			// vizPopover.connect(this.oVizFrame.getVizUid());
		},

		settingsModel: {
			chartType: {
				//name: "Chart Type",
				values: [{
					key: "0",
					name: "ChartNameKey0",
					vizType: "100_stacked_bar",
					oData: "/StackedSet",
					dataset: {
						dimensions: [{
							name: "Processor",
							value: "{Processor}"
						}, {
							name: "Status",
							value: "{Status}"
						}],
						measures: [{
							name: "NrAlert",
							value: "{NrAlert}"
						}],
						data: {
							path: "LocalModel>/ODataSet"
						}
					},
					vizProperties: {
						title: {
							visible: true,
							text: "TitleVizKey0"
						},
						plotArea: {
							dataLabel: {
								visible: true,
								type: "percentage"
							},
							drawingEffect: "glossy",
							//vert clair / orange / vert foncé
							//colorPalette: ["#9cbe17", "#ff8f00", "#00915a"]
						},
						legendGroup: {
							layout: {
								position: "top"
							}
						},
						legend: {
							visible: true,
							drawingEffect: "glossy",
							title: {
								visible: true,
								text: "Legend"
							}
						},
						valueAxis: {
							visible: true
						},
						categoryAxis: {
							visible: true
						}
					}
				}, {
					key: "1",
					name: "ChartNameKey1",
					vizType: "stacked_column",
					oData: "/StackedSet",
					dataset: {
						dimensions: [{
							name: "Processor",
							value: "{Processor}"
						}, {
							name: "Status",
							value: "{Status}"
						}],
						measures: [{
							name: "NrAlert",
							value: "{NrAlert}"
						}],
						data: {
							path: "LocalModel>/ODataSet"
						}
					},
					vizProperties: {
						title: {
							visible: true,
							text: "TitleVizKey1"
						},
						plotArea: {
							dataLabel: {
								visible: true
								//type: "percentage"
							},
							drawingEffect: "glossy",
							//vert clair / orange / vert foncé
							//colorPalette: ["#9cbe17", "#ff8f00", "#00915a"]
						},
						legendGroup: {
							layout: {
								position: "top"
							}
						},
						legend: {
							visible: true,
							drawingEffect: "glossy",
							title: {
								visible: true,
								text: "Legend"
							}
						},
						valueAxis: {
							visible: true
						},
						categoryAxis: {
							visible: true
						}
					}
				},
				{
					key: "2",
					name: "ChartNameKey2",
					vizType: "timeseries_line",
					oData: "/TimeSeriesSet",
					dataset: {
						dimensions: [{
							name: 'Date',
							value: "{Date}",
							dataType: 'Date'
						}],
						measures: [{
							name: "TotAlert",
							value: "{TotAlert}"
						}],
						data: {
							path: "LocalModel>/ODataSet"
						}
					},
					vizProperties: {
						title: {
							visible: true,
							text: "TitleVizKey2"
						},
						plotArea: {
							/* window: {
								  start: "firstDataPoint",
								  end: "lastDataPoint"
							 },*/

							dataLabel: {
								visible: true
							},
							drawingEffect: "glossy"
						},
						legendGroup: {
							layout: {
								position: "top"
							}
						},
						legend: {
							visible: true,
							drawingEffect: "glossy",
							title: {
								visible: true,
								text: "Legend"
							}
						},
						valueAxis: {
							visible: true
						},
						timeAxis: {
							title: {
								visible: true
							},
							interval: {
								unit: ''
							}
						},
						interaction: {
							syncValueAxis: false
						}
					}
				}]
			}
		},

		setVizFeed: function (selectedKey) {
			switch (selectedKey) {
				case "0":
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["NrAlert"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["Processor"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "color",
						"type": "Dimension",
						"values": ["Status"]
					}));
					break;
				case "1":
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["NrAlert"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["Processor"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "color",
						"type": "Dimension",
						"values": ["Status"]
					}));
					break;
				case "2":
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["TotAlert"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						'uid': "timeAxis",
						'type': "Dimension",
						'values': ["Date"]
					}));
					break;
				default:
				// this.oVizFrame.addFeed(oFeedValueAxis);
				// this.oVizFrame.addFeed(oFeedCategoryAxis);
				// this.oVizFrame.addFeed(
				// 	oFeedCategoryAxisColor);			
			}
		},

		setChartType: function () {
			this.getView().getModel("LocalModel").setProperty("/Title", this.settingsModel.chartType.values[this.currentVizIndex].name);

			this.oVizFrame.destroyDataset();
			this.oVizFrame.destroyFeeds();
			this.oVizFrame.setVizType(this.settingsModel.chartType.values[this.currentVizIndex].vizType);
			this.oVizFrame.setVizProperties(this.settingsModel.chartType.values[this.currentVizIndex].vizProperties);
			var i18nVizText = this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(this.settingsModel.chartType.values[this.currentVizIndex].vizProperties.title.text);
			this.oVizFrame.setVizProperties({ title: { text: i18nVizText } });

			this.oVizFrame.setDataset(new FlattenedDataset(this.settingsModel.chartType.values[this.currentVizIndex].dataset));
			var path = this.settingsModel.chartType.values[this.currentVizIndex].dataset.data.model + ">" + this.settingsModel.chartType.values[this.currentVizIndex].dataset.data.path;
			this.oVizFrame.getDataset().bindData(path);
			this.setVizFeed(this.currentVizIndex);
		},

		onChartTypeChanged: function (oEvent) {
			//this.onChartTypeChanged = true;
			this.currentVizIndex = oEvent.getSource().getSelectedKey();
			this._bind();
			this.setChartType();
		},

		onSelectVizData: function (oEvent) {
			// get the event data as provided by the native sap.viz librarycontext_row_number
			//var iSelectDataIndex = oEvent.getParameter("data")[0].data._context_row_number;
			var aSelections = oEvent.getParameter("data");
			//var oModel = this.getView().byId('idVizFrame').getModel();
			for (var i = 0; i < aSelections.length; i++) {
				this.selectedData.push(aSelections[i].data);
			}
		},

		onDeselectVizData: function (oEvent) {
			var aSelections = oEvent.getParameter("data");
			//var oModel = this.getView().byId('idVizFrame').getModel();
			for (var i = 0; i < aSelections.length; i++) {
				this.selectedData.splice(i, 1);
			}
		},

		// onTablePress: function (oEvent) {
		// 	var oVizFrameDataForTable = this.getView().byId("chartContainerContentTable");
		// 	oVizFrameDataForTable.setModel("/mockdata/OverviewModel.json");
		// },

		onValidationRuleMatch: function (oEvent) {
			this._validationRule = oEvent.getParameter("arguments").validationRule || this._validationRule || "0";
			this._process = oEvent.getParameter("arguments").process || this._process || "0";

			this.getView().bindElement({
				path: "/ValidationRule/" + this._validationRule,
				model: "OverviewModel"
			});
			this._bind();
		},

		_bind: function () {
			if (this._process !== null) {
				this.getView().getModel("LocalModel").setProperty("/IsDataLoading", true);
				var that = this;
				this._readData().then(function (oRetrievedResult) {
					//if (oRetrievedResult.results.length !== 0) {
						that.getView().getModel("LocalModel").setProperty("/ODataSet", oRetrievedResult.results);						
					//}
					that.getView().getModel("LocalModel").setProperty("/IsDataLoading", false);
					that.prevProcess = that._process;
				});
			}
		},

		_readData: function () {
			return new Promise(function (resolve, reject) {
				var currentProcess = this.getOwnerComponent().getModel("OverviewModel").getProperty("/ListOfProcess");
				var currentValidationRule = this.getOwnerComponent().getModel("OverviewModel").getProperty("/ValidationRule");
				if (currentProcess.length !== 0) {					
					this.oODataModel.read(this.settingsModel.chartType.values[this.currentVizIndex].oData, {
						filters: [
							new Filter("IdProcessInst", FilterOperator.EQ, currentProcess[this._process].Id),
							new Filter("IdCheck", FilterOperator.EQ, currentValidationRule[this._validationRule].Id)
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

		// handleAboutPress: function () {
		// 	var oNextUIState;
		// 	this.oOwnerComponent.getHelper().then(function (oHelper) {
		// 		oNextUIState = oHelper.getNextUIState(3);
		// 		this.oRouter.navTo("page2", {layout: oNextUIState.layout});
		// 	}.bind(this));
		// },

		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/fullScreen");
			this.oRouter.navTo("detailDetail", {
				layout: sNextLayout,
				process: this._process,
				validationRule: this._validationRule
			});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
			this.oRouter.navTo("detailDetail", {
				layout: sNextLayout,
				process: this._process,
				validationRule: this._validationRule
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
			this.oRouter.getRoute("detailDetail").detachPatternMatched(this.onValidationRuleMatch, this);
		}
	});
});