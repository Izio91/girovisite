sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/m/MessageBox"
], function (Controller, Fragment, Filter, FilterOperator, MessageBox) {
    "use strict";

    return Controller.extend("frontend.controller.BaseController", {
        executeRequest: function (sUrl, sMethod, oBody = undefined) {
            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: sUrl,
                    method: sMethod,
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                        "cache": false
                    },
                    dataType: "json",
                    data: oBody,
                    async: true,
                    success: resolve,
                    error: reject
                });
            });
        },

        /**
         * Retrieves the value of a given SAPUI5 control.
         * Supports multiple control types:
         * - sap.m.Input: Returns the input value as a string.
         * - sap.m.CheckBox: Returns true/false based on selection.
         * - sap.m.DatePicker: Returns the selected date object.
         * - sap.m.TimePicker: Returns the selected time as a string.
         * - sap.m.Select: Returns the selected key or null.
         * - sap.m.MultiComboBox: Returns an array of selected keys.
         * - sap.m.ComboBox: Returns the selected key or null.
         *
         * @param {sap.ui.core.Control} oControl - The SAPUI5 control whose value needs to be retrieved.
         * @returns {any} The value of the control based on its type.
         */
        getControlValue : function (oControl) {
            if (!oControl) {
                return null;
            }

            switch (oControl.getMetadata().getName()) {
                case "sap.m.Input":
                    return oControl.getValue();

                case "sap.m.CheckBox":
                    return oControl.getSelected();

                case "sap.m.DatePicker":
                    return oControl.getValue();

                case "sap.m.TimePicker":
                    return oControl.getValue();

                case "sap.m.Select":
                    var selectedItem = oControl.getSelectedItem();
                    return selectedItem ? selectedItem.getKey() : null;

                case "sap.m.MultiComboBox":
                    return oControl.getSelectedKeys();

                case "sap.m.ComboBox":
                    return oControl.getSelectedKey();

                default:
                    return null;
            }
        },


        /**
         * Opens a fragment dialog in a SAP Fiori application.
         * 
         * @param {string} sIdControl - The ID of the control to check if the fragment already exists.
         * @param {string} sFragmentName - The name of the fragment to be loaded.
         * @param {sap.ui.core.mvc.View} oView - The view where the fragment will be added.
         * @param {sap.ui.core.mvc.Model} oModel - The model binded to the dialog.
         * @param {sap.ui.core.mvc.Controller} oController - The controller associated with the fragment.
         */
        openFragment: function (sIdControl, sFragmentName, oView, oModel, oController) {
            // Check if the fragment is already created
            if (!oView.byId(sIdControl)) {
                // Load the fragment dynamically
                Fragment.load({
                    id: oView.getId(), // Assign the fragment ID based on the view
                    name: sFragmentName, // Specify the fragment name to be loaded
                    controller: oController // Pass the controller to handle fragment events
                }).then(function (oDialog) {
                    // Add the fragment as a dependent of the view
                    oView.addDependent(oDialog);
                    // Set model
                    oDialog.setModel(oModel);
                    // Open the fragment dialog
                    oDialog.open();
                });
            } else {
                oView.byId(sIdControl).getBinding("items").filter([]);
                // If the fragment already exists, open it directly
                oView.byId(sIdControl).open();
            }
        },

        // Utility function to open value help 
        _onValueHelp : function (that, oModel, sUrl, sPropertyPath, sIdControl, sFragmentName) {
            var oView = that.getView();
            sap.ui.core.BusyIndicator.show(); 
            
            that.executeRequest(sUrl, 'GET')    
            .then(function (oData) {
                oModel.setProperty(sPropertyPath, oData.value[0].result);
                sap.ui.core.BusyIndicator.hide();
                that.openFragment(sIdControl, sFragmentName, oView, oModel, that)
            })  
            .catch(function (error) {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.error(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("ErrorReadingDataFromBackend"), {
                    title: "Error",
                    details: error
                });
            });
        },

        _onSearchValueHelp: function (oEvent, oView, aFields, sIdControl) {
          var sValue = oEvent.getParameter("value");
          if (sValue) {
            var aFilters = aFields.map((sField) => new Filter(sField, FilterOperator.Contains, sValue));
            var sFilter = new Filter({
              filters: aFilters
            });
          }
          var oList = oView.byId(sIdControl);
          var oBinding = oList.getBinding("items");
          oBinding.filter(sFilter);
        },

        _onConfirmValueHelp: function (oEvent, sModelName, oView, sField, sIdControl) {
          var sPath = oEvent.getParameter("selectedItem").getBindingContextPath();
          var sValue = oView.getModel(sModelName).getProperty(sPath + sField);
          oView.byId(sIdControl).setValue(sValue);
        },

    });
});