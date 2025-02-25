sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
], (Controller, MessageBox, Fragment) => {
    "use strict";
    
    var oBundle;
    return Controller.extend("frontend.controller.Main", {
        onInit() {
            // read msg from i18n model
            oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteMain").attachPatternMatched(this._onObjectMatched, this);
        },


        _onObjectMatched: async function () {
            this.oView = this.getView();

            this.getBusyDialog().then(function (oDialog) {
                oDialog.open();
            });
            try {
                Promise.all([
                this.readData(this, "/Header"),
                this.createData(this, "/Header", {
                        ID: "123",
                        Name: "New Entry",
                        Status: "Active"
                    }).then(function(oResponse) {
                        console.log("Created Entry:", oResponse);
                    }).catch(function(oError) {
                        console.error("Creation Failed:", oError);
                    }),
                this.updateData(this, "/Header('123')", { 
                        Status: "Completed" 
                    }).then(function() {
                        console.log("Update Success");
                    })
                    .catch(function(oError) {
                        console.error("Update Failed:", oError);
                    }),
                this.deleteData(this, "/Header('123')")
                    .then(function() {
                        console.log("Deletion Success");
                    })
                    .catch(function(oError) {
                        console.error("Deletion Failed:", oError);
                    }),
                this.executeAction(this, "/actiontest", {})
                    .then(function(oResponse) {
                        console.log("Action Success:", oResponse);
                    })
                    .catch(function(oError) {
                        console.error("Action Failed:", oError);
                    }),
                this.executeFunction(this, "/functiontest", { VisitID: "12345" })
                    .then(function(oResponse) {
                        console.log("Function result:", oResponse);
                    })
                    .catch(function(oError) {
                        console.error("Function failed:", oError);
                    }),
                this.executeFunctionList(this, "/functionlisttest", {})
                    .then(function(aResults) {
                        console.log("Open visits:", aResults);
                    })
                    .catch(function(oError) {
                        console.error("Function failed:", oError);
                    })
                ]);

                this.getBusyDialog().then(function (oDialog) {
                    oDialog.close();
                });
            } catch (error) {
                this.getBusyDialog().then(function (oDialog) {
                    oDialog.close();
                });
                MessageBox.error(oBundle.getText("ErrorReadingDataFromBackend"), {
                    title: "Error",
                    details: error
                });
                throw new Error(error);
            };
        },

        /**
         * Read data from Odata service
         * @param {object} that Controller
         * @param {string} path Entity
         * @param {object} filters (optional)
         * @param {object} sorter (optional)
         * @returns object
         */
        readData: function (that, path, filters = [], sorter = []) {
            return new Promise((resolve, reject) => {
                var oModel = that.getOwnerComponent().getModel();
        
                if (!oModel) {
                    reject("Model is not available.");
                    return;
                }
        
                // Bind list with filters & sorting
                var oBinding = oModel.bindList(path, undefined, sorter, filters);
        
                oBinding.requestContexts().then(function (aContexts) {
                    let aResults = aContexts.map(oContext => oContext.getObject());
                    console.log("Fetched Data:", aResults);
                    resolve(aResults);
                }).catch(function (oError) {
                    console.error("Error fetching data:", oError);
                    reject(oError);
                });
            });
        },

        /**
         * Creata data into Odata service
         * @param {*} that 
         * @param {*} path 
         * @param {*} payload 
         * @returns 
         */
        createData: function (that, path, payload) {
            return new Promise((resolve, reject) => {
                var oModel = that.getOwnerComponent().getModel();
        
                if (!oModel) {
                    reject("Model is not available.");
                    return;
                }
        
                oModel.create(path, payload, {
                    success: function (oData) {
                        console.log("Created Successfully:", oData);
                        resolve(oData);
                    },
                    error: function (oError) {
                        console.error("Error Creating Data:", oError);
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Update data into Odata service
         * @param {*} that 
         * @param {*} path 
         * @param {*} payload 
         * @returns 
         */
        updateData: function (that, path, payload) {
            return new Promise((resolve, reject) => {
                var oModel = that.getOwnerComponent().getModel();
        
                if (!oModel) {
                    reject("Model is not available.");
                    return;
                }
        
                oModel.update(path, payload, {
                    success: function () {
                        console.log("Updated Successfully");
                        resolve();
                    },
                    error: function (oError) {
                        console.error("Error Updating Data:", oError);
                        reject(oError);
                    }
                });
            });
        },


        /**
         * Delete data from Odata service
         * @param {*} that 
         * @param {*} path 
         * @param {*} payload 
         * @returns 
         */
        deleteData: function (that, path) {
            return new Promise((resolve, reject) => {
                var oModel = that.getOwnerComponent().getModel();
        
                if (!oModel) {
                    reject("Model is not available.");
                    return;
                }
        
                oModel.remove(path, {
                    success: function () {
                        console.log("Deleted Successfully");
                        resolve();
                    },
                    error: function (oError) {
                        console.error("Error Deleting Data:", oError);
                        reject(oError);
                    }
                });
            });
        },

        /**
         * Function to execute an action of Odata service
         * @param {*} that 
         * @param {*} actionPath 
         * @param {*} parameters 
         * @returns 
         */
        executeAction: function (that, actionPath, parameters) {
            return new Promise((resolve, reject) => {
                var oModel = that.getOwnerComponent().getModel();
        
                if (!oModel) {
                    reject("Model is not available.");
                    return;
                }
        
                // Bind action with parameters
                var oContextBinding = oModel.bindContext(actionPath + "(...)", undefined, { $$groupId: "myGroup" });
        
                // Set the parameter values
                oContextBinding.setParameter("", parameters);
        
                // Execute action
                oContextBinding.execute()
                    .then(function (oResponse) {
                        console.log("Action executed successfully:", oResponse);
                        resolve(oResponse);
                    })
                    .catch(function (oError) {
                        console.error("Error executing action:", oError);
                        reject(oError);
                    });
            });
        },

        /**
         * Execute Odata service function which return a single entity
         * @param {*} that 
         * @param {*} functionPath 
         * @param {*} parameters 
         * @returns 
         */
        executeFunction: function (that, functionPath, parameters) {
            return new Promise((resolve, reject) => {
                var oModel = that.getOwnerComponent().getModel();
        
                if (!oModel) {
                    reject("Model is not available.");
                    return;
                }
        
                // Bind function with parameters
                var oContextBinding = oModel.bindContext(functionPath + "(...)", undefined);
        
                // Set parameters
                oContextBinding.setParameter("", parameters);
        
                // Fetch function result
                oContextBinding.requestObject()
                    .then(function (oResponse) {
                        console.log("Function executed successfully:", oResponse);
                        resolve(oResponse);
                    })
                    .catch(function (oError) {
                        console.error("Error executing function:", oError);
                        reject(oError);
                    });
            });
        },

        /**
         * Execute Odata service function which return multiple entities
         * @param {*} that 
         * @param {*} functionPath 
         * @param {*} parameters 
         * @returns 
         */
        executeFunctionList: function (that, functionPath, parameters) {
            return new Promise((resolve, reject) => {
                var oModel = that.getOwnerComponent().getModel();
        
                if (!oModel) {
                    reject("Model is not available.");
                    return;
                }
        
                // Bind function returning a collection
                var oListBinding = oModel.bindList(functionPath + "(...)", undefined);
        
                // Set parameters
                oListBinding.setParameter("", parameters);
        
                // Fetch function result
                oListBinding.requestContexts()
                    .then(function (aContexts) {
                        let aResults = aContexts.map(oContext => oContext.getObject());
                        console.log("Function list executed successfully:", aResults);
                        resolve(aResults);
                    })
                    .catch(function (oError) {
                        console.error("Error executing function list:", oError);
                        reject(oError);
                    });
            });
        },
        

        /**
         * Singleton pattern to initialize variable containing BusyDialog
         * @returns the fragment
         */
        getBusyDialog: function () {
            if (!this._oBusy) {
                this._oBusy = Fragment.load({
                    id: this.oView.getId(),
                    name: "frontend.view.fragments.BusyDialog",
                    controller: this
                }).then(function (oDialog) {
                    this.oView.addDependent(oDialog);
                    return oDialog;
                }.bind(this));
            }
            return this._oBusy;
        }
    });
});