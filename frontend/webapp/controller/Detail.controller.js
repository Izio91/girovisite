sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
], (BaseController, JSONModel) => {
    "use strict";

    var baseManifestUrl;
    var oBundle;
    return BaseController.extend("frontend.controller.Detail", {
        onInit() {
            baseManifestUrl = jQuery.sap.getModulePath(this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id);
            // read msg from i18n model
            oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
            oRouter.getRoute("create").attachPatternMatched(this._onCreateMatched, this);
        },


        _onDetailMatched: function (oEvent) {
            console.log("detail");
            this._vpid = oEvent.getParameter("arguments").vpid;
            this._vctext = oEvent.getParameter("arguments").vctext;
            this._werks = oEvent.getParameter("arguments").werks;
            this._vkorg = oEvent.getParameter("arguments").vkorg;
            this._vtweg = oEvent.getParameter("arguments").vtweg;
            this._spart = oEvent.getParameter("arguments").spart;

            let sSubTitle = oBundle.getText("vpid")+": "+ this._vpid;
            this.getView().byId("subTitleIdExpandedContent").setText(sSubTitle);
            this.getView().byId("subTitleIdSnappedContent").setText(sSubTitle);
            this.getView().byId("subTitleIdSnappedTitleOnMobile").setText(sSubTitle);

            this.defineModelForCurrentPage(false);
            this._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`)
        },

        _onCreateMatched: function (oEvent) {
            console.log("create");
            this.defineModelForCurrentPage(true);
        },


        /**
         * Define the model for the current page and attach it to the view.
         */
        defineModelForCurrentPage: function (bIsNew) {
            var oModel = {
                "isNew": bIsNew,
                "detail": null
            };
            this.getView().setModel(new JSONModel(oModel), "detailModel");
        },


        _fetchData: async function (sUrl) {  
            var oDetailModel = this.getView().getModel("detailModel"),
                that = this;

            try {
                sap.ui.core.BusyIndicator.show();  
                
                // Wait for the query URL to be fully built
                var sUrl = await this._buildFilterQuery();
                
                // Execute the request
                var oData = await this.executeRequest(sUrl, 'GET');
                console.log("Data fetched: ", oData);

                oDetailModel.setProperty("/detail", oData);
            } catch (error) {
                MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("ErrorReadingDataFromBackend"), {
                    title: "Error",
                    details: error
                });
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        onGoBack: function () {
            this.getOwnerComponent().getRouter().navTo("main");
        }

        
    });
});