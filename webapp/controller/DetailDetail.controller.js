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
			var LocalOverviewModel = new JSONModel({
				"ChartLine": [],
				"Title": "",
				"IsDataLoading": false
			});
			
			this.getView().setModel(LocalOverviewModel, "LocalOverviewModel");
			this.prevCheck = "-1";
			this.oOwnerComponent = this.getOwnerComponent();

			//read onpremise data bounded with the manifest source
			this.oODataModel = this.getOwnerComponent().getModel("OData"); //manifest ZSDW_PCC_STAT_SRV

			//Object for navigation
			this.oRouter = this.oOwnerComponent.getRouter();
			this.oRouter.getRoute("detailDetail").attachPatternMatched(this.onCheckMatch, this);
			this.oModel = this.oOwnerComponent.getModel();

			this.getView().setModel(new JSONModel(this.settingsModel));
			
			this.currentVizIndex = '3'; //Default Value
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
				name: "Chart Type",
				values: [{
					key: "0",
					name: "ChartNameKey0",
					vizType: "100_stacked_bar",
					dataset: {
						dimensions: [{
							name: "processor",
							value: "{processor}"
						}, {
							name: "statut",
							value: "{statut}"
						}],
						measures: [{
							name: "nrAlert",
							value: "{nrAlert}"
						}],
						data: {
							path: "OverviewModel>data"
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
					dataset: {
						dimensions: [{
							name: "processor",
							value: "{processor}"
						}, {
							name: "statut",
							value: "{statut}"
						}],
						measures: [{
							name: "nrAlert",
							value: "{nrAlert}"
						}],
						data: {
							path: "OverviewModel>data"
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
				}, {
					key: "2",
					name: "ChartNameKey2",
					vizType: "timeseries_line",
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
							path: "LocalOverviewModel>/ChartLine"
						}
					},
					vizProperties: {
						title: {
							visible: true,
							text: "TitleVizKey2"
						},
						plotArea: {
							// window: {
							// 	start: "firstDataPoint",
							// 	end: "lastDataPoint"
							// },
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
				}, {
					key: "3",
					name: "ChartNameKey3",
					vizType: "timeseries_line",
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
							path: "LocalOverviewModel>/ChartLine"
						}
					},
					vizProperties: {
						title: {
							visible: true,
							text: "TitleVizKey3"
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
						"values": ["nrAlert"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["processor"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "color",
						"type": "Dimension",
						"values": ["statut"]
					}));
					break;
				case "1":
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["nrAlert"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["processor"]
					}));
					this.oVizFrame.addFeed(new FeedItem({
						"uid": "color",
						"type": "Dimension",
						"values": ["statut"]
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
				case "3":
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

		readChartLine: function () {
			if (this.process && (this.prevCheck !== this.check || this.onChartTypeChanged === true)) {
				var currentProcess = this.getOwnerComponent().getModel("OverviewModel").getProperty("/ListOfProcess");
				this.currentProcessInstId = currentProcess[this.process].Id;
				this.currentCheckId = currentProcess[this.process].ListOfCheck[this.check].id;

				this.getView().getModel("LocalOverviewModel").setProperty("/IsDataLoading", true);
				var that = this;
				this.readDataChartLine().then(function (oRetrievedResult) {
					that.getView().getModel("LocalOverviewModel").setProperty("/ChartLine", oRetrievedResult.results);
					that.getView().getModel("LocalOverviewModel").setProperty("/IsDataLoading", false);
					that.prevCheck = that._check;
					that.setChartType();
				});
			}
			this.onChartTypeChanged = false;
		},

		readDataChartLine: function () {
			return new Promise(function (resolve, reject) {
				this.oODataModel.read("/ChartLineSet", {
					filters: [
						new Filter("CurrentAction", FilterOperator.EQ, this.getOwnerComponent().getModel("OverviewModel").getProperty("/CurrentAction")),
						new Filter("CurrentYear", FilterOperator.EQ, this.getOwnerComponent().getModel("OverviewModel").getProperty("/CurrentYear")),
						new Filter("IdCheck", FilterOperator.EQ, this.currentCheckId),
						new Filter("IdProcessInst", FilterOperator.EQ, this.currentProcessInstId)
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

		setChartType: function () {
			this.getView().getModel("LocalOverviewModel").setProperty("/Title", this.settingsModel.chartType.values[this.currentVizIndex].name);

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
			this.onChartTypeChanged = true;
			if (this.oVizFrame) {
				this.currentVizIndex = oEvent.getSource().getSelectedKey();
				switch (this.currentVizIndex) {
					case "0":
						break;
					case "2":
						this.getOwnerComponent().getModel("OverviewModel").setProperty("/CurrentAction", "refreshYearlyData");
						break;
					case "3":
						this.getOwnerComponent().getModel("OverviewModel").setProperty("/CurrentAction", "refreshMonthlyData");
						break;
					default:
						break;
				}
				this.readChartLine();
			}
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

		onCheckMatch: function (oEvent) {
			this.check = oEvent.getParameter("arguments").check || this.check || "0";
			this.process = oEvent.getParameter("arguments").process || this.process || "0";

			this.getView().bindElement({
				path: "/ListOfProcess/" + this.process + "/ListOfCheck/" + this.check,
				model: "OverviewModel"
			});
			// if (this.prevCheck !== this.check) {
			this.readChartLine();
			// }

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
				process: this.process,
				check: this.check
			});
		},

		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
			this.oRouter.navTo("detailDetail", {
				layout: sNextLayout,
				process: this.process,
				check: this.check
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
				process: this.process
			});
		},

		onExit: function () {
			this.oRouter.getRoute("detailDetail").detachPatternMatched(this.onCheckMatch, this);
		}
	});
});