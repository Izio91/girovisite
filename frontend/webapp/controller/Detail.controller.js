sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "frontend/utils/formatter"
], (BaseController, JSONModel, MessageBox, MessageToast, formatter) => {
    "use strict";

    var baseManifestUrl;
    var oBundle;
    
    return BaseController.extend("frontend.controller.Detail", {
        formatter: formatter,
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
            this.getView().byId("titleExpandedHeading").setText(oBundle.getText("DetailTitle"));
            this.getView().byId("titleSnappedHeading").setText(oBundle.getText("DetailTitle"));

            this.defineModelForCurrentPage(false, false);
            this._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`);
        },

        _onCreateMatched: function (oEvent) {
            console.log("create");
            this.defineModelForCurrentPage(true, true);
            this.getView().byId("subTitleIdExpandedContent").setText();
            this.getView().byId("subTitleIdSnappedContent").setText();
            this.getView().byId("subTitleIdSnappedTitleOnMobile").setText();
            this.getView().byId("titleExpandedHeading").setText(oBundle.getText("CreateTitle"));
            this.getView().byId("titleSnappedHeading").setText(oBundle.getText("CreateTitle"));
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
                    "vtweg": [],
                    "spart": [],
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
            var that = this;
            MessageBox.warning(oBundle.getText("AlertGoBack"), {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.YES) {
                  that._unlockDocument();
                  that.getOwnerComponent().getRouter().navTo("main");
                }
              }
            });
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
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/PlantName", "inputWerksDescrDetail");
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

        // Vtweg value help
        onVtwegVH : function (oEvent) {
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getVtweg()',
                sPropertyPath = "/valuehelps/vtweg",
                sIdControl = "idVtwegDialog_VH",
                sFragmentName = "frontend.view.fragments.VtwegVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchVtweg: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["DistributionChannel"], "idVtwegDialog_VH");
        },

        onConfirmVtweg: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/DistributionChannel", "inputVtwegDetail");
        },

        // Spart value help
        onSpartVH : function (oEvent) {
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getSpart()',
                sPropertyPath = "/valuehelps/spart",
                sIdControl = "idSpartDialog_VH",
                sFragmentName = "frontend.view.fragments.SpartVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchSpart: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Division"], "idSpartDialog_VH");
        },

        onConfirmSpart: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/Division", "inputSpartDetail");
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
            this._onConfirmValueHelp(oEvent, "detailModel", this.getView(), "/CustomerName", "inputDriverDescrDetail");
        },

        // Kunnr value help
        onKunnrVH : function (oEvent) {
            this.oInputKunnr = oEvent.getSource();
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getKunnr()',
                sPropertyPath = "/valuehelps/kunnr",
                sIdControl = "idKunnrDialog_VH",
                sFragmentName = "frontend.view.fragments.KunnrVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchKunnr: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "CustomerName", "StreetName", "CityName", "Region", "PostalCode"], "idKunnrDialog_VH");  
        },

        onConfirmKunnr: function (oEvent) {
            var sPath = oEvent.getParameter("selectedItem").getBindingContextPath(),
                sCustomerValue = this.getView().getModel("detailModel").getProperty(sPath + "/Customer"),
                sCustomerNameValue = this.getView().getModel("detailModel").getProperty(sPath + "/CustomerName"),
                sStreetNameValue = this.getView().getModel("detailModel").getProperty(sPath + "/StreetName"),
                sCityNameValue = this.getView().getModel("detailModel").getProperty(sPath + "/CityName"),
                sRegionValue = this.getView().getModel("detailModel").getProperty(sPath + "/Region"),
                sPostalCodeValue = this.getView().getModel("detailModel").getProperty(sPath + "/PostalCode"),
                sValue = sCustomerValue + " - " + sCustomerNameValue + " " + sStreetNameValue + " " + sCityNameValue + " " + sRegionValue + " " + sPostalCodeValue; 
            this.oInputKunnr.setValue(sValue);
        },

        // Kunwe value help
        onKunweVH : function (oEvent) {
            this.oInputKunwe = oEvent.getSource();
            var oDetailModel= this.getView().getModel("detailModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getKunwe()',
                sPropertyPath = "/valuehelps/kunwe",
                sIdControl = "idKunweDialog_VH",
                sFragmentName = "frontend.view.fragments.KunweVH";
            this._onValueHelp(this, oDetailModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchKunwe: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "CustomerName", "StreetName", "CityName", "Region", "PostalCode"], "idKunweDialog_VH");
        },

        onConfirmKunwe: function (oEvent) {
            var sPath = oEvent.getParameter("selectedItem").getBindingContextPath(),
                sCustomerValue = this.getView().getModel("detailModel").getProperty(sPath + "/Customer"),
                sCustomerNameValue = this.getView().getModel("detailModel").getProperty(sPath + "/CustomerName"),
                sStreetNameValue = this.getView().getModel("detailModel").getProperty(sPath + "/StreetName"),
                sCityNameValue = this.getView().getModel("detailModel").getProperty(sPath + "/CityName"),
                sRegionValue = this.getView().getModel("detailModel").getProperty(sPath + "/Region"),
                sPostalCodeValue = this.getView().getModel("detailModel").getProperty(sPath + "/PostalCode"),
                sValue = sCustomerValue + " - " + sCustomerNameValue + " " + sStreetNameValue + " " + sCityNameValue + " " + sRegionValue + " " + sPostalCodeValue; 
            this.oInputKunwe.setValue(sValue);
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
            this.getLockStatus().then(function (data) {
              if (data.value[0].result.locked) {
                MessageBox.warning(oBundle.getText("CannotEdit", data.value[0].result.lockedBy));
              } else {
                this._lockDocument();
              }
            }.bind(this));
        },

        _lockDocument : async function () {
            var that = this,
                sUrl = baseManifestUrl + "/girovisiteService/lock",
                body = {
                    vpid: this._vpid.toString()
                };
            try {
                sap.ui.core.BusyIndicator.show();  
                
                // Execute the request
                var oData = await this.executeRequest(sUrl, 'POST', JSON.stringify(body));
                this.getView().getModel("detailModel").setProperty("/editMode", true);
                MessageToast.show(oBundle.getText("documentLocked"));
            } catch (error) {
                MessageBox.error(oBundle.getText("unableToLockDocument"), {
                    title: "Error",
                    details: error
                });
            } finally {
                that._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${that._vpid}',vctext='${that._vctext}',werks='${that._werks}',vkorg='${that._vkorg}',vtweg='${that._vtweg}',spart='${that._spart}')?$expand=details`);
                sap.ui.core.BusyIndicator.hide();
            }
        },

        _unlockDocument : async function () {
            var that = this,
                sUrl = baseManifestUrl + "/girovisiteService/unlock",
                body = {
                    vpid: this._vpid.toString()
                };
            try {
                sap.ui.core.BusyIndicator.show();  
                
                // Execute the request
                var oData = await this.executeRequest(sUrl, 'POST', JSON.stringify(body));
                this.getView().getModel("detailModel").setProperty("/editMode", false);
                MessageToast.show(oBundle.getText("documentUnlocked"));
            } catch (error) {
                MessageBox.error(oBundle.getText("unableToUnlockDocument"), {
                    title: "Error",
                    details: error
                });
            } finally {
                that._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${that._vpid}',vctext='${that._vctext}',werks='${that._werks}',vkorg='${that._vkorg}',vtweg='${that._vtweg}',spart='${that._spart}')?$expand=details`);
                sap.ui.core.BusyIndicator.hide();
            }
        },

        onCancelEditPress: function () {
            var that = this;
            MessageBox.warning(oBundle.getText("AlertCancelEdit"), {
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.YES) {
                  that._unlockDocument();
                }
              }
            });
        },

        onSelectionDetailChange : function () {
            var oTable = this.getView().byId("idDetailTable"),
              aIndices = oTable.getSelectedIndices(),
              bEnableDeleteButton = aIndices.length > 0;
            this.getView().byId("deleteRowFromTable").setEnabled(bEnableDeleteButton);

        },

        onAddRow: function (oEvent) {
          this._addRow();
        },

        _addRow: function () {
            var oDetailModel = this.getView().getModel("detailModel"),
                aRows = oDetailModel.getProperty("/detail/details"),
                nVppos = aRows ? aRows.length + 1 : 1;

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
              "vppos": nVppos,
              "werks": oDetailModel.getProperty("/detail/werks")
            });
            oDetailModel.setProperty("/detail/details", aRows);
        },

        onSavePress : function () {
            /** TODO */
        },

        getLockStatus: async function () {
            var sUrl = baseManifestUrl + "/girovisiteService/getLockStatus()?vpid='" + this._vpid + "'";
            return await this.executeRequest(sUrl, 'GET');
        }
    });
});