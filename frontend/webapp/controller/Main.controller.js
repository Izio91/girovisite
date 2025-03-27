sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    'sap/m/p13n/Engine',
    'sap/m/p13n/SelectionController',
    'sap/m/p13n/SortController',
    'sap/m/p13n/GroupController',
    'sap/m/p13n/FilterController',
    'sap/m/p13n/MetadataHelper',
    'sap/ui/model/Sorter',
    'sap/m/ColumnListItem',
    'sap/m/Button',
    'sap/m/Text',
    'sap/m/ObjectIdentifier',
    'sap/ui/core/library',
    'sap/m/table/ColumnWidthController',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "frontend/utils/formatter"
], (BaseController, JSONModel, MessageBox, Fragment, Engine, SelectionController, SortController, GroupController, FilterController, MetadataHelper, Sorter, ColumnListItem, Button, Text, ObjectIdentifier, coreLibrary, ColumnWidthController, Filter, FilterOperator, formatter) => {
    "use strict";

    var baseManifestUrl;
    var oBundle;
    var aCSVHeaderIndexes;
    return BaseController.extend("frontend.controller.Main", {
        formatter: formatter,
        onInit() {
            baseManifestUrl = jQuery.sap.getModulePath(this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id);
            // read msg from i18n model
            oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            aCSVHeaderIndexes = {
                vpid: 0,
                vctext: 1,
                SortField: 2,
                driver1: 3,
                termCode: 4,
                datfr: 5,
                datto: 6,
                kunnr: 7,
                KunnrCustomerName: 8,
                datab: 9,
                datbi: 10,
                kunwe: 11,
                KunweCustomerName: 12,
                StreetName: 13,
                PostalCode: 14,
                CityName: 15,
                dtabwe: 16,
                dtbiwe: 17,
                turno: 18,
                monday: 19,
                tuesday: 20,
                wednesday: 21,
                thursday: 22,
                friday: 23,
                saturday: 24,
                sunday: 25,
                BusinessPartnerGrouping: 26,
                vkorg: 27,
                vtweg: 28,
                spart: 29,
                dtfine: 30,
                active: 31,
                loevm: 32
            };

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("main").attachPatternMatched(this._onObjectMatched, this);
        },


        _onObjectMatched: async function () {
            this.defineModelForCurrentPage();
            // This function is responsible for applying filters and fetching data based on user input.
            await this.onGoPress();
            this._registerForP13n();
        },

        _registerForP13n: function () {
            const oTable = this.byId("mainTable");

            this.oMetadataHelper = new MetadataHelper([{
                key: "vpid_col",
                label: oBundle.getText("vpid"),
                path: "vpid"
            },
            {
                key: "vctext_col",
                label: oBundle.getText("vctext"),
                path: "vctext"
            },
            {
                key: "werks_col",
                label: oBundle.getText("werks"),
                path: "werks"
            },
            {
                key: "vkorg_col",
                label: oBundle.getText("vkorg"),
                path: "vkorg"
            },
            {
                key: "vtweg_col",
                label: oBundle.getText("vtweg"),
                path: "vtweg"
            },
            {
                key: "spart_col",
                label: oBundle.getText("spart"),
                path: "spart"
            },
            {
                key: "driver1_col",
                label: oBundle.getText("driver1"),
                path: "driver1"
            },
            {
                key: "termCode_col",
                label: oBundle.getText("termCode"),
                path: "termCode"
            },
            {
                key: "datfr_col",
                label: oBundle.getText("datfr"),
                path: "datfr"
            },
            {
                key: "datto_col",
                label: oBundle.getText("datto"),
                path: "datto"
            },
            {
                key: "kunnr_col",
                label: oBundle.getText("kunnr"),
                path: "kunnr"
            },
            {
                key: "active_col",
                label: oBundle.getText("active"),
                path: "active"
            },
            {
                key: "loevm_col",
                label: oBundle.getText("loevm"),
                path: "loevm"
            },
            {
                key: "erdat_col",
                label: oBundle.getText("erdat"),
                path: "erdat"
            },
            {
                key: "erzet_col",
                label: oBundle.getText("erzet"),
                path: "erzet"
            },
            {
                key: "ernam_col",
                label: oBundle.getText("ernam"),
                path: "ernam"
            },
            {
                key: "aedat_col",
                label: oBundle.getText("aedat"),
                path: "aedat"
            },
            {
                key: "aezet_col",
                label: oBundle.getText("aezet"),
                path: "aezet"
            },
            {
                key: "aenam_col",
                label: oBundle.getText("aenam"),
                path: "aenam"
            },
            {
                key: "kunwe_col",
                label: oBundle.getText("kunwe"),
                path: "kunwe"
            },
            {
                key: "locked_col",
                label: oBundle.getText("locked"),
                path: "locked",
                tooltip: "lockedBy"
            }
            ]);

            Engine.getInstance().register(oTable, {
                helper: this.oMetadataHelper,
                controller: {
                    Columns: new SelectionController({
                        targetAggregation: "columns",
                        control: oTable
                    }),
                    Sorter: new SortController({
                        control: oTable
                    }),
                    Groups: new GroupController({
                        control: oTable
                    }),
                    ColumnWidth: new ColumnWidthController({
                        control: oTable
                    }),
                    Filter: new FilterController({
                        control: oTable
                    })
                }
            });

            Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
        },

        openPersonalizationDialog: function (oEvt) {
            this._openPersoDialog(["Columns", "Sorter", "Groups", "Filter"], oEvt.getSource());
        },

        _openPersoDialog: function (aPanels, oSource) {
            var oTable = this.byId("mainTable");

            Engine.getInstance().show(oTable, aPanels, {
                contentHeight: aPanels.length > 1 ? "50rem" : "35rem",
                contentWidth: aPanels.length > 1 ? "45rem" : "32rem",
                source: oSource || oTable
            });
        },

        _getKey: function (oControl) {
            return oControl.data("p13nKey");
        },

        handleStateChange: async function (oEvt) {
            const oTable = this.byId("mainTable");
            const oState = oEvt.getParameter("state");

            if (!oState) {
                return;
            }

            //Update the columns per selection in the state
            this.updateColumns(oState);

            this.getView().getModel("masterModel").setProperty("/HeaderWithDetails", []);
            await this._fetchData();
            // Create groups if any
            const aGroups = this.createGroups(oState);

            const aCells = oState.Columns.map(function (oColumnState) {
                if (oColumnState.key === 'vpid_col') {
                    return new ObjectIdentifier({
                        title: "{masterModel>" + this.oMetadataHelper.getProperty(oColumnState.key).path + "}"
                    });
                }
                if (oColumnState.key === 'locked_col') {
                    return new Button({
                        press: this.onOpenUnlockMenuAction.bind(this),
                        tooltip: "{i18n>lockedBy}: {masterModel>" + this.oMetadataHelper.getProperty(oColumnState.key).tooltip + "}",
                        icon: "sap-icon://locked",
                        type: "Transparent",
                        visible: "{= ${masterModel>" + this.oMetadataHelper.getProperty(oColumnState.key).path + "} === true ? true : false }",
                    });
                }
                return new Text({
                    text: "{masterModel>" + this.oMetadataHelper.getProperty(oColumnState.key).path + "}"
                });
            }.bind(this));

            //rebind the table with the updated cell template
            oTable.bindItems({
                templateShareable: false,
                path: 'masterModel>/HeaderWithDetails',
                sorter: aGroups,
                template: new ColumnListItem({
                    cells: aCells,
                    type: "Navigation",
                    highlight: "{= ${masterModel>locked} ? 'Information' : 'None' }",
                    press: this.onListItemPress.bind(this)
                })
            });

        },

        createGroups: function (oState) {
            const aGroupings = [];
            var oKeysDescending = {};

            if (oState.Sorter) {
                oState.Sorter.forEach(({ key, descending }) => (oKeysDescending[key] = descending));
            }

            oState.Groups.forEach(function (oGroup) {
                aGroupings.push(new Sorter(this.oMetadataHelper.getProperty(oGroup.key).path, Object.keys(oKeysDescending).includes(oGroup.key) ? oKeysDescending[oGroup.key] : false, true));
            }.bind(this));

            oState.Groups.forEach((oSorter) => {
                const oCol = this.byId("mainTable").getColumns().find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
                oCol.data("grouped", true);
            });

            return aGroupings;
        },

        updateColumns: function (oState) {
            const oTable = this.byId("mainTable");

            oTable.getColumns().forEach((oColumn, iIndex) => {
                oColumn.setVisible(false);
                oColumn.setWidth(oState.ColumnWidth[this._getKey(oColumn)]);
                oColumn.setSortIndicator(coreLibrary.SortOrder.None);
                oColumn.data("grouped", false);
            });

            oState.Columns.forEach((oProp, iIndex) => {
                const oCol = oTable.getColumns().find((oColumn) => oColumn.data("p13nKey") === oProp.key);
                oCol.setVisible(true);

                oTable.removeColumn(oCol);
                oTable.insertColumn(oCol, iIndex);
            });
        },

        beforeOpenColumnMenu: function (oEvt) {
            const oMenu = this.byId("menu");
            const oColumn = oEvt.getParameter("openBy");
            const oSortItem = oMenu.getQuickActions()[0].getItems()[0];
            const oGroupItem = oMenu.getQuickActions()[1].getItems()[0];

            oSortItem.setKey(this._getKey(oColumn));
            oSortItem.setLabel(oColumn.getHeader().getText());
            oSortItem.setSortOrder(oColumn.getSortIndicator());

            oGroupItem.setKey(this._getKey(oColumn));
            oGroupItem.setLabel(oColumn.getHeader().getText());
            oGroupItem.setGrouped(oColumn.data("grouped"));
        },

        onColumnHeaderItemPress: function (oEvt) {
            const oColumnHeaderItem = oEvt.getSource();
            let sPanel = "Columns";
            if (oColumnHeaderItem.getIcon().indexOf("group") >= 0) {
                sPanel = "Groups";
            } else if (oColumnHeaderItem.getIcon().indexOf("sort") >= 0) {
                sPanel = "Sorter";
            } else if (oColumnHeaderItem.getIcon().indexOf("filter") >= 0) {
                sPanel = "Filter";
            }

            this._openPersoDialog([sPanel]);
        },

        onFilterInfoPress: function (oEvt) {
            this._openPersoDialog(["Filter"], oEvt.getSource());
        },

        onSort: function (oEvt) {
            const oSortItem = oEvt.getParameter("item");
            const oTable = this.byId("mainTable");
            const sAffectedProperty = oSortItem.getKey();
            const sSortOrder = oSortItem.getSortOrder();

            //Apply the state programatically on sorting through the column menu
            //1) Retrieve the current personalization state
            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                //2) Modify the existing personalization state --> clear all sorters before
                oState.Sorter.forEach(function (oSorter) {
                    oSorter.sorted = false;
                });

                if (sSortOrder !== coreLibrary.SortOrder.None) {
                    oState.Sorter.push({
                        key: sAffectedProperty,
                        descending: sSortOrder === coreLibrary.SortOrder.Descending
                    });
                }

                //3) Apply the modified personalization state to persist it in the VariantManagement
                Engine.getInstance().applyState(oTable, oState);
            });
        },

        onGroup: function (oEvt) {
            const oGroupItem = oEvt.getParameter("item");
            const oTable = this.byId("mainTable");
            const sAffectedProperty = oGroupItem.getKey();

            //1) Retrieve the current personalization state
            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                //2) Modify the existing personalization state --> clear all groupings before
                oState.Groups.forEach(function (oSorter) {
                    oSorter.grouped = false;
                });

                if (oGroupItem.getGrouped()) {
                    oState.Groups.push({
                        key: sAffectedProperty
                    });
                }

                //3) Apply the modified personalization state to persist it in the VariantManagement
                Engine.getInstance().applyState(oTable, oState);
            });
        },

        onColumnMove: function (oEvt) {
            const oDraggedColumn = oEvt.getParameter("draggedControl");
            const oDroppedColumn = oEvt.getParameter("droppedControl");

            if (oDraggedColumn === oDroppedColumn) {
                return;
            }

            const oTable = this.byId("mainTable");
            const sDropPosition = oEvt.getParameter("dropPosition");
            const iDraggedIndex = oTable.indexOfColumn(oDraggedColumn);
            const iDroppedIndex = oTable.indexOfColumn(oDroppedColumn);
            const iNewPos = iDroppedIndex + (sDropPosition == "Before" ? 0 : 1) + (iDraggedIndex < iDroppedIndex ? -1 : 0);
            const sKey = this._getKey(oDraggedColumn);

            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                const oCol = oState.Columns.find(function (oColumn) {
                    return oColumn.key === sKey;
                }) || {
                    key: sKey
                };
                oCol.position = iNewPos;

                Engine.getInstance().applyState(oTable, {
                    Columns: [oCol]
                });
            });
        },

        onColumnResize: function (oEvt) {
            const oColumn = oEvt.getParameter("column");
            const sWidth = oEvt.getParameter("width");
            const oTable = this.byId("mainTable");

            const oColumnState = {};
            oColumnState[this._getKey(oColumn)] = sWidth;

            Engine.getInstance().applyState(oTable, {
                ColumnWidth: oColumnState
            });
        },

        onClearFilterPress: function (oEvt) {
            const oTable = this.byId("mainTable");
            Engine.getInstance().retrieveState(oTable).then(function (oState) {
                for (var sKey in oState.Filter) {
                    oState.Filter[sKey].map((condition) => {
                        condition.filtered = false;
                    });
                }
                Engine.getInstance().applyState(oTable, oState);
            });
        },

        onListItemPress: function (oEvent) {
            var oObject = oEvent.getSource().getBindingContext("masterModel").getObject(),
                sVpid = oObject.vpid,
                sVctext = oObject.vctext,
                sWerks = oObject.werks,
                sVkorg = oObject.vkorg,
                sVtweg = oObject.vtweg,
                sSpart = oObject.spart;

            this.getOwnerComponent().getRouter().navTo("detail", { vpid: sVpid, vctext: sVctext, werks: sWerks, vkorg: sVkorg, vtweg: sVtweg, spart: sSpart });
        },

        /**
         * Define the model for the current page and attach it to the view.
         */
        defineModelForCurrentPage: function () {
            var oModel = {
                "MassiveImportFile": null,
                "HeaderWithDetails": [],
                "valuehelps": {
                    "werks": [],
                    "vkorg": [],
                    "vtweg": [],
                    "driver": [],
                    "kunnr": [],
                    "kunwe": []
                }
            };
            this.getView().setModel(new JSONModel(oModel), "masterModel");
        },

        /**
         * Triggered when the user presses the "Go" button to apply filters and fetch data.
         * Define top and skip parameters for pagination
         */
        onGoPress: function () {
            this._iSkip = 0; // Reset skip counter on new search
            this._iTop = 2 * this.getView().byId("mainTable").getGrowingThreshold();
            this.getView().getModel("masterModel").setProperty("/HeaderWithDetails", []);
            this._fetchData();
        },

        /**
         * Fetch data with current filters and pagination parameters.
         * It constructs the query parameters from the input fields and sends an AJAX request to the backend.
         */
        _fetchData: async function () {
            var oMasterModel = this.getView().getModel("masterModel"),
                that = this;

            try {
                sap.ui.core.BusyIndicator.show();

                // Wait for the query URL to be fully built
                var sUrl = await this._buildFilterQuery();

                // Execute the request
                var oData = await this.executeRequest(sUrl, 'GET');

                var aPreviousData = oMasterModel.getProperty("/HeaderWithDetails") || [],
                    aNewData = aPreviousData.concat(oData.value);
                aNewData = [...new Set(aNewData)];
                oMasterModel.setProperty("/HeaderWithDetails", aNewData);
            } catch (error) {
                MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"), {
                    title: "Error",
                    details: error
                });
            } finally {
                sap.ui.core.BusyIndicator.hide();
            }
        },

        /**
         * Constructs the filter query URL for the service request.
         * 
         * @returns {Promise<string>} A Promise that resolves to the complete URL with filters and pagination parameters.
         */
        _buildFilterQuery: async function () {
            var sUrl = baseManifestUrl + "/girovisiteService/HeaderWithDetails?",
                aParams = [];

            aParams.push("$select=vpid,vctext,werks,vkorg,vtweg,spart,driver1,termCode,datfr,datto,active,loevm,erdat,erzet,ernam,aedat,aezet,aenam,locked,lockedBy,lockedAt,kunnr,kunwe");
            // Add pagination parameters
            aParams.push("$top=" + this._iTop);
            aParams.push("$skip=" + this._iSkip);

            // Retrieve filters and sorters
            var [aFilters, aSorters] = await Promise.all([this._getFilters(), this._getSorters()]);

            if (aSorters.length === 0) {
                aSorters.push("vpid asc");
            }
            aParams.push("$orderby=" + aSorters.join(","));

            if (aFilters.length > 0) {
                aParams.push("$filter=" + aFilters.join(" and "));
            }

            return sUrl + aParams.join("&");
        },

        /**
         * Constructs a filter condition string based on the provided field, value, and date status.
         * 
         * @param {string} sField - The OData field name to filter on.
         * @param {string} sValue - The value to filter by.
         * @param {boolean} [bIsDate=false] - Indicates whether the value is a date.
         * @returns {string|null} The filter condition as a string, or null if no valid condition can be created.
         */
        _getFilterAsString: function (sField, sValue, bIsDate = false) {
            // Check if the field is one of the special cases ('active' or 'loevm') and if a valid value is provided
            if (sField === 'active' || sField === 'loevm') {
                if (sValue !== null && sValue !== 'default') {
                    return `${sField} eq '${sValue}'`;
                }
            } else {
                // For other fields, check if a valid value is provided
                if (sValue !== null && sValue !== '') {
                    // If the field is a date add appropriate operator
                    if (bIsDate) {
                        // Return the appropriate filter condition based on the field type
                        if (sField === 'datfr') {
                            return `${sField} ge '${sValue}'`;
                        } else if (sField === 'datto') {
                            return `${sField} le '${sValue}'`;
                        } else {
                            return `${sField} eq '${sValue}'`; // Equality for other fields
                        }
                    } else {
                        // For non-date fields, return an equality filter condition
                        return `${sField} eq '${sValue}'`;
                    }
                }
            }
            // Return null if no valid condition can be constructed
            return null;
        },

        /**
         * Retrieves all applied filters from the UI controls and formats them into OData filter expressions.
         * 
         * @returns {Promise<Array>} A Promise that resolves to an array of filter conditions to be used in the query.
         */
        _getFilters: function () {
            var aFilters = [],
                oView = this.getView(),
                that = this;

            /**
             * Helper function to extract values from UI controls and format them into filter conditions.
             * 
             * @param {string} sField - The OData field name.
             * @param {string} sValue - The value to filter by.
             * @param {string} bIsDate - True if the UI control is a DatePicker, false otherwise. 
             */
            function addFilter(sField, sValue, bIsDate) {
                var sFilterAsString = that._getFilterAsString(sField, sValue, bIsDate);

                if (sFilterAsString !== null) {
                    aFilters.push(sFilterAsString);
                }
            }

            [
                ["vpid", "inputVpid", false],
                ["werks", "inputWerks", false],
                ["vkorg", "inputVkorg", false],
                ["vtweg", "inputVtweg", false],
                ["driver1", "inputDriver1", false],
                ["kunnr", "inputKunnr", false],
                ["kunwe", "inputKunwe", false],
                ["datfr", "datePickerDatfr", true],
                ["datto", "datePickerDatto", true],
                ["active", "comboBoxActive", false],
                ["loevm", "comboBoxLoevm", false],
                ["spart", "inputSpart", false],
                ["termCode", "inputTermCode", false],
                ["erdat", "datePickerErdat", true],
                ["erzet", "timePickerErzet", false],
                ["ernam", "inputErnam", false],
                ["aedat", "datePickerAedat", true],
                ["aezet", "timePickerAezet", false],
                ["aenam", "inputAenam", false]
            ].forEach(([field, control, isDate]) => addFilter(field, that.getControlValue(oView.byId(control)), isDate));

            return Engine.getInstance().retrieveState(oView.byId("mainTable")).then((oState) => {
                Object.keys(oState.Filter).forEach((sFilterKey) => {
                    var sFilterPath = that.oMetadataHelper.getProperty(sFilterKey).path;
                    oState.Filter[sFilterKey].forEach(function (oCondition) {
                        var bIsDate = ["datePickerDatfr", "datePickerDatto", "datePickerErdat", "datePickerAedat"].includes(sFilterPath);
                        addFilter(sFilterPath, oCondition.values[0], bIsDate);
                    });
                });
                return aFilters;
            });
        },

        /**
         * Retrieves sorting conditions from the state engine.
         * 
         * @returns {Promise<Array>} A Promise that resolves to an array of sorting conditions.
         */
        _getSorters: function () {
            var that = this;
            return Engine.getInstance().retrieveState(this.getView().byId("mainTable")).then((oState) => {
                var aSorters = [];
                if (oState.Sorter) {
                    oState.Sorter.forEach(function (oSorter) {
                        var sOrder = oSorter.descending ? "desc" : "asc";
                        aSorters.push(`${that.oMetadataHelper.getProperty(oSorter.key).path} ${sOrder}`);
                    });

                    oState.Sorter.forEach((oSorter) => {
                        const oCol = that.byId("mainTable").getColumns().find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
                        if (oSorter.sorted !== false) {
                            oCol.setSortIndicator(oSorter.descending ? coreLibrary.SortOrder.Descending : coreLibrary.SortOrder.Ascending);
                        }
                    });
                }
                return aSorters;
            });
        },


        /**
         * Clears all filter input fields in the filter bar.
         * This method resets input values, date selections, and drop-down selections.
         */
        onClearFilterBar: function () {
            /**
             * Helper function to reset text input fields.
             * @param {string} sControlId - The ID of the input field to reset.
             */
            function resetValue(sControlId) {
                this.getView().byId(sControlId).setValue(null);
            };

            /**
             * Helper function to reset date picker values.
             * @param {string} sControlId - The ID of the date picker to reset.
             */
            function resetDateValue(sControlId) {
                this.getView().byId(sControlId).setDateValue(null);
            };

            /**
             * Helper function to reset checkbox or selection fields.
             * @param {string} sControlId - The ID of the selection control to reset.
             */
            function resetSelected(sControlId) {
                this.getView().byId(sControlId).setSelectedItem(null);
            };

            /**
             * Helper function to reset drop-down selection.
             * @param {string} sControlId - The ID of the drop-down control to reset.
             */
            function resetSelectedItem(sControlId) {
                this.getView().byId(sControlId).setSelectedItem(null);
            };

            /**
             * Helper function to reset drop-down selected key.
             * @param {string} sControlId - The ID of the drop-down control to reset.
             */
            function resetSelectedKey(sControlId) {
                this.getView().byId(sControlId).setSelectedKey('default');
            };

            resetValue.call(this, "inputVpid");
            resetValue.call(this, "inputWerks");
            resetValue.call(this, "inputVkorg");
            resetValue.call(this, "inputVtweg");
            resetValue.call(this, "inputDriver1");
            resetValue.call(this, "inputKunnr");
            resetValue.call(this, "inputKunwe");
            resetDateValue.call(this, "datePickerDatfr");
            resetDateValue.call(this, "datePickerDatto");
            resetSelectedKey.call(this, "comboBoxActive");
            resetSelectedKey.call(this, "comboBoxLoevm");
            resetValue.call(this, "inputSpart");
            resetValue.call(this, "inputTermCode");
            resetDateValue.call(this, "datePickerErdat");
            resetValue.call(this, "timePickerErzet");
            resetValue.call(this, "inputErnam");
            resetDateValue.call(this, "datePickerAedat");
            resetValue.call(this, "timePickerAezet");
            resetValue.call(this, "inputAenam");
        },

        /**
         * Event handler for growing event of the table.
         * Fetches additional data with pagination.
         */
        onTableGrowing: function (oEvent) {
            if (oEvent.getParameters().reason === 'Growing') {
                this._iSkip += this._iTop;
                this._fetchData();
            }
        },

        // Werks value help
        onWerksVH: function () {
            var oMasterModel = this.getView().getModel("masterModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getWerks()',
                sPropertyPath = "/valuehelps/werks",
                sIdControl = "idWerksDialog_VH",
                sFragmentName = "frontend.view.fragments.WerksVH";
            this._onValueHelp(this, oMasterModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchWerks: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Plant", "PlantName"], "idWerksDialog_VH");
        },

        onConfirmWerks: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "masterModel", this.getView(), "/Plant", "inputWerks");
        },

        // Vkorg value help
        onVkorgVH: function (oEvent) {
            var oMasterModel = this.getView().getModel("masterModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getVkorg()',
                sPropertyPath = "/valuehelps/vkorg",
                sIdControl = "idVkorgDialog_VH",
                sFragmentName = "frontend.view.fragments.VkorgVH";
            this._onValueHelp(this, oMasterModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchVkorg: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["SalesOrganization"], "idVkorgDialog_VH");
        },

        onConfirmVkorg: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "masterModel", this.getView(), "/SalesOrganization", "inputVkorg");
        },

        // Vtweg value help
        onVtwegVH: function (oEvent) {
            var oMasterModel = this.getView().getModel("masterModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getVtweg()',
                sPropertyPath = "/valuehelps/vtweg",
                sIdControl = "idVtwegDialog_VH",
                sFragmentName = "frontend.view.fragments.VtwegVH";
            this._onValueHelp(this, oMasterModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchVtweg: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["DistributionChannel"], "idVtwegDialog_VH");
        },

        onConfirmVtweg: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "masterModel", this.getView(), "/DistributionChannel", "inputVtweg");
        },

        // Driver value help
        onDriverVH: function (oEvent) {
            var oMasterModel = this.getView().getModel("masterModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getDriver()',
                sPropertyPath = "/valuehelps/driver",
                sIdControl = "idDriverDialog_VH",
                sFragmentName = "frontend.view.fragments.DriverVH";
            this._onValueHelp(this, oMasterModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchDriver: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "CustomerName"], "idDriverDialog_VH");
        },

        onConfirmDriver: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "masterModel", this.getView(), "/Customer", "inputDriver1");
        },

        // Kunnr value help
        onKunnrVH: function (oEvent) {
            var oMasterModel = this.getView().getModel("masterModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getKunnr()',
                sPropertyPath = "/valuehelps/kunnr",
                sIdControl = "idKunnrDialog_VH",
                sFragmentName = "frontend.view.fragments.KunnrVH";
            this._onValueHelp(this, oMasterModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchKunnr: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "CustomerName", "StreetName", "CityName", "Region", "PostalCode"], "idKunnrDialog_VH");
        },

        onConfirmKunnr: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "masterModel", this.getView(), "/Customer", "inputKunnr");
        },

        // Kunwe value help
        onKunweVH: function (oEvent) {
            var oMasterModel = this.getView().getModel("masterModel"),
                sUrl = baseManifestUrl + '/girovisiteService/getKunwe()',
                sPropertyPath = "/valuehelps/kunwe",
                sIdControl = "idKunweDialog_VH",
                sFragmentName = "frontend.view.fragments.KunweVH";
            this._onValueHelp(this, oMasterModel, sUrl, sPropertyPath, sIdControl, sFragmentName);
        },

        onSearchKunwe: function (oEvent) {
            this._onSearchValueHelp(oEvent, this.getView(), ["Customer", "CustomerName", "StreetName", "CityName", "Region", "PostalCode"], "idKunweDialog_VH");
        },

        onConfirmKunwe: function (oEvent) {
            this._onConfirmValueHelp(oEvent, "masterModel", this.getView(), "/Customer", "inputKunwe");
        },

        onCreateDetail: function () {
            this.getOwnerComponent().getRouter().navTo("create");
        },

        onOpenUnlockMenuAction: function (oEvent) {
            this.oContext = oEvent.getSource().getBindingContext('masterModel');
            this.LockedBy = this.getView().getModel("masterModel").getProperty(this.oContext.getPath() + '/lockedBy');

            var oControl = oEvent.getSource(),
                oView = this.getView();

            if (!this._oLockMenuFragment) {
                Fragment.load({
                    id: oView.getId(),
                    name: "frontend.view.fragments.LockMenu",
                    controller: this
                }).then(function (oMenu) {
                    oView.addDependent(oMenu);
                    oMenu.openBy(oControl);
                    this._oLockMenuFragment = oMenu;
                }.bind(this));
            } else {
                this._oLockMenuFragment.openBy(oControl);
            }
        },

        onUnlockPress: function () {
            var that = this;
            MessageBox.warning(oBundle.getText("unlockAlert", [this.LockedBy]), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._confirmUnlock();
                    }
                }
            });

        },

        _confirmUnlock: async function () {
            var that = this,
                sUrl = baseManifestUrl + "/girovisiteService/unlock",
                sVpid = this.getView().getModel("masterModel").getProperty(this.oContext + "/vpid"),
                body = {
                    vpid: sVpid.toString()
                };
            try {
                sap.ui.core.BusyIndicator.show();

                // Execute the request
                var oData = await this.executeRequest(sUrl, 'POST', JSON.stringify(body));
                sap.ui.core.BusyIndicator.hide();
                MessageBox.information(oBundle.getText("documentUnlocked"), {
                    onClose: function () {
                        that.onGoPress();
                    }
                });
            } catch (error) {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"), {
                    title: "Error",
                    details: error,
                    onClose: function () {
                        that.onGoPress();
                    }
                });
            }
        },

        onExportCSV: function () {
            var that = this;
            MessageBox.information(oBundle.getText("ExportAlert"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._confirmExportCSV();
                    }
                }
            });
        },

        _confirmExportCSV: async function () {
            var sUrl = baseManifestUrl + "/girovisiteService/getDataForCSV()?",
                oData = [],
                aFilters = await this._getFilters(),
                that = this;

            if (aFilters.length > 0) {
                sUrl = sUrl + "filter=" + aFilters.join(" and ");
            }

            sap.ui.core.BusyIndicator.show();

            this.executeRequest(sUrl, 'GET')
                .then(function (oData) {
                    let aResult = oData.value[0].result;
                    sap.ui.core.BusyIndicator.hide();
                    if (aResult.length > 0) {
                        // Reorder each object based on the specified order
                        const sortedResults = aResult.map(obj => {
                            let sortedObj = {};
                            Object.keys(aCSVHeaderIndexes).forEach(key => {
                                sortedObj[key] = obj[key] !== undefined ? obj[key] : null; // Ensure all keys exist
                            });
                            return sortedObj;
                        });
                        let aHeaders = that.getColumnsCSV(Object.keys(sortedResults[0]));
                        const csv = that.getCSV(aHeaders, sortedResults);
                        // Create a Blob from the CSV
                        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement("a");
                        const url = URL.createObjectURL(blob);
                        link.setAttribute("href", url);
                        link.setAttribute("download", that.getFileName() + ".csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } else {
                        MessageBox.information(oBundle.getText("NoDataDueCurrentFilters"));
                    }
                })
                .catch(function (error) {
                    let sErrorMessage = "";
                    sap.ui.core.BusyIndicator.hide();
                    if (error.status === 504) {
                        sErrorMessage = oBundle.getText("ExportTimeoutError");
                    } else {
                        sErrorMessage = oBundle.getText("ErrorReadingDataFromBackend");
                    }
                    console.log("Request failed:", error);
                    MessageBox.error(sErrorMessage);
                });

        },

        getColumnsCSV: function (oDataKeys) {
            var aColumns = [];
            oDataKeys.forEach((sKey) => {
                aColumns[aCSVHeaderIndexes[sKey]] = { 'label': oBundle.getText(sKey), 'property': sKey };
            });
            return aColumns;
        },

        /**
         * 
         * @param {array of object} aHeader 
         * @param {array of object} aGroupedData 
         * @returns the csv content
         */
        getCSV: function (aHeader, aGroupedData) {
            const sHeader = aHeader.map(oHeader => oHeader.label.replaceAll(',', ' ')).join(';');
            return [sHeader, ...aGroupedData.map(row => Object.values(row).map((value) => {
                if (typeof value === 'string') {
                    value = String(value).replaceAll(",", " ");
                }
                return value
            }).join(';'))].join('\r\n');
        },

        /**
         * 
         * @returns the excel file name
         */
        getFileName: function () {
            const dDate = new Date(),
                sYear = dDate.getFullYear().toString(),
                sMonth = String(dDate.getMonth() + 1).padStart(2, 0),
                sDay = String(dDate.getDate()).padStart(2, 0),
                sHours = dDate.getHours().toString(),
                sMinutes = dDate.getMinutes().toString();
            return "Report_Giri_Visita_" + sDay + sMonth + sYear;
        },
        

        handleFileChange: function (oEvent) {
            var oMasterModel = this.getView().getModel("masterModel"), 
                aFiles = oEvent.getParameter("files");  // Get the list of files
    
    
            if (aFiles && aFiles.length) {
                var oFile = aFiles[0],    
                    oReader = new FileReader();

                // Define what to do when file is successfully read
                oReader.onload = function (oEvent) {
                    var sBase64 = oEvent.target.result;  // The Base64 encoded file content
                    // If you want only the base64 part, remove the prefix like "data:image/png;base64,"
                    var sBase64Content = sBase64.split(",")[1];
                    // Set property model NewUploadedFile
                    oMasterModel.setProperty("/MassiveImportFile", {
                        "attachment": sBase64Content
                    });
                };
    
                // Read the file as Data URL to get Base64
                oReader.readAsDataURL(oFile);
            
            }
        },

        onImport: function () {
            var that = this;
            MessageBox.information(oBundle.getText("ImportAlert"), {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        that._confirmImport();
                    }
                }
            });
        },

        _confirmImport: function () {
            var oFileUploader = this.getView().byId("fileUploader"),
                oMassiveImportFile = this.getView().getModel("masterModel").getProperty("/MassiveImportFile"),
                sUrl = baseManifestUrl + `/girovisiteService/massiveImport`;

            if (!oFileUploader.getValue()) {
                MessageBox.warning(oBundle.getText("noFileSelected"));
                return;
            }

            this._uploadFile(oFileUploader, sUrl, oMassiveImportFile);
        },

        _uploadFile: function (oFileUploader, sUrl, oMassiveImportFile) {
            var that = this;

            oFileUploader.checkFileReadable()
                .then(function () {
                    sap.ui.core.BusyIndicator.show();
                    return that.executeRequest(sUrl, 'POST', JSON.stringify(oMassiveImportFile));
                })
                .then(function () {
                    that._handleUploadSuccess(oFileUploader);
                })
                .catch(function (error) {
                    that._handleUploadError(error);
                });
        },

        _handleUploadSuccess: function (oFileUploader) {
            var that = this;
            
            sap.ui.core.BusyIndicator.hide();
            oFileUploader.clear();

            MessageBox.success(oBundle.getText("successImport"), {
                actions: [MessageBox.Action.CLOSE],
                title: "Success",
                onClose: function () {
                    that.onGoPress();
                }
            });
        },

        _handleUploadError: function (error) {
            sap.ui.core.BusyIndicator.hide();
            console.error("Request failed:", error);
            MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"));
        }

    });
});