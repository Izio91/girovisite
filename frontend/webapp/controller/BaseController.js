sap.ui.define([

    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("vim_ui.controller.BaseController", {
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
                    return oControl.getDateValue()

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
        }

    });
});