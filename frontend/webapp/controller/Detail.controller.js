sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller"
], (BaseController) => {
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

            this._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`)
        },

        _onCreateMatched: function (oEvent) {
            console.log("create");
        },

        _fetchData: function (sUrl) {  
            var that = this;
            sap.ui.core.BusyIndicator.show();  
            this.executeRequest(sUrl, 'GET')    
                .then(function (oData) {
                    console.log("Data fetched: ", oData);
                    sap.ui.core.BusyIndicator.hide();
                })  
                .catch(function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("ErrorReadingDataFromBackend"), {
                        title: "Error",
                        details: error
                    });
                });
        }

        
    });
});