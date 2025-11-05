sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/model/json/JSONModel',
	'sap/f/library',
	'sap/f/FlexibleColumnLayoutSemanticHelper'
], function (UIComponent, JSONModel, fioriLibrary, FlexibleColumnLayoutSemanticHelper) {
	'use strict';

	return UIComponent.extend('pcc.statistic.sdwp.Component', {

		metadata: {
			manifest: 'json'
		},

		init: function () {
			var oModel,
				oRouter;

			UIComponent.prototype.init.apply(this, arguments);

			var OverviewModel = new JSONModel({
				"CurrentYear": "",
				"ListOfProcess": [],
				"Filter": [],
				"Statistics": [],
				"CurrentAction": ""
			});
			this.setModel(OverviewModel, "OverviewModel");

			oModel = new JSONModel();
			this.setModel(oModel);

			// var oJsonModel = new JSONModel({
			// 	Lamp: sap.ui.require.toUrl("sap/ui/webc/main/images/Lamp_avatar_01.jpg")
			// });
			// this.setModel(oJsonModel, "Icons");

			// oModel.setSizeLimit(1000);

			// oProcessesModel = new JSONModel("/mockdata/processes.json");
			// this.setModel(oProcessesModel, "processes");

			oRouter = this.getRouter();
			oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
			oRouter.initialize();

		},

		getHelper: function () {
			return this._getFcl().then(function (oFCL) {
				var oSettings = {
					defaultTwoColumnLayoutType: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
					defaultThreeColumnLayoutType: fioriLibrary.LayoutType.ThreeColumnsEndExpanded
				};
				return (FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings));
			});
		},

		_onBeforeRouteMatched: function (oEvent) {
			var oModel = this.getModel(),
				sLayout = oEvent.getParameters().arguments.layout;

			// If there is no layout parameter, set a default layout (normally OneColumn)
			if (!sLayout) {
				sLayout = fioriLibrary.LayoutType.OneColumn;
				//sLayout = fioriLibrary.LayoutType.TwoColumnsMidExpanded;
			}
			oModel.setProperty("/layout", sLayout);
		},

		_getFcl: function () {
			return new Promise(function (resolve, reject) {
				var oFCL = this.getRootControl().byId('flexibleColumnLayout');
				if (!oFCL) {
					this.getRootControl().attachAfterInit(function (oEvent) {
						resolve(oEvent.getSource().byId('flexibleColumnLayout'));
					}, this);
					return;
				}
				resolve(oFCL);

			}.bind(this));
		}
	});
});