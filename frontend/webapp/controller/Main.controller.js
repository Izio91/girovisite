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
    'sap/m/Text',
    'sap/m/ObjectIdentifier',
    'sap/ui/core/library',
    'sap/m/table/ColumnWidthController',
    'sap/ui/model/Filter'
], (BaseController, JSONModel, MessageBox, Fragment, Engine, SelectionController, SortController, GroupController, FilterController, MetadataHelper, Sorter, ColumnListItem, Text, ObjectIdentifier, coreLibrary, ColumnWidthController, Filter) => {
    "use strict";

    var baseManifestUrl;
    var oBundle;
    return BaseController.extend("frontend.controller.Main", {
        onInit() {
            baseManifestUrl = jQuery.sap.getModulePath(this.getOwnerComponent().getMetadata().getManifest()["sap.app"].id);
            // read msg from i18n model
            oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
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

        handleStateChange: function (oEvt) {
            const oTable = this.byId("mainTable");
            const oState = oEvt.getParameter("state");

            if (!oState) {
                return;
            }

            //Update the columns per selection in the state
            this.updateColumns(oState);

            //Create Filters & Sorters
            const aFilter = this.createFilters(oState);
            const aGroups = this.createGroups(oState);
            const aSorter = this.createSorters(oState, aGroups);

            const aCells = oState.Columns.map(function (oColumnState) {
                if (oColumnState.key === 'vpid_col') {
                    return new ObjectIdentifier({
                        title: "{masterModel>" + this.oMetadataHelper.getProperty(oColumnState.key).path + "}"
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
                sorter: aSorter.concat(aGroups),
                filters: aFilter,
                template: new ColumnListItem({
                    cells: aCells,
                    type: "Navigation",
                    press: this.onListItemPress.bind(this)
                })
            });

        },

        createFilters: function (oState) {
            const aFilter = [];
            Object.keys(oState.Filter).forEach((sFilterKey) => {
                const filterPath = this.oMetadataHelper.getProperty(sFilterKey).path;

                oState.Filter[sFilterKey].forEach(function (oConditon) {
                    aFilter.push(new Filter(filterPath, oConditon.operator, oConditon.values[0]));
                });
            });

            this.byId("filterInfo").setVisible(aFilter.length > 0);

            return aFilter;
        },

        createSorters: function (oState, aExistingSorter) {
            const aSorter = aExistingSorter || [];
            oState.Sorter.forEach(function (oSorter) {
                const oExistingSorter = aSorter.find(function (oSort) {
                    return oSort.sPath === this.oMetadataHelper.getProperty(oSorter.key).path;
                }.bind(this));

                if (oExistingSorter) {
                    oExistingSorter.bDescending = !!oSorter.descending;
                } else {
                    aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
                }
            }.bind(this));

            oState.Sorter.forEach((oSorter) => {
                const oCol = this.byId("mainTable").getColumns().find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
                if (oSorter.sorted !== false) {
                    oCol.setSortIndicator(oSorter.descending ? coreLibrary.SortOrder.Descending : coreLibrary.SortOrder.Ascending);
                }
            });

            return aSorter;
        },

        createGroups: function (oState) {
            const aGroupings = [];
            oState.Groups.forEach(function (oGroup) {
                aGroupings.push(new Sorter(this.oMetadataHelper.getProperty(oGroup.key).path, false, true));
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

        onListItemPress: function(oEvent) {
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
                "HeaderWithDetails": []
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
        _fetchData: function () {
            var sUrl = this._buildFilterQuery(),
                oMasterModel = this.getView().getModel("masterModel"),
                that = this;
            sap.ui.core.BusyIndicator.show();  
            this.executeRequest(sUrl, 'GET')    
                .then(function (oData) {
                    console.log("Data fetched: ", oData);
                    var aPreviousData = oMasterModel.getProperty("/HeaderWithDetails"),
                        aNewData = aPreviousData.concat(oData.value);
                    oMasterModel.setProperty("/HeaderWithDetails", aNewData);
                    sap.ui.core.BusyIndicator.hide();
                })  
                .catch(function (error) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("ErrorReadingDataFromBackend"), {
                        title: "Error",
                        details: error
                    });
                });
        },
        
        /**
         * Constructs the filter query URL for the service request.
         * This method builds the query string dynamically based on the applied filters.
         * 
         * @returns {string} The complete URL with filters and pagination parameters.
         */
        _buildFilterQuery: function () {
            var sUrl = baseManifestUrl + '/girovisiteService/HeaderWithDetails?',
                aParams = ["$orderby=vpid"],
                aFilters = [];

            // Add pagination parameters
            aParams.push("$top=" + this._iTop);
            aParams.push("$skip=" + this._iSkip);

            // Retrieve applied filters
            aFilters = this._getFilters();

            // Append filters if any exist
            if (aFilters.length > 0) {
                aParams.push("$filter=" + aFilters.join(" and "));
            }

            // Construct and return the final URL
            return sUrl + aParams.join("&");
        },

        /**
         * Retrieves all applied filters from the UI controls and formats them into OData filter expressions.
         * 
         * @returns {Array} An array of filter conditions to be used in the query.
         */
        _getFilters : function () {
            var aFilters = [];

            /**
             * Helper function to extract values from UI controls and format them into filter conditions.
             * 
             * @param {string} sField - The OData field name.
             * @param {string} sControlId - The ID of the UI control to get the value from.
             * @param {string} bIsDate - True if the UI control is a DatePicker, false otherwise. 
             */
            function addFilter (sField, sControlId, bIsDate = false) {
                var sValue = this.getControlValue(this.getView().byId(sControlId));

                // Append filter condition if a value is present
                if (sField === 'active' || sField === 'loevm') {
                    if (sValue !== null && sValue !== 'default') {
                        aFilters.push(`${sField} eq '${sValue}'`);
                    }
                } else {
                    if (sValue !== null && sValue !== '') {
                        // Convert to the format  if is a date
                        if (bIsDate) {
                            sValue = sValue.toISOString().split("T")[0];
                        }
                        aFilters.push(`${sField} eq '${sValue}'`);
                    }
                }
            }

            addFilter.call(this,"vpid","inputVpid");
            addFilter.call(this,"werks","inputWeks");
            addFilter.call(this,"vkorg","inputVkorg");
            addFilter.call(this,"vtweg","inputVtweg");
            addFilter.call(this,"driver1","inputDriver1");
            addFilter.call(this,"kunnr","inputKunnr");
            addFilter.call(this,"kunwe","inputKunwe");
            addFilter.call(this,"datfr","datePickerDatfr",true);
            addFilter.call(this,"datto","datePickerDatto",true);
            addFilter.call(this,"active","comboBoxActive");
            addFilter.call(this,"loevm","comboBoxLoevm");
            addFilter.call(this,"spart","inputSpart");
            addFilter.call(this,"termCode","inputTermCode");
            addFilter.call(this,"erdat","datePickerErdat",true);
            addFilter.call(this,"erzet","timePickerErzet");
            addFilter.call(this,"ernam","inputErnam");
            addFilter.call(this,"aedat","datePickerAedat",true);
            addFilter.call(this,"aezet","timePickerAezet");
            addFilter.call(this,"aenam","inputAenam");

            return aFilters;
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
            function resetValue (sControlId) {
                this.getView().byId(sControlId).setValue(null);
            };

            /**
             * Helper function to reset date picker values.
             * @param {string} sControlId - The ID of the date picker to reset.
             */
            function resetDateValue (sControlId) {
                this.getView().byId(sControlId).setDateValue(null);
            };

            /**
             * Helper function to reset checkbox or selection fields.
             * @param {string} sControlId - The ID of the selection control to reset.
             */
            function resetSelected (sControlId) {
                this.getView().byId(sControlId).setSelectedItem(null);
            };

            /**
             * Helper function to reset drop-down selection.
             * @param {string} sControlId - The ID of the drop-down control to reset.
             */
            function resetSelectedItem (sControlId) {
                this.getView().byId(sControlId).setSelectedItem(null);
            };

            /**
             * Helper function to reset drop-down selected key.
             * @param {string} sControlId - The ID of the drop-down control to reset.
             */
            function resetSelectedKey (sControlId) {
                this.getView().byId(sControlId).setSelectedKey('default');
            };

            resetValue.call(this, "inputVpid");
            resetValue.call(this, "inputWeks");
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
        }
    });
});