sap.ui.define([
  "sap/ui/core/date/UI5Date"
], function (UI5Date) {
  "use strict";

  return {
        getI18nTextWithCount: function (sText, iCount) {
            return sText.replace("{0}", iCount);
        },

        formatDateFromyyyymmddToddmmyyyy: function (sDate) {
            if (!sDate) return null; 
            var oDate = new Date(sDate);
            var oOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
            return oDate.toLocaleDateString('it-IT', oOptions);
        },

        formatDateFromddmmyyyyToyyyymmdd: function (sDate) {
            if (!sDate) return null;
            var parts = sDate.split('/');
            return parts[2] + '-' + parts[1] + '-' + parts[0];
        },

        getUI5Date: function (sDate) {
            if (!sDate) return null;
            let aDate = sDate.split('-').map(Number)
            return UI5Date.getInstance(aDate[0], aDate[1] - 1, aDate[2]);
        },

        getMaxDate: function (sDateA, sDateB) {
            let sDate = null;
            if (sDateA && sDateB && sDateA !== '' && sDateB !== '') {
                if (sDateA < sDateB) {
                    sDate = sDateA;
                } else {
                    sDate = sDateB;
                }
            } else {
                if (sDateA && sDateA !== '') {
                    sDate = sDateA;
                }
            }
            if (!sDate) return null;
            let aDate = sDate.split('-').map(Number)
            return UI5Date.getInstance(aDate[0], aDate[1] - 1, aDate[2]);
        },

        getMinDateDatfr: function (sDate) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = today.getMonth(); // Months are zero-based

            return UI5Date.getInstance(yyyy, mm, 1);
        },

        handleInactiveAgentSelectedKey: function (bIsNew, bInactive, bIsKunnr) {
            return bIsNew && bIsKunnr ? false : bInactive;
        },

        enableSequenceControl: function (bIsNew, bEditMode, sTurno, bIsKunwe) {
            return (bIsNew || bEditMode) && (sTurno !== null && sTurno !== undefined && sTurno !== '') && bIsKunwe;
        },

        enableDayControl: function (bIsNew, bEditMode, sTurno, bIsKunwe) {
            return (bIsNew || bEditMode) && (sTurno === "1" || sTurno === "3") && bIsKunwe;
        },

        enableSundayControl: function (bIsNew, bEditMode, sTurno, bIsKunwe) {
            return (bIsNew || bEditMode) && (sTurno === "2" || sTurno === "3") && bIsKunwe;
        }
    };
});