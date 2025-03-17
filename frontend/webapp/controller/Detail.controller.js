sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "frontend/utils/formatter"
], (BaseController, JSONModel, MessageBox, MessageToast, Fragment, formatter) => {
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

            this.defineModelForCurrentPage(false, false, true);
            this._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`);
        },

        _onCreateMatched: function (oEvent) {
            console.log("create");
            this.defineModelForCurrentPage(true, false, false);
            this.getView().byId("subTitleIdExpandedContent").setText();
            this.getView().byId("subTitleIdSnappedContent").setText();
            this.getView().byId("subTitleIdSnappedTitleOnMobile").setText();
            this.getView().byId("titleExpandedHeading").setText(oBundle.getText("CreateTitle"));
            this.getView().byId("titleSnappedHeading").setText(oBundle.getText("CreateTitle"));
        },


        /**
         * Define the model for the current page and attach it to the view.
         */
        defineModelForCurrentPage: function (bIsNew, bEdit, bReadOnly) {
            var oModel = {
                "isNew": bIsNew,
                "editMode": bEdit,
                "readOnly": bReadOnly,
                "detail": {
                    "active": "",
                    "aedat": null,
                    "aenam": null,
                    "aezet": null,
                    "datfr": null,
                    "datto": null,
                    "driver1": null,
                    "driverDescr": null,
                    "erdat": null,
                    "ernam": null,
                    "erzet": null,
                    "locked": false,
                    "lockedAt": null,
                    "lockedBy": null,
                    "loevm": null,
                    "spart": null,
                    "termCode": null,
                    "vctext": null,
                    "vkorg": null,
                    "vpid": null,
                    "vtweg": null,
                    "werks": null,
                    "werksDescr": null,
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
                bReadOnly = false,
                that = this;

            try {
                sap.ui.core.BusyIndicator.show();  
                
                // Execute the request
                var oData = await this.executeRequest(sUrl, 'GET');
                console.log("Data fetched: ", oData);

                // Enrich oData.details with isKunnr and isKunwe boolean properties
                oData.details = oData.details.map(detail => {
                    if (detail.kunnr) {
                        detail.isKunnr = true;
                    } else {
                        detail.isKunnr = false;
                    }
                    
                    if (detail.kunwe) {
                        detail.isKunwe = true;
                    } else {
                        detail.isKunwe = false;
                    }
                    
                    return detail;
                });
                
                oDetailModel.setProperty("/detail", oData);
                if (oData.loevm === 'X') {
                    bReadOnly = true;
                }
                
                oDetailModel.setProperty("/detail", oData);
                oDetailModel.setProperty("/readOnly", bReadOnly);
            } catch (error) {
                MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"), {
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
                  that.getOwnerComponent().getRouter().navTo("main");
                }
              }
            });
        },

        // Werks value help
        onWerksVH : function (oEvent) {
            this.oInputWerksDetail = oEvent.getSource();
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
            this.oInputWerksDetail.fireChangeEvent(this.getControlValue(this.oInputWerksDetail));
        },

        // Vkorg value help
        onVkorgVH : function (oEvent) {
            this.oInputVkorgDetail = oEvent.getSource();
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
            this.oInputVkorgDetail.fireChangeEvent(this.getControlValue(this.oInputVkorgDetail));
        },

        // Vtweg value help
        onVtwegVH : function (oEvent) {
            this.oInputVtwegDetail = oEvent.getSource();
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
            this.oInputVtwegDetail.fireChangeEvent(this.getControlValue(this.oInputVtwegDetail));
        },

        // Spart value help
        onSpartVH : function (oEvent) {
            this.oInputSpartDetail = oEvent.getSource();
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
            this.oInputSpartDetail.fireChangeEvent(this.getControlValue(this.oInputSpartDetail));
        },

        // Driver value help
        onDriverVH : function (oEvent) {
            this.oInputDriverDetail = oEvent.getSource();
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
            this.oInputDriverDetail.fireChangeEvent(this.getControlValue(this.oInputDriverDetail));
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
                sAddressValue = sStreetNameValue + " " + sCityNameValue + " " + sRegionValue + " " + sPostalCodeValue,
                sValue = sCustomerValue + " - " + sCustomerNameValue + " " + sAddressValue,
                sKunnrPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/kunnr",
                sKunnrAddressPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/kunnrAddress",
                sKunnrCompanyNamePath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/kunnrCompanyName"; 
            this.getView().getModel("detailModel").setProperty(sKunnrPath, sCustomerValue);
            this.getView().getModel("detailModel").setProperty(sKunnrAddressPath, sAddressValue);
            this.getView().getModel("detailModel").setProperty(sKunnrCompanyNamePath, sCustomerNameValue);
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
                sDataCessazione = this.getView().getModel("detailModel").getProperty(sPath + "/DataCessazione"),
                sAddressValue = sStreetNameValue + " " + sCityNameValue + " " + sRegionValue + " " + sPostalCodeValue,
                sValue = sCustomerValue + " - " + sCustomerNameValue + " " + sAddressValue,
                sKunwePath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/kunwe",
                sKunweAddressPath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/kunweAddress",
                sKunweCompanyNamePath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/kunweCompanyName",
                sDtfinePath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/dtfine"; 
            this.getView().getModel("detailModel").setProperty(sKunwePath, sCustomerValue);
            this.getView().getModel("detailModel").setProperty(sKunweAddressPath, sAddressValue);
            this.getView().getModel("detailModel").setProperty(sKunweCompanyNamePath, sCustomerNameValue);
            this.getView().getModel("detailModel").setProperty(sDtfinePath, sDataCessazione);
            this.oInputKunwe.setValue(sValue);
        },

        onEditPress: function () {
            this.getLockStatus().then(function (data) {
              if (data.value[0].result[0].locked) {
                MessageBox.warning(oBundle.getText("CannotEdit", [data.value[0].result[0].lockedBy]));
              } else {
                var that = this;
                MessageBox.warning(oBundle.getText("AlertEdit"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.NO,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._lockDocument();
                    }
                }
                });
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
            bCannotSelectRow = false;

            oTable.getSelectedIndices().forEach((iIndex) => {
                var oContext = oTable.getContextByIndex(iIndex); // Get row context
                var oRowData = oContext.getObject(); // Get row data
        
                if (!oRowData.isNew) {
                    // If isNew is undefined or false, deselect the row
                    oTable.removeSelectionInterval(iIndex, iIndex);
                    bCannotSelectRow = true;
                }
            });

            var aIndices = oTable.getSelectedIndices(),
                bEnableDeleteButton = aIndices.length > 0;
            this.getView().byId("deleteRowFromTable").setEnabled(bEnableDeleteButton);

            if (bCannotSelectRow) {
                MessageToast.show(oBundle.getText("cannotSelectRow"));
            }
        },

        onAddRow: function (oEvent) {
            this.oContext = oEvent.getSource().getBindingContext('detailModel');
            
            var oControl = oEvent.getSource(),
                oView = this.getView();

            if (!this._oAddRowMenuFragment) {
                Fragment.load({
                    id: oView.getId(),
                    name: "frontend.view.fragments.AddRowMenu",
                    controller: this
                }).then(function (oMenu) {
                    oView.addDependent(oMenu);
                    oMenu.openBy(oControl);
                    this._oAddRowMenuFragment = oMenu;
                }.bind(this));
            } else {
                this._oAddRowMenuFragment.openBy(oControl);
            }
        },

        onAddKunnr: function () {
            this._addRow(true, false);
        }, 

        onAddKunwe: function () {
            this._addRow(false, true);
        },

        _addRow: function (bIsKunnr, bIsKunwe) {
            var oDetailModel = this.getView().getModel("detailModel"),
                aRows = oDetailModel.getProperty("/detail/details"),
                nVppos = aRows.length > 0 ? aRows[aRows.length -1].vppos + 1 : 1;

            if (!aRows) {
                aRows = [];
            } else {
                aRows.forEach(oRow => {
                    // All previous agent must be inactive
                    if (oRow.isKunnr) {
                        oRow.inactive = 'X';
                    }
                })
            }

            aRows.push({
              "isNew": true,
              "isKunnr": bIsKunnr,
              "isKunwe": bIsKunwe,
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
              "inactive": bIsKunnr ? '' : null,
              "kunnr": null,
              "kunnrAddress": null,
              "kunnrCompanyName": null,
              "kunwe": null,
              "kunweAddress": null,
              "kunweCompanyName": null,
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
          this._onDeleteSelectedRows();
          this.onSelectionDetailChange();
        },


        _getCurrentDate : function() {
            var dDate = new Date(),
                aLocaleDate = dDate.toLocaleDateString('it-IT').split("/"),
                sYear = aLocaleDate[2],
                sMonth = aLocaleDate[1].padStart(2, '0'),
                sDay = aLocaleDate[0].padStart(2, '0'),
                sDate = sYear + "-" + sMonth + "-" + sDay;
            return sDate
        },

        _getCurrentTime : function() {
            var dDate = new Date(),
                sTime = dDate.toLocaleTimeString('it-IT');
            return sTime
        },

        eraseValue: function (oEvent) {
            oEvent.getSource().setValue();
        },

        _onChangeEventHandler: function (oEvent, sProperty) {
            var oControl = oEvent.getSource(),
                bControlBelongingToHeader = oControl.getBindingContext("detailModel") === undefined,
                sPath = bControlBelongingToHeader ? "/detail" + sProperty : oControl.getBindingContext("detailModel").getPath() + sProperty,
                sValue = this.getControlValue(oControl);
            this.getView().getModel("detailModel").setProperty(sPath, sValue);
        },

        onChangeWerks: function (oEvent) {
            var sWerksDescr = this.getControlValue(this.getView().byId("inputWerksDescrDetail"));
            this.getView().getModel("detailModel").setProperty("/detail/werksDescr", sWerksDescr);
            this._onChangeEventHandler(oEvent, "/werks");
        },

        onChangeVkorg: function (oEvent) { 
            this._onChangeEventHandler(oEvent, "/vkorg");
        },

        onChangeVtweg: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/vtweg");
        },

        onChangeSpart: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/spart");
        },

        onChangeDriver: function () {
            var sDriverDescr = this.getControlValue(this.getView().byId("inputDriverDescrDetail")),
                sDriver = this.getControlValue(this.getView().byId("inputDriver1Detail")),
                sTermCode = sDriver !== null && sDriver !== '' && sDriver !== undefined ? sDriver.slice(-3) : null;
            this.getView().getModel("detailModel").setProperty("/detail/driverDescr", sDriverDescr);
            this.getView().getModel("detailModel").setProperty("/detail/driver1", sDriver);
            this.getView().getModel("detailModel").setProperty("/detail/termCode", sTermCode);
        },

        onChangeDatfr: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/datfr");
        },

        onChangeDatto: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/datto");
        },

        onChangeActive: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/active");
        },

        onChangeLoevm: function (oEvent) {
            var that = this;
            MessageBox.warning(oBundle.getText("AlertLoevm"), {
              title: oBundle.getText("TitleAlertLoevm"),
              actions: [MessageBox.Action.YES, MessageBox.Action.NO],
              emphasizedAction: MessageBox.Action.NO,
              onClose: function (sAction) {
                if (sAction === MessageBox.Action.YES) {
                  that._onChangeEventHandler(oEvent, "/loevm");
                }
              }
            });
        },

        onChangeKunnr: function (oEvent) {
            var sDetailPath = oEvent.getSource().getBindingContext("detailModel").getPath() + "/kunwe"
                sCustomerValue = oEvent.getSource().getValue(); 
            this.getView().getModel("detailModel").setProperty(sDetailPath, sCustomerValue);
        },

        onChangeDatab: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/datab");
        },

        onChangeDatbi: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/datbi");
        },

        onChangeInactive: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/inactive");
        },

        onChangeKunwe: function (oEvent) {
            var sDetailPath = oEvent.getSource().getBindingContext("detailModel").getPath() + "/kunwe"
                sCustomerValue = oEvent.getSource().getValue(); 
            this.getView().getModel("detailModel").setProperty(sDetailPath, sCustomerValue);
        },

        onChangeDtabwe: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/dtabwe");
        },

        onChangeDtbiwe: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/dtbiwe");
        },

        onChangeTurno: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/turno");
            this._changeDaysValueOnChangingTurno(oEvent);
        },

        _changeDaysValueOnChangingTurno: function (oEvent) {
            var oControl = oEvent.getSource(),
                sPathMonday = oControl.getBindingContext("detailModel").getPath() + "/monday",
                sPathTuesday = oControl.getBindingContext("detailModel").getPath() + "/tuesday",
                sPathWednesday = oControl.getBindingContext("detailModel").getPath() + "/wednesday",
                sPathThursday = oControl.getBindingContext("detailModel").getPath() + "/thursday",
                sPathFriday = oControl.getBindingContext("detailModel").getPath() + "/friday",
                sPathSaturday = oControl.getBindingContext("detailModel").getPath() + "/saturday",
                sPathSunday = oControl.getBindingContext("detailModel").getPath() + "/sunday";
            
            this.getView().getModel("detailModel").setProperty(sPathMonday, null);
            this.getView().getModel("detailModel").setProperty(sPathTuesday, null);
            this.getView().getModel("detailModel").setProperty(sPathWednesday, null);
            this.getView().getModel("detailModel").setProperty(sPathThursday, null);
            this.getView().getModel("detailModel").setProperty(sPathFriday, null);
            this.getView().getModel("detailModel").setProperty(sPathSaturday, null);
            this.getView().getModel("detailModel").setProperty(sPathSunday, null);
        },

        onLiveChangeSequAndDays: function (oEvent) {
            var sValue = oEvent.getSource().getValue();
            if (sValue.length >= 4) {
                oEvent.getSource().setValue(sValue.substr(0, 3));
            }
        },

        onChangeSequ: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/sequ");
            this._changeDaysValueOnChangingSequ(oEvent);
        },

        _changeDaysValueOnChangingSequ: function (oEvent) {
            var oControl = oEvent.getSource(),
                sPathMonday = oControl.getBindingContext("detailModel").getPath() + "/monday",
                sPathTuesday = oControl.getBindingContext("detailModel").getPath() + "/tuesday",
                sPathWednesday = oControl.getBindingContext("detailModel").getPath() + "/wednesday",
                sPathThursday = oControl.getBindingContext("detailModel").getPath() + "/thursday",
                sPathFriday = oControl.getBindingContext("detailModel").getPath() + "/friday",
                sPathSaturday = oControl.getBindingContext("detailModel").getPath() + "/saturday",
                sPathSunday = oControl.getBindingContext("detailModel").getPath() + "/sunday",
                sPathTurno = oControl.getBindingContext("detailModel").getPath() + "/turno",
                sSequ = this.getControlValue(oControl),
                sTurnoKey = this.getView().getModel("detailModel").getProperty(sPathTurno);

            switch (sTurnoKey) {
                case "1":
                    this.getView().getModel("detailModel").setProperty(sPathMonday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathTuesday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathWednesday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathThursday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathFriday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathSaturday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathSunday, null);
                    break;
                case "2":
                    this.getView().getModel("detailModel").setProperty(sPathMonday, null);
                    this.getView().getModel("detailModel").setProperty(sPathTuesday, null);
                    this.getView().getModel("detailModel").setProperty(sPathWednesday, null);
                    this.getView().getModel("detailModel").setProperty(sPathThursday, null);
                    this.getView().getModel("detailModel").setProperty(sPathFriday, null);
                    this.getView().getModel("detailModel").setProperty(sPathSaturday, null);
                    this.getView().getModel("detailModel").setProperty(sPathSunday, sSequ);
                    break;
                case "3":
                    this.getView().getModel("detailModel").setProperty(sPathMonday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathTuesday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathWednesday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathThursday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathFriday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathSaturday, sSequ);
                    this.getView().getModel("detailModel").setProperty(sPathSunday, sSequ);
                    break;
                default:
                    this.getView().getModel("detailModel").setProperty(sPathMonday, null);
                    this.getView().getModel("detailModel").setProperty(sPathTuesday, null);
                    this.getView().getModel("detailModel").setProperty(sPathWednesday, null);
                    this.getView().getModel("detailModel").setProperty(sPathThursday, null);
                    this.getView().getModel("detailModel").setProperty(sPathFriday, null);
                    this.getView().getModel("detailModel").setProperty(sPathSaturday, null);
                    this.getView().getModel("detailModel").setProperty(sPathSunday, null);
            }
        },

        onChangeMonday: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/monday");
        },

        onChangeTuesday: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/tuesday");
        },

        onChangeWednesday: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/wednesday");
        },

        onChangeThursday: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/thursday");
        },

        onChangeFriday: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/friday");
        },

        onChangeSaturday: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/saturday");
        },

        onChangeSunday: function (oEvent) {
            this._padSequAndDayValue(oEvent);
            this._onChangeEventHandler(oEvent, "/sunday");
        },

        _padSequAndDayValue : function (oEvent) {
            var sValue = oEvent.getSource().getValue();
            oEvent.getSource().setValue(sValue.padStart(3, '0'));
        },

        getLockStatus: async function () {
            var sUrl = baseManifestUrl + "/girovisiteService/getLockStatus()?vpid='" + this._vpid + "'";
            return await this.executeRequest(sUrl, 'GET');
        },

        onCreatePress : function () {
            var sDate = this._getCurrentDate(),
                sTime = this._getCurrentTime(),
                oDetail = this.getView().getModel("detailModel").getProperty("/detail");

            this._checkDataBeforeUpdateOrCreate(oDetail);
            this._setDatbiIfLoevm(oDetail);
            
            oDetail.aedat = sDate;
            oDetail.aezet = sTime;
            oDetail.erdat = sDate;
            oDetail.erzet = sTime;
            this.getView().getModel("detailModel").setProperty("/detail", oDetail);
            console.log(this.getView().getModel("detailModel").getProperty("/detail"));
            

            // this.getOwnerComponent().getRouter().navTo("detail", { vpid: '639', vctext: 'AGENTE PROVVISORIO 810', werks: 'PRD1', vkorg: 'CLR1', vtweg: '10', spart: '0' });
        },

        onUpdatePress : function () {
            var sDate = this._getCurrentDate(),
                sTime = this._getCurrentTime(),
                oDetail = this.getView().getModel("detailModel").getProperty("/detail");

            this._checkDataBeforeUpdateOrCreate(oDetail);
            this._setDatbiIfLoevm(oDetail);
            
            oDetail.aedat = sDate;
            oDetail.aezet = sTime;
            oDetail.erdat = sDate;
            oDetail.erzet = sTime;
            this.getView().getModel("detailModel").setProperty("/detail", oDetail);
            console.log(this.getView().getModel("detailModel").getProperty("/detail"));
        },

        _checkDataBeforeUpdateOrCreate : function () {
            var sErrorMessage = '',
                oDetail = this.getView().getModel("detailModel").getProperty("/detail");

            sErrorMessage = sErrorMessage + this._checkRequiredInfo(oDetail);
            sErrorMessage = sErrorMessage + this._checkActiveAgent(oDetail);
            sErrorMessage = sErrorMessage + this._checkAgentsTemporalContinuity(oDetail);
            sErrorMessage = sErrorMessage + this._checkKunwePresent(oDetail);
        },

        /**
         * Check if all required fields are set considering also the kunnr/kunwe row type
         * @param {*} oDetail 
         * @returns {string} - error message if some required field is not set, empty string otherwise
         */
        _checkRequiredInfo : function (oDetail) {
            var sErrorMessage = '';

            function checkDataFilled (sValue, sLabel) {
                if (!sValue || sValue.trim() === '') {
                    sErrorMessage = sErrorMessage + oBundle.getText("missingData", [oBundle.getText(sLabel)])+"\n";
                }
            }

            checkDataFilled(oDetail.vctext, "vctext");
            checkDataFilled(oDetail.werks, "werks");
            checkDataFilled(oDetail.vkorg, "vkorg");
            checkDataFilled(oDetail.vtweg, "vtweg");
            checkDataFilled(oDetail.spart, "spart");
            checkDataFilled(oDetail.driver1, "driver1");
            checkDataFilled(oDetail.datfr, "datfr");
            checkDataFilled(oDetail.datto, "datto");

            oDetail.details.forEach(detail => {
                if (detail.isKunnr) {
                    checkDataFilled(detail.kunnr, "kunnr");
                    checkDataFilled(detail.datab, "datab");
                    checkDataFilled(detail.datbi, "datbi");
                } else {
                    checkDataFilled(detail.kunwe, "kunwe");
                    checkDataFilled(detail.dtabwe, "dtabwe");
                    checkDataFilled(detail.dtbiwe, "dtbiwe");
                    checkDataFilled(detail.turno, "turno");
                    checkDataFilled(detail.sequ, "sequ");
                }
            }); 

            return sErrorMessage;
        },

        /**
         * Check if current agent is active for another plan in the same range
         * @param {*} oDetail 
         * @returns {string} - if the agent is active or no agent has been selected it returns a string containing an error message, empty string otherwise
         */
        _checkActiveAgent : async function (oDetail) {
            const activeAgent = oDetail.details.filter(detail => detail.isKunnr && detail.inactive === '');
            var sErrorMessage = "",
                bIsNew = this.getView().getModel("detailModel").getProperty("/isNew"),
                bIsActive = this.getView().getModel("detailModel").getProperty("/detail/active") === 'X';
            if (activeAgent.length > 0) {
                var sKunnr = activeAgent[0].kunnr, // agent code
                    sDatab = activeAgent[0].datab, // agent starting validity date
                    sUrl = baseManifestUrl + `/girovisiteService/Header?$filter=loevm eq null or loevm eq ''&$select=vpid&$expand=details($filter=kunnr eq '${sKunnr}' and (inactive eq null or inactive eq '') and (datbi ge '${sDatab}');$select=vpid,kunnr,inactive,datab,datbi)`;

                try { 
                    
                    // Execute the request
                    var oResult = await this.executeRequest(sUrl, 'GET'),
                        aDetails = [];
                    console.log("Detail fetched: ", oResult);

                    // Merge all details from result
                    oResult.forEach(oItem => {
                        aDetails = aDetails.concat(oItem.details);
                    });

                    if (aDetails.length !== 0) {
                        sErrorMessage = oBundle.getText("agentAlreadyActive", [aDetails[0].vpid])+"\n";
                    }
                    
                } catch (error) {
                    MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"), {
                        title: "Error",
                        details: error
                    });
                    sErrorMessage = oBundle.getText("ErrorCheckingActiveAgent")+"\n";
                } 
            } else {
                if (bIsNew || bIsActive) {
                    sErrorMessage = oBundle.getText("noAgentForCurrentPlan")+"\n";
                } 
            }

            return sErrorMessage;
        },

        /**
         * Check if agents have a temporal range with continuity and without overlaps
         * @param {*} oDetail 
         * @returns {string} - error message if some agent has no continuity or overlaps, empty string otherwise
         */
        _checkAgentsTemporalContinuity: function (oDetail) {
            var aAgents = oDetail.details.filter(detail => detail.isKunnr),
                sErrorMessage = "";
            if (aAgents.length > 1) {
                // Sort the array by the starting date 'datab'
                aAgents.sort((a, b) => new Date(a.datab) - new Date(b.datab));

                for (let i = 1; i < aAgents.length; i++) {
                    let prevEnd = new Date(aAgents[i - 1].datbi); // Previous object's end date
                    let currStart = new Date(aAgents[i].datab);   // Current object's start date
                    
                    // Check for gaps (if current start is not exactly the next day after previous end)
                    let expectedNextStart = new Date(prevEnd);
                    expectedNextStart.setDate(prevEnd.getDate() + 1);

                    if (currStart.getTime() !== expectedNextStart.getTime()) {
                        console.log("Gap detected between:", aAgents[i - 1], "and", aAgents[i]);
                        sErrorMessage = sErrorMessage + oBundle.getText("errorGapDetected", [aAgents[i - 1].kunnr, aAgents[i].kunnr])+"\n";
                    }

                    // Check for overlaps
                    if (currStart <= prevEnd) {
                        console.log("Overlap detected between:", aAgents[i - 1], "and", aAgents[i]);
                        sErrorMessage = sErrorMessage + oBundle.getText("errorOverlapDetected", [aAgents[i - 1].kunnr, aAgents[i].kunnr])+"\n";
                    }
                }
            }
            return sErrorMessage;
        },

        /**
         * Check if at least one kunwe is present
         * @param {*} oDetail 
         * @returns {string} - error message if no kunwe is present for current plan, empty string otherwise
         */
        _checkKunwePresent : function (oDetail) {
            var sErrorMessage = "",
                bAtLeastOneKunweIsPresent = false;
            oDetail.details.forEach(oDetail => {
                if (oDetail.kunwe) {
                    bAtLeastOneKunweIsPresent = true;
                }
            });

            if (!bAtLeastOneKunweIsPresent) {
                sErrorMessage = oBundle.getText("noKunweForCurrentPlan")+"\n";
            }
            return sErrorMessage;
        },

        /**
         * Set datbi value with current date if loevm is flagged
         * @param {*} oDetail 
         */
        _setDatbiIfLoevm: function (oDetail) {
            if (oDetail.loevm === 'X') {
                var sCurrentDate = this._getCurrentDate();
                oDetail.details.forEach(detail => {
                    detail.detbi = sCurrentDate;
                })
                this.getView().getModel("detailModel").setProperty("/detail", oDetail);
            }
        }
    });
});