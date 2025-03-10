sap.ui.define([
  
], function () {
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

        handleInactiveSelectedKey: function (bIsNew, sInactive) {
            return bIsNew ? 'X' : sInactive;
        }
    };
});