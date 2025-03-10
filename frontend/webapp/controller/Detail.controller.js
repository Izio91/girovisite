sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "frontend/utils/formatter"
], (BaseController, JSONModel, MessageBox, formatter) => {
    "use strict";

    var baseManifestUrl;
    var oBundle;
    var aRemovedLines;
    return BaseController.extend("frontend.controller.Detail", {
        formatter: formatter,
        onInit() {
            baseManifestUrl = jQuery.sap.getModulePath(this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id);
            // read msg from i18n model
            oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            aRemovedLines = [];
            
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

            this.defineModelForCurrentPage(false, false);
            this._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`)
        },

        _onCreateMatched: function (oEvent) {
            console.log("create");
            this.defineModelForCurrentPage(true, true);
        },


        /**
         * Define the model for the current page and attach it to the view.
         */
        defineModelForCurrentPage: function (bIsNew, bEdit) {
            var oModel = {
                "isNew": bIsNew,
                "editMode": bEdit,
                "detail": {
                    "details": []
                },
                "valuehelps": {
                    "werks": [],
                    "vkorg": [],
                    "driver": [],
                    "kunnr": [],
                    "kunwe": []
                }
            };
            this.getView().setModel(new JSONModel(oModel), "detailModel");
        },


        _fetchData: async function (sUrl) {  
            var oDetailModel = this.getView().getModel("detailModel"),
                that = this;

            try {
                sap.ui.core.BusyIndicator.show();  
                
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
        },

        // Werks value help
        onWerksVH : function () {
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getWerks()',
                sPropertyPath = "/valuehelps/werks",
                sIdControl = "idWerksDialog_VH",
                sFragmentName = "frontend.view.fragments.WerksVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchWerks: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Plant", "PlantName"], "idWerksDialog_VH");
        },

        onConfirmWerks: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/Plant", "inputWerksDetail");
        },

        // Vkorg value help
        onVkorgVH : function (oEvent) {
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getVkorg()',
                sPropertyPath = "/valuehelps/vkorg",
                sIdControl = "idVkorgDialog_VH",
                sFragmentName = "frontend.view.fragments.VkorgVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchVkorg: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["SalesOrganization"], "idVkorgDialog_VH");
        },

        onConfirmVkorg: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/SalesOrganization", "inputVkorgDetail");
        },

        // Driver value help
        onDriverVH : function (oEvent) {
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getDriver()',
                sPropertyPath = "/valuehelps/driver",
                sIdControl = "idDriverDialog_VH",
                sFragmentName = "frontend.view.fragments.DriverVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchDriver: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "CustomerName"], "idDriverDialog_VH");
        },

        onConfirmDriver: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/Customer", "inputDriver1Detail");
        },

        // Kunnr value help
        onKunnrVH : function (oEvent) {
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getKunnr()',
                sPropertyPath = "/valuehelps/kunnr",
                sIdControl = "idKunnrDialog_VH",
                sFragmentName = "frontend.view.fragments.KunnrVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchKunnr: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "CustomerName"], "idKunnrDialog_VH");  
        },

        onConfirmKunnr: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/Customer", "inputKunnrDetail");
        },

        // Kunwe value help
        onKunweVH : function (oEvent) {
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getKunwe()',
                sPropertyPath = "/valuehelps/kunwe",
                sIdControl = "idKunweDialog_VH",
                sFragmentName = "frontend.view.fragments.KunweVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchKunwe: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "StreetName", "CityName", "Region", "PostalCode"], "idKunweDialog_VH");
        },

        onConfirmKunwe: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/Customer", "inputKunweDetail");
        },

        onEditPress: function () {
            var that = this;
            MessageBox.warning(oBundle.getText("AlertEdit"), {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.YES) {
                  that._onEdit();
                }
              }
            });
        },

        _onEdit: function () {
            this.getView().getModel("detailModel").setProperty("/editMode", true);
            aRemovedLines = [];
        },

        onCancelEditPress: function () {
            var that = this;
            MessageBox.warning(oBundle.getText("AlertCancelEdit"), {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.YES) {
                  that._onCancelEdit().then(result => that._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${that._vpid}',vctext='${that._vctext}',werks='${that._werks}',vkorg='${that._vkorg}',vtweg='${that._vtweg}',spart='${that._spart}')?$expand=details`));
                }
              }
            });
        },

        _onCancelEdit : function () { 
            var that = this;
            /** Promise must to be replaced by get lock info requests */
            return new Promise(function (resolve, reject) {
                that.getView().getModel("detailModel").setProperty("/editMode", false); 
                aRemovedLines = [];
                resolve();
            });
        },

        onSelectionDetailChange : function () {
            var oTable = this.getView().byId("idDetailTable"),
              aIndices = oTable.getSelectedIndices(),
              bEnableDeleteButton = aIndices.length > 0;
            this.getView().byId("deleteRowFromTable").setEnabled(bEnableDeleteButton);

        },

        /**
         * Handles caching of removed line details.
         * Stores details of rows selected for deletion in an array if they exist in the database.
         * If a row is new (vpid is null), it is not added to the removal list.
         */
        _handleRemovedLineDetailCache: function () {
            var oDetailModel = this.getView().getModel("detailModel"),
                oTable = this.getView().byId("idDetailTable"),
                aSelectedIndices = oTable.getSelectedIndices(),
                selectedContexts = aSelectedIndices.map(iIndex => oTable.getContextByIndex(iIndex));
    
            aRemovedLines = selectedContexts.map(oContext => {
                let sVpid = oDetailModel.getProperty(oContext.sPath + "/vpid"),
                    sVppos = oDetailModel.getProperty(oContext.sPath + "/vppos"),
                    sWerks = oDetailModel.getProperty(oContext.sPath + "/werks");
                if (sVpid) {
                  return `(vpid='${sVpid}',vppos='${sVppos}',werks='${sWerks}')`;
                }
            });
        },

        /**
         * Deletes the selected rows from the model.
         * Determines the difference between currently bound data and selected rows,
         * then updates the model to reflect the remaining (non-deleted) rows.
         */
        _onDeleteSelectedRows: function() {
            var oDetailModel = this.getView().getModel("detailModel"),
              oTable = this.getView().byId("idDetailTable"),
              aSelectedIndices = oTable.getSelectedIndices(),
              selectedContexts = aSelectedIndices.map(iIndex => oTable.getContextByIndex(iIndex)),
              oBinding = oTable.getBinding("rows"),
              aBindingContext = oBinding.getContexts(0, oBinding.getLength());
      
            let a = new Set(aBindingContext);
            let b = new Set(selectedContexts);
            let diff = new Set([...a].filter(x => !b.has(x)));
      
            var aDiff = [...diff];
      
            var values = aDiff.map((ctx, index) => {
              return ctx.getObject();
            });
      
            oDetailModel.setProperty("/detail/details", values);
        },

        /**
         * Main function to handle deletion of selected rows.
         * Calls the cache handler, deletion logic, and updates selection details.
         */
        onDeleteSelectedRows: function () {
          this._handleRemovedLineDetailCache();
          this._onDeleteSelectedRows();
          this.onSelectionDetailChange();
        },

        onAddRow: function (oEvent) {
          this._addRow();
        },

        _addRow: function () {
            var oDetailModel = this.getView().getModel("detailModel"),
                aRows = oDetailModel.getProperty("/detail/details"),
                nVpos = aRows ? aRows.length + 1 : 1;

            if (!aRows) {
                aRows = [];
            }
            aRows.unshift({
              "aedat": null,
              "aenam": null,
              "aezet": null,
              "datab": null,
              "datbi": null,
              "driver1": null,
              "dtabwe": null,
              "dtbiwe": null,
              "dtfine": null,
              "erdat": null,
              "ernam": null,
              "erzet": null,
              "kunnr": null,
              "kunwe": null,
              "turno": null,
              "sequ": null,
              "monday": null,
              "tuesday": null,
              "wednesday": null,
              "thursday": null,
              "friday": null,
              "saturday": null,
              "sunday": null,
              "vpid": oDetailModel.getProperty("/detail/vpid"),
              "vppos": nVpos,
              "werks": oDetailModel.getProperty("/detail/werks")
            });
            oDetailModel.setProperty("/detail/details", aRows);
        },

        onSavePress : function () {
            /** TODO */
        }
    });
});