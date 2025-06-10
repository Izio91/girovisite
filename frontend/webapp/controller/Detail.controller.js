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
    var sLogonName;

    return BaseController.extend("frontend.controller.Detail", {
        formatter: formatter,
        onInit() {
            baseManifestUrl = jQuery.sap.getModulePath(this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id);
            // read msg from i18n model
            oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

            this._getLogonName().then(function(sResult) {
                sLogonName = sResult;
            })

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("detail").attachPatternMatched(this._onDetailMatched, this);
            oRouter.getRoute("create").attachPatternMatched(this._onCreateMatched, this);
        },

        _getLogonName : async function () {
            var sUrl = baseManifestUrl + `/girovisiteService/getLogonName()`,
                sResult = "",
            oResult = null;
            try {
                oResult = await this.executeRequest(sUrl, 'GET');
                sResult = oResult.value[0].result;
            } catch (error) {
                console.error(error);
            }
            return sResult;
        },


        _onDetailMatched: function (oEvent) {
            this._vpid = oEvent.getParameter("arguments").vpid;
            this._vctext = oEvent.getParameter("arguments").vctext;
            this._werks = oEvent.getParameter("arguments").werks;
            this._vkorg = oEvent.getParameter("arguments").vkorg;
            this._vtweg = oEvent.getParameter("arguments").vtweg;
            this._spart = oEvent.getParameter("arguments").spart;

            let sSubTitle = oBundle.getText("vpid") + ": " + this._vpid;
            this.getView().byId("subTitleIdExpandedContent").setText(sSubTitle);
            this.getView().byId("subTitleIdSnappedContent").setText(sSubTitle);
            this.getView().byId("subTitleIdSnappedTitleOnMobile").setText(sSubTitle);
            this.getView().byId("titleExpandedHeading").setText(oBundle.getText("DetailTitle"));
            this.getView().byId("titleSnappedHeading").setText(oBundle.getText("DetailTitle"));

            this.defineModelForCurrentPage(false, false, true);

            if (this._oAddRowMenuFragment) {
                this.getView().byId("idAddRowMenuFragment").getItems()[0].setEnabled(true);
            }
            this._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`);
        },

        _onCreateMatched: function (oEvent) {
            this.defineModelForCurrentPage(true, false, false);
            this.getView().byId("subTitleIdExpandedContent").setText();
            this.getView().byId("subTitleIdSnappedContent").setText();
            this.getView().byId("subTitleIdSnappedTitleOnMobile").setText();
            this.getView().byId("titleExpandedHeading").setText(oBundle.getText("CreateTitle"));
            this.getView().byId("titleSnappedHeading").setText(oBundle.getText("CreateTitle"));

            if (this._oAddRowMenuFragment) {
                this.getView().byId("idAddRowMenuFragment").getItems()[0].setEnabled(true);
            }
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
                    "active": bIsNew,
                    "aedat": null,
                    "aenam": null,
                    "aezet": null,
                    "datfr": null,
                    "datto": '9999-12-31',
                    "driver1": null,
                    "driverDescr": null,
                    "erdat": null,
                    "ernam": null,
                    "erzet": null,
                    "locked": false,
                    "lockedAt": null,
                    "lockedBy": null,
                    "loevm": false,
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
                bReadOnly = false;

            try {
                sap.ui.core.BusyIndicator.show();

                // Execute the request
                var oData = await this.executeRequest(sUrl, 'GET');

                oData.active = oData.active === 'X';
                oData.loevm = oData.loevm === 'X';
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
                    detail.inactive = detail.inactive === 'X';

                    return detail;
                });
                let aKunwe = oData.details.filter(a => a.isKunwe);
                let aKunnr = oData.details.filter(a => a.isKunnr);
                // Sort by ascendent sequ
                aKunwe.sort((a, b) => {
                    if (a.sequ > b.sequ ) {
                        return 1;
                    } else if (a.sequ < b.sequ) {
                        return -1;
                    }
                    return 0;
                });
                // Sort by active agent: active agent must be first one, inactive agents will be sorted by their datbi date
                aKunnr.sort((a, b) => {
                    if (!a.inactive && b.inactive) {
                        return -1;
                    }  else if (a.inactive && !b.inactive) {
                        return 1;
                    } else {
                        if (a.datbi > b.datbi) {
                            return -1;
                        } else if (a.datbi < b.datbi) {
                            return 1;
                        }
                    }
                    return 0; 
                });

                oData.details = aKunnr.concat(aKunwe);

                oDetailModel.setProperty("/detail", oData);
                if (oData.loevm) {
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
            return oData;
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
        onWerksVH: function (oEvent) {
            this.oInputWerksDetail = oEvent.getSource();
            var oDetailModel = this.getView().getModel("detailModel"),
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
        onVkorgVH: function (oEvent) {
            this.oInputVkorgDetail = oEvent.getSource();
            var oDetailModel = this.getView().getModel("detailModel"),
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
        onVtwegVH: function (oEvent) {
            this.oInputVtwegDetail = oEvent.getSource();
            var oDetailModel = this.getView().getModel("detailModel"),
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
        onSpartVH: function (oEvent) {
            this.oInputSpartDetail = oEvent.getSource();
            var oDetailModel = this.getView().getModel("detailModel"),
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
        onDriverVH: function (oEvent) {
            this.oInputDriverDetail = oEvent.getSource();
            var oDetailModel = this.getView().getModel("detailModel"),
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
        onKunnrVH: function (oEvent) {
            this.oInputKunnr = oEvent.getSource();
            var oDetailModel = this.getView().getModel("detailModel"),
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
                sKunnrPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/kunnr",
                sKunnrAddressPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/kunnrAddress",
                sKunnrCompanyNamePath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/kunnrCompanyName",
                sIsNewPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/isNew",
                oDetailModel = this.getView().getModel("detailModel");
            oDetailModel.setProperty(sKunnrPath, sCustomerValue);
            oDetailModel.setProperty(sKunnrAddressPath, sAddressValue);
            oDetailModel.setProperty(sKunnrCompanyNamePath, sCustomerNameValue);

            // If is an update then store date and time of last modify
            if (!oDetailModel.getProperty(sIsNewPath)) {
                let sAedatPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/aedat",
                    sAezetPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/aezet",
                    sAenamPath = this.oInputKunnr.getBindingContext("detailModel").getPath() + "/aenam";
                oDetailModel.setProperty(sAedatPath, this._getCurrentDate());
                oDetailModel.setProperty(sAezetPath, this._getCurrentTime());
                oDetailModel.setProperty(sAenamPath, sLogonName);
            }
        },

        // Kunwe value help
        onKunweVH: function (oEvent) {
            this.oInputKunwe = oEvent.getSource();
            var oDetailModel = this.getView().getModel("detailModel"),
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
                sKunwePath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/kunwe",
                sKunweAddressPath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/kunweAddress",
                sKunweCompanyNamePath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/kunweCompanyName",
                sDtfinePath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/dtfine",
                sIsNewPath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/isNew",
                oDetailModel = this.getView().getModel("detailModel");
            oDetailModel.setProperty(sKunwePath, sCustomerValue);
            oDetailModel.setProperty(sKunweAddressPath, sAddressValue);
            oDetailModel.setProperty(sKunweCompanyNamePath, sCustomerNameValue);
            oDetailModel.setProperty(sDtfinePath, sDataCessazione);

            // If is an update then store date and time of last modify
            if (!oDetailModel.getProperty(sIsNewPath)) {
                let sAedatPath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/aedat",
                    sAezetPath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/aezet",
                    sAenamPath = this.oInputKunwe.getBindingContext("detailModel").getPath() + "/aenam";
                oDetailModel.setProperty(sAedatPath, this._getCurrentDate());
                oDetailModel.setProperty(sAezetPath, this._getCurrentTime());
                oDetailModel.setProperty(sAenamPath, sLogonName);
            }
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
                                that._updateDescriptions();
                            }
                        }
                    });
                }
            }.bind(this));
        },

        _updateDescriptions: async function () {
            var that = this,
                sUrl = baseManifestUrl + "/girovisiteService/lock",
                body = {
                    vpid: this._vpid.toString()
                },
                oDetailModel = this.getView().getModel("detailModel"),
                oDetail = null,
                aKunnr = [],
                aKunwe = [];

            sap.ui.core.BusyIndicator.show();
            
            try {
                // Execute the request
                await this.executeRequest(sUrl, 'POST', JSON.stringify(body));
                this.getView().getModel("detailModel").setProperty("/editMode", true);
                MessageToast.show(oBundle.getText("documentLocked"));
            } catch (error) {
                MessageBox.error(oBundle.getText("unableToLockDocument"), {
                    title: "Error",
                    details: error
                });
            } finally {
                oDetail = await that._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${that._vpid}',vctext='${that._vctext}',werks='${that._werks}',vkorg='${that._vkorg}',vtweg='${that._vtweg}',spart='${that._spart}')?$expand=details`);
            }

            try {
                let sKunnrUrl = baseManifestUrl + '/girovisiteService/getKunnr()',
                    oKunnrResult = await this.executeRequest(sKunnrUrl, 'GET');
                aKunnr = oKunnrResult.value[0].result;
                oDetail.details.forEach(detail => {
                    if (detail.isKunnr) {
                        const oFoundKunnr = aKunnr.find((oKunnr) => oKunnr.Customer === detail.kunnr);
                        if (oFoundKunnr) {
                            detail.kunnrAddress = oFoundKunnr.StreetName + " " + oFoundKunnr.CityName + " " + oFoundKunnr.Region + " " + oFoundKunnr.PostalCode;
                            detail.kunnrCompanyName = oFoundKunnr.CustomerName;
                        }
                    }
                });
                oDetailModel.setProperty("/detail", oDetail);
            } catch (error) {
                console.error(error);
            }


            try {
                let sKunweUrl = baseManifestUrl + '/girovisiteService/getKunwe()',
                    oKunweResult = await this.executeRequest(sKunweUrl, 'GET');
                aKunwe = oKunweResult.value[0].result;
                oDetail.details.forEach(detail => {
                    if (detail.isKunwe) {
                        const oFoundKunwe = aKunwe.find((oKunwe) => oKunwe.Customer === detail.kunwe);
                        if (oFoundKunwe) {
                            detail.kunweAddress = oFoundKunwe.StreetName + " " + oFoundKunwe.CityName + " " + oFoundKunwe.Region + " " + oFoundKunwe.PostalCode;
                            detail.kunweCompanyName = oFoundKunwe.CustomerName;
                        }
                    }
                });
                oDetailModel.setProperty("/detail", oDetail);
            } catch (error) {
                console.error(error);
            }
            await this._updateAfterEditPressed();
            sap.ui.core.BusyIndicator.hide();
        },
        
        _updateAfterEditPressed: async function () {
            var oDetail = this.getView().getModel("detailModel").getProperty("/detail");

            var oRecoveryDetail = JSON.parse(JSON.stringify(oDetail));
            oDetail = this._convertBoolToString(oDetail);

            oDetail.details = oDetail.details.map(detail => {
                delete detail.isKunnr;
                delete detail.isKunwe;
                delete detail.isNew;
                return detail;
            });

            const sUrl = baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`;

            try {
                const oResult = await this.executeRequest(sUrl, 'PUT', JSON.stringify(oDetail));
                oDetail = this._convertStringToBool(oDetail);
                await this._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`);
            } catch (error) {
                console.error(error);
                this.getView().getModel("detailModel").setProperty("/detail", oRecoveryDetail);
            }
        },

        _unlockDocument: async function () {
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

        onSelectionDetailChange: function () {
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
                sDatfr = oDetailModel.getProperty("/detail/datfr"),
                sDatto = oDetailModel.getProperty("/detail/datto"),
                aCopyRows = (JSON.parse(JSON.stringify(aRows))),
                bCreateMode = oDetailModel.getProperty("/isNew");

                aCopyRows.sort((a, b) => a.vppos - b.vppos);
            var nVppos = aCopyRows.length > 0 ? aCopyRows[aCopyRows.length - 1].vppos + 1 : 1;

            // All previous agent must be inactive if a new agent is adding
            if (bIsKunnr) {
                aRows.forEach(oRow => {
                    if (oRow.isKunnr) {
                        oRow.inactive = true;
                    }
                });
            }

            let oNewInsert = {
                "isNew": true,
                "isKunnr": bIsKunnr,
                "isKunwe": bIsKunwe,
                "aedat": null,
                "aenam": null,
                "aezet": null,
                "datab": null,
                "datbi": null,
                "driver1": null,
                "dtabwe": bIsKunwe ? sDatfr : null,
                "dtbiwe": bIsKunwe ? sDatto : null,
                "dtfine": null,
                "erdat": this._getCurrentDate(),
                "ernam": sLogonName,
                "erzet": this._getCurrentTime(),
                "inactive": bIsKunnr ? false : null,
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
            };

            if (bIsKunnr) {
                // If agent, add to first position
                aRows.unshift(oNewInsert)
            } else {
                aRows.push(oNewInsert);
            }
            oDetailModel.setProperty("/detail/details", aRows);

            // In create mode only one agent must be present, for this reason addKunnr button is disabled
            if (bCreateMode && bIsKunnr) {
                this.getView().byId("idAddRowMenuFragment").getItems()[0].setEnabled(false);
            }
        },

        /**
         * Deletes the selected rows from the model.
         * Determines the difference between currently bound data and selected rows,
         * then updates the model to reflect the remaining (non-deleted) rows.
         */
        _onDeleteSelectedRows: function () {
            var oDetailModel = this.getView().getModel("detailModel"),
                oTable = this.getView().byId("idDetailTable"),
                aSelectedIndices = oTable.getSelectedIndices(),
                selectedContexts = aSelectedIndices.map(iIndex => oTable.getContextByIndex(iIndex)),
                oBinding = oTable.getBinding("rows"),
                aBindingContext = oBinding.getContexts(0, oBinding.getLength()),
                bCreateMode = oDetailModel.getProperty("/isNew"),
                bRemovedRowsContainsKunnr = selectedContexts.map(context => oDetailModel.getProperty(context.getPath()+"/isKunnr")).includes(true);

            let a = new Set(aBindingContext);
            let b = new Set(selectedContexts);
            let diff = new Set([...a].filter(x => !b.has(x)));

            var aDiff = [...diff];

            var values = aDiff.map((ctx, index) => {
                return ctx.getObject();
            });

            values = this._activeLastInsertedAgent(values);
            oDetailModel.setProperty("/detail/details", values);

            if (bCreateMode && bRemovedRowsContainsKunnr) {
                this.getView().byId("idAddRowMenuFragment").getItems()[0].setEnabled(true);
            }
        },

        /**
         * If active agent has been removed, active the one with grater vppos
         */
        _activeLastInsertedAgent: function (aDetails) {
            let nKunnrIndex = null;
            let nMaxKunnrVppos = 0;
            // Find last inserted agent
            for (let i = 0 ; i < aDetails.length; i++) {
                if (aDetails[i].isKunnr) {
                    if (nMaxKunnrVppos < aDetails[i].vppos) {
                        nMaxKunnrVppos = aDetails[i].vppos;
                        nKunnrIndex = i;
                    }
                }
            }
            // Active last agent
            if (nKunnrIndex !== null) {
                aDetails[nKunnrIndex].inactive = false;
            }
            return aDetails;
        },

        /**
         * Main function to handle deletion of selected rows.
         * Calls the cache handler, deletion logic, and updates selection details.
         */
        onDeleteSelectedRows: function () {
            var that = this;
            MessageBox.warning(oBundle.getText("AlertDeleteRows"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.NO,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._onDeleteSelectedRows();
                        that.onSelectionDetailChange();
                    }
                }
            });
        },


        _getCurrentDate: function () {
            var dDate = new Date(),
                aLocaleDate = dDate.toLocaleDateString('it-IT').split("/"),
                sYear = aLocaleDate[2],
                sMonth = aLocaleDate[1].padStart(2, '0'),
                sDay = aLocaleDate[0].padStart(2, '0'),
                sDate = sYear + "-" + sMonth + "-" + sDay;
            return sDate
        },

        _getCurrentTime: function () {
            var dDate = new Date(),
                sTime = dDate.toLocaleTimeString('it-IT');
            return sTime
        },

        onLiveChangeVcText: function (oEvent) {
            var sValue = oEvent.getSource().getValue(),
                bTextContainsInvalidChar = false,
                aInvalidCharacters = ["/","\\"];
            aInvalidCharacters.forEach(sChar => {
                if (sValue.includes(sChar) ) {
                    bTextContainsInvalidChar = true;
                    sValue = sValue.replaceAll(sChar, " ");
                }
            })
            if (bTextContainsInvalidChar) {
                MessageToast.show(oBundle.getText("invalidCharacter"));
                oEvent.getSource().setValue(sValue);
            }
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

            var oView = this.getView();
            var oModel = oView.getModel("detailModel");
            var sPath = oEvent.getSource().getBindingContext("detailModel").getPath();
            var bIsNew = oModel.getProperty(sPath+"/isNew");

            // If is an update then store date and time of last modify
            if (!bIsNew) {
                oModel.setProperty(sPath+"/aedat", this._getCurrentDate());
                oModel.setProperty(sPath+"/aezet", this._getCurrentTime());
            }
        },

        onChangeDatto: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/datto");

            var oView = this.getView();
            var sPath = oEvent.getSource().getBindingContext("detailModel").getPath();
            var bIsNew = oView.getModel("detailModel").getProperty(sPath+"/isNew");

            // If is an update then store date and time of last modify
            if (!bIsNew) {
                oView.getModel("detailModel").setProperty(sPath+"/aedat", this._getCurrentDate());
                oView.getModel("detailModel").setProperty(sPath+"/aezet", this._getCurrentTime());
            }

            let oDetailModel = this.getView().getModel("detailModel").getProperty("/detail"),
                sDatto = oDetailModel.datto;

            oDetailModel.details.forEach(detail => {
                if (detail.isKunnr) {
                    if (detail.datbi && sDatto < detail.datbi) {
                        detail.datbi = sDatto;
                    }
                } else {
                    if (detail.dtbiwe && sDatto < detail.dtbiwe) {
                        detail.dtbiwe = sDatto;
                    }
                }
            });
            this.getView().getModel("detailModel").setProperty("/detail", oDetailModel);
        },

        onSelectActive: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/active");
        },

        onSelectLoevm: function (oEvent) {
            var that = this;
            MessageBox.warning(oBundle.getText("AlertLoevm"), {
                title: oBundle.getText("TitleAlertLoevm"),
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.NO,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._onChangeEventHandler(oEvent, "/loevm");
                    } else {
                        oEvent.getSource().setSelected(false);
                    }
                }
            });
        },

        onChangeKunnr: function (oEvent) {
            var sDetailPath = oEvent.getSource().getBindingContext("detailModel").getPath() + "/kunnr"
            sCustomerValue = oEvent.getSource().getValue();
            this.getView().getModel("detailModel").setProperty(sDetailPath, sCustomerValue);
        },

        _validityRangeDefined: function () {
            return this.getView().getModel("detailModel").getProperty("/detail/datfr") && this.getView().getModel("detailModel").getProperty("/detail/datto");
        },

        onChangeDatab: function (oEvent) {
            var bRandgeIsDefined = this._validityRangeDefined();

            if (bRandgeIsDefined) {
                this._onChangeEventHandler(oEvent, "/datab");

                // Check if datbi is still valid
                var oView = this.getView();
                var oModel = oView.getModel("detailModel");
                var sPath = oEvent.getSource().getBindingContext("detailModel").getPath();
                var sDatab = oModel.getProperty(sPath+"/datab");
                var sDatbi = oModel.getProperty(sPath+"/datbi");
                var bIsNew = oModel.getProperty(sPath+"/isNew");
        
                if (sDatbi && sDatab && sDatbi < sDatab) {
                    oModel.setProperty(sPath+"/datbi", sDatab); // set it to the new min value
                }

                // If is an update then store date and time of last modify
                if (!bIsNew) {
                    oModel.setProperty(sPath+"/aedat", this._getCurrentDate());
                    oModel.setProperty(sPath+"/aezet", this._getCurrentTime());
                }
            } else {
                oEvent.getSource().setValue(null);
                MessageBox.error(oBundle.getText("noRangeDefined"));
            }
        },

        onChangeDatbi: function (oEvent) {
            var bRandgeIsDefined = this._validityRangeDefined();

            if (bRandgeIsDefined) {
                this._onChangeEventHandler(oEvent, "/datbi");

                var oView = this.getView();
                var oModel = oView.getModel("detailModel");
                var sPath = oEvent.getSource().getBindingContext("detailModel").getPath();
                var bIsNew = oModel.getProperty(sPath+"/isNew");

                // If is an update then store date and time of last modify
                if (!bIsNew) {
                    oModel.setProperty(sPath+"/aedat", this._getCurrentDate());
                    oModel.setProperty(sPath+"/aezet", this._getCurrentTime());
                }
            } else {
                oEvent.getSource().setValue(null);
                MessageBox.error(oBundle.getText("noRangeDefined"));
            }
        },

        onSelectInactive: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/inactive");
        },

        onChangeKunwe: function (oEvent) {
            var sDetailPath = oEvent.getSource().getBindingContext("detailModel").getPath() + "/kunwe"
            sCustomerValue = oEvent.getSource().getValue();
            this.getView().getModel("detailModel").setProperty(sDetailPath, sCustomerValue);
        },

        onChangeDtabwe: function (oEvent) {
            var bRandgeIsDefined = this._validityRangeDefined();

            if (bRandgeIsDefined) {
                this._onChangeEventHandler(oEvent, "/dtabwe");
            } else {
                oEvent.getSource().setValue(null);
                MessageBox.error(oBundle.getText("noRangeDefined"));
            }
        },

        onChangeDtbiwe: function (oEvent) {
            var bRandgeIsDefined = this._validityRangeDefined();

            if (bRandgeIsDefined) {
                this._onChangeEventHandler(oEvent, "/dtbiwe");
            } else {
                oEvent.getSource().setValue(null);
                MessageBox.error(oBundle.getText("noRangeDefined"));
            }
        },

        onChangeTurno: function (oEvent) {
            this._onChangeEventHandler(oEvent, "/turno");
            this._changeDaysValueOnChangingTurno(oEvent);

            var oView = this.getView();
            var oModel = oView.getModel("detailModel");
            var sPath = oEvent.getSource().getBindingContext("detailModel").getPath();
            var bIsNew = oModel.getProperty(sPath+"/isNew");

            // If is an update then store date and time of last modify
            if (!bIsNew) {
                oModel.setProperty(sPath+"/aedat", this._getCurrentDate());
                oModel.setProperty(sPath+"/aezet", this._getCurrentTime());
                oModel.setProperty(sPath+"/aenam", sLogonName);
            }
        },

        _changeDaysValueOnChangingTurno: function (oEvent) {
            var oControl = oEvent.getSource(),
                oTable = this.getView().byId("idDetailTable"),
                oRow = oControl.getParent(),
                nRowIndex = parseInt(oRow.getBindingContext("detailModel").getPath().split("/")[3]),
                sCurrentPath = oControl.getBindingContext("detailModel").getPath(),
                sKunweIndex = String(this._getKunweIndex(nRowIndex)).padStart(3,'0'),
                sPathSequ = sCurrentPath + "/sequ",
                sTurnoKey = this.getControlValue(oControl);
            
            this.getView().getModel("detailModel").setProperty(sPathSequ, sKunweIndex);
            this._setDaysValues(oControl, sTurnoKey, sKunweIndex);
        },

        _getKunweIndex : function (nRowIndex) {
            var nKunweIndex = 0,
                aDetails = this.getView().getModel("detailModel").getProperty("/detail/details"),
                aSortedDetails = JSON.parse(JSON.stringify(aDetails)).sort((a, b) => a.vppos - b.vppos);
            for(let i = 0; i <= nRowIndex; i++) {
                if (aDetails[i].isKunwe) {
                    nKunweIndex++;
                }
            }
            return nKunweIndex;
        },

        _setDaysValues: function (oControl, sTurnoKey, sSequ) {
            var sCurrentPath = oControl.getBindingContext("detailModel").getPath(),
                sPathMonday = sCurrentPath + "/monday",
                sPathTuesday = sCurrentPath + "/tuesday",
                sPathWednesday = sCurrentPath + "/wednesday",
                sPathThursday = sCurrentPath + "/thursday",
                sPathFriday = sCurrentPath + "/friday",
                sPathSaturday = sCurrentPath + "/saturday",
                sPathSunday = sCurrentPath + "/sunday";

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

            var oView = this.getView();
            var oModel = oView.getModel("detailModel");
            var sPath = oEvent.getSource().getBindingContext("detailModel").getPath();
            var bIsNew = oModel.getProperty(sPath+"/isNew");

            // If is an update then store date and time of last modify
            if (!bIsNew) {
                oModel.setProperty(sPath+"/aedat", this._getCurrentDate());
                oModel.setProperty(sPath+"/aezet", this._getCurrentTime());
                oModel.setProperty(sPath+"/aenam", sLogonName);
            }
        },

        _changeDaysValueOnChangingSequ: function (oEvent) {
            var oControl = oEvent.getSource(),
                sPathTurno = oControl.getBindingContext("detailModel").getPath() + "/turno",
                sSequ = this.getControlValue(oControl),
                sTurnoKey = this.getView().getModel("detailModel").getProperty(sPathTurno);
            
            this._setDaysValues(oControl, sTurnoKey, sSequ);
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

        _padSequAndDayValue: function (oEvent) {
            var sValue = oEvent.getSource().getValue();
            oEvent.getSource().setValue(sValue.padStart(3, '0'));
        },

        getLockStatus: async function () {
            var sUrl = baseManifestUrl + "/girovisiteService/getLockStatus()?vpid='" + this._vpid + "'";
            return await this.executeRequest(sUrl, 'GET');
        },

        onCreatePress: function () {
            var that = this;
            MessageBox.information(oBundle.getText("createAlert"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._confirmCreate();
                    }
                }
            });
        },

        _confirmCreate: async function () {
            var sDate = this._getCurrentDate(),
                sTime = this._getCurrentTime(),
                oDetail = this.getView().getModel("detailModel").getProperty("/detail"),
                bIsValid = true;

            bIsValid = await this._checkDataBeforeUpdateOrCreate(oDetail);
            if (bIsValid) {
                this._setDatbiIfLoevm(oDetail);
                oDetail = this._convertBoolToString(oDetail);

                oDetail.ernam = sLogonName;
                oDetail.aenam = sLogonName;
                oDetail.aedat = sDate;
                oDetail.aezet = sTime;
                oDetail.erdat = sDate;
                oDetail.erzet = sTime;
                oDetail.details = oDetail.details.map(detail => {
                    detail.ernam = sLogonName;
                    delete detail.isKunnr;
                    delete detail.isKunwe;
                    delete detail.isNew;
                    return detail;
                });

                const sUrl = baseManifestUrl + `/girovisiteService/Header`;

                try {
                    const oResult = await this.executeRequest(sUrl, 'POST', JSON.stringify(oDetail));

                    var that = this;
                    MessageBox.success(oBundle.getText("creationSucceded"), {
                        onClose: function () {
                            that.getOwnerComponent().getRouter().navTo("detail", { vpid: oResult.vpid, vctext: oResult.vctext, werks: oResult.werks, vkorg: oResult.vkorg, vtweg: oResult.vtweg, spart: oResult.spart });
                        }
                    });
                } catch (error) {
                    MessageBox.error(oBundle.getText("ErrorUpdateOrCreate"));
                }
            }
        },

        onUpdatePress: function () {
            var that = this;
            MessageBox.information(oBundle.getText("updateAlert"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function () {
                    that._confirmUpdate();
                }
            });
        },

        _confirmUpdate: async function () {
            var sDate = this._getCurrentDate(),
                sTime = this._getCurrentTime(),
                oDetail = this.getView().getModel("detailModel").getProperty("/detail"),
                bIsValid = true;

            bIsValid = await this._checkDataBeforeUpdateOrCreate(oDetail);
            if (bIsValid) {
                var oRecoveryDetail = JSON.parse(JSON.stringify(oDetail));
                this._setDatbiIfLoevm(oDetail);
                oDetail = this._convertBoolToString(oDetail);

                oDetail.aenam = sLogonName;
                oDetail.aedat = sDate;
                oDetail.aezet = sTime;
                oDetail.details = oDetail.details.map(detail => {
                    if ( detail.aedat === sDate ) {
                        detail.aenam = sLogonName;
                    }
                    delete detail.isKunnr;
                    delete detail.isKunwe;
                    delete detail.isNew;
                    return detail;
                });

                const sUrl = baseManifestUrl + `/girovisiteService/Header(vpid='${this._vpid}',vctext='${this._vctext}',werks='${this._werks}',vkorg='${this._vkorg}',vtweg='${this._vtweg}',spart='${this._spart}')?$expand=details`;

                try {
                    const oResult = await this.executeRequest(sUrl, 'PUT', JSON.stringify(oDetail));
                    oDetail = this._convertStringToBool(oDetail);
                    var that = this;
                    MessageBox.success(oBundle.getText("updateSucceded"), {
                        onClose: function () {
                            that._fetchData(baseManifestUrl + `/girovisiteService/Header(vpid='${that._vpid}',vctext='${that._vctext}',werks='${that._werks}',vkorg='${that._vkorg}',vtweg='${that._vtweg}',spart='${that._spart}')?$expand=details`).then(that._unlockDocument());
                        }
                    });
                } catch (error) {
                    this.getView().getModel("detailModel").setProperty("/detail", oRecoveryDetail);
                    MessageBox.error(oBundle.getText("ErrorUpdateOrCreate"));
                }
            }

        },

        _checkDataBeforeUpdateOrCreate: async function () {
            var aErrorMessage = [],
                sErrorMessage = '',
                oDetail = this.getView().getModel("detailModel").getProperty("/detail"),
                bIsValid = true;
            if (!oDetail.loevm) {
                aErrorMessage = aErrorMessage.concat(this._checkRequiredInfo(oDetail));
                aErrorMessage = aErrorMessage.concat(await this._checkActiveAgent(oDetail));
                aErrorMessage = aErrorMessage.concat(await this._checkDriver(oDetail));
                aErrorMessage = aErrorMessage.concat(this._checkAgentsTemporalContinuity(oDetail));
                aErrorMessage = aErrorMessage.concat(this._checkKunwePresent(oDetail));
                aErrorMessage = aErrorMessage.concat(this._checkKunweDuplicates(oDetail));

                sErrorMessage = [...new Set(aErrorMessage)].join(" ");

                if (sErrorMessage !== '') {
                    bIsValid = false;
                    MessageBox.error(oBundle.getText("ErrorUpdateOrCreate"), {
                        title: "Error",
                        details: sErrorMessage
                    });
                }
            }
            return bIsValid;
        },

        /**
         * Check if all required fields are set considering also the kunnr/kunwe row type
         * @param {*} oDetail 
         * @returns {string} - error message if some required field is not set, empty string otherwise
         */
        _checkRequiredInfo: function (oDetail) {
            var aErrorMessage = [];

            function checkDataFilled(sValue, sLabel) {
                if (!sValue || sValue.trim() === '') {
                    aErrorMessage.push(oBundle.getText("missingData", [oBundle.getText(sLabel)]) + "\n");
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
                }
            });

            return aErrorMessage;
        },

        /**
         * Check if current agent is active for another plan in the same range
         * @param {*} oDetail 
         * @returns {string} - if the agent is active or no agent has been selected it returns a string containing an error message, empty string otherwise
         */
        _checkActiveAgent: async function (oDetail) {
            var allActiveAgent = oDetail.details.filter(detail => detail.isKunnr && !detail.inactive);
            var aErrorMessage = [],
                bIsNew = this.getView().getModel("detailModel").getProperty("/isNew"),
                bIsActive = this.getView().getModel("detailModel").getProperty("/detail/active");
            // If there is at least one agent
            if (allActiveAgent.length > 0) {
                var sKunnr = allActiveAgent[0].kunnr, // agent code
                    sDatab = allActiveAgent[0].datab, // agent starting validity date
                    sDatbi = allActiveAgent[0].datbi, // agent starting validity date
                    sVpid = allActiveAgent[0].vpid, // current vpid
                    sUrl = null;
                    if (!sVpid) {
                        sUrl = baseManifestUrl + `/girovisiteService/Header?$filter=loevm eq null or loevm eq ''&$select=vpid&$expand=details($filter=kunnr eq '${sKunnr}' and (inactive eq null or inactive eq '') and (datab le '${sDatbi}' and datbi ge '${sDatab}');$select=vpid,kunnr,inactive,datab,datbi)`;
                    } else {
                        sUrl = baseManifestUrl + `/girovisiteService/Header?$filter=loevm eq null or loevm eq ''&$select=vpid&$expand=details($filter=kunnr eq '${sKunnr}' and (inactive eq null or inactive eq '') and vpid ne '${sVpid}' and (datab le '${sDatbi}' and datbi ge '${sDatab}');$select=vpid,kunnr,inactive,datab,datbi)`;
                    }
                    

                try {

                    // Execute the request
                    var oResult = await this.executeRequest(sUrl, 'GET'),
                        aDetails = [];

                    if (oResult) {
                        // Merge all details from result
                        oResult.value.forEach(oItem => {
                            aDetails = aDetails.concat(oItem.details);
                        });
                    }

                    if (aDetails.length !== 0) {
                        aErrorMessage.push(oBundle.getText("agentAlreadyActive", [aDetails[0].vpid]) + "\n");
                    }

                } catch (error) {
                    MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"), {
                        title: "Error",
                        details: error
                    });
                    aErrorMessage.push(oBundle.getText("ErrorCheckingActiveAgent") + "\n");
                }
                
            } else {
                if (bIsNew || bIsActive) {
                    aErrorMessage.push(oBundle.getText("noAgentForCurrentPlan") + "\n");
                }
            }

            return aErrorMessage;
        },

        /**
         * Check if current VAN is in another plan in the same range
         * @param {*} oDetail 
         * @returns {string} - if the VAN is in another plan it returns a string containing an error message, empty string otherwise
         */
        _checkDriver: async function (oDetail) {
            var sDriver = oDetail.driver1,
                sVpid = oDetail.vpid,
                sDatfr = oDetail.datfr,
                sDatto = oDetail.datto,
                sUrl = null,
                aErrorMessage = [];

            if (!sVpid) {
                sUrl = baseManifestUrl + `/girovisiteService/Header?$filter=(loevm eq null or loevm eq '') and (datfr le '${sDatto}' and datto ge '${sDatfr}') and driver1 eq '${sDriver}'&$select=vpid,datfr,datto`;
            } else {
                sUrl = baseManifestUrl + `/girovisiteService/Header?$filter=(loevm eq null or loevm eq '') and vpid ne '${sVpid}' and (datfr le '${sDatto}' and datto ge '${sDatfr}') and driver1 eq '${sDriver}'&$select=vpid,datfr,datto`;
            }
                
            try {

                // Execute the request
                var oResult = await this.executeRequest(sUrl, 'GET');

                if (oResult.value.length !== 0) {
                    aErrorMessage.push(oBundle.getText("vanAlreadyPresent", [oResult.value[0].vpid]) + "\n");
                }

            } catch (error) {
                MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"), {
                    title: "Error",
                    details: error
                });
                aErrorMessage.push(oBundle.getText("ErrorCheckingDriver") + "\n");
            }

            return aErrorMessage;
        },

        /**
         * Check if agents have a temporal range with continuity and without overlaps
         * @param {*} oDetail 
         * @returns {string} - error message if some agent has no continuity or overlaps, empty string otherwise
         */
        _checkAgentsTemporalContinuity: function (oDetail) {
            var aAgents = oDetail.details.filter(detail => detail.isKunnr),
                aErrorMessage = [];
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
                        aErrorMessage.push(oBundle.getText("errorGapDetected", [aAgents[i - 1].kunnr, aAgents[i].kunnr]) + "\n");
                    }

                    // Check for overlaps
                    if (currStart <= prevEnd) {
                        aErrorMessage.push(oBundle.getText("errorOverlapDetected", [aAgents[i - 1].kunnr, aAgents[i].kunnr]) + "\n");
                    }
                }
            }
            return aErrorMessage;
        },

        /**
         * Check if at least one kunwe is present
         * @param {*} oDetail 
         * @returns {string} - error message if no kunwe is present for current plan, empty string otherwise
         */
        _checkKunwePresent: function (oDetail) {
            var aErrorMessage = [],
                bAtLeastOneKunweIsPresent = false;
            oDetail.details.forEach(oDetail => {
                if (oDetail.kunwe) {
                    bAtLeastOneKunweIsPresent = true;
                }
            });

            if (!bAtLeastOneKunweIsPresent) {
                aErrorMessage.push(oBundle.getText("noKunweForCurrentPlan") + "\n");
            }
            return aErrorMessage;
        },

        /**
         * Check if there are duplicate kunwe values
         * @param {*} oDetail 
         * @returns {string[]} - error message if duplicate kunwe values are found, empty array otherwise
         */
        _checkKunweDuplicates: function (oDetail) {
            var aErrorMessage = [],
                oSeenKunwe = new Set(),
                oDuplicateKunwe = new Set();

            oDetail.details.forEach(oItem => {
                if (oItem.kunwe) {
                    if (oSeenKunwe.has(oItem.kunwe)) {
                        oDuplicateKunwe.add(oItem.kunwe);
                    } else {
                        oSeenKunwe.add(oItem.kunwe);
                    }
                }
            });

            if (oDuplicateKunwe.size > 0) {
                var sDuplicates = Array.from(oDuplicateKunwe).join(", ");
                aErrorMessage.push(oBundle.getText("duplicateKunweFound", sDuplicates) + "\n");
            }

            return aErrorMessage;
        },

        /**
         * Set datbi value with current date if loevm is flagged
         * @param {*} oDetail 
         */
        _setDatbiIfLoevm: function (oDetail) {
            if (oDetail.loevm) {
                var sCurrentDate = this._getCurrentDate();
                oDetail.details.forEach(detail => {
                    detail.datbi = sCurrentDate;
                })
                this.getView().getModel("detailModel").setProperty("/detail", oDetail);
            }
        },

        _convertBoolToString: function (oDetail) {
            oDetail.active = oDetail.active ? 'X' : '';
            oDetail.loevm = oDetail.loevm ? 'X' : '';
            oDetail.details.forEach(detail => {
                detail.inactive = detail.inactive ? 'X' : '';
            });
            return oDetail;
        },

        _convertStringToBool: function (oDetail) {
            oDetail.active = oDetail.active === 'X' ? true : false;
            oDetail.loevm = oDetail.loevm === 'X' ? true : false;
            oDetail.details.forEach(detail => {
                detail.inactive = detail.inactive === 'X' ? true : false;
            });
            return oDetail;
        }
    });
});