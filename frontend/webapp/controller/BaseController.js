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
        }
    });
});