sap.ui.define([], function () {
  "use strict";

  return {
    formatTimestampToDate: function (timestamp) {
      if (!timestamp) {
        return "";
      }

      // Si le timestamp est en millisecondes
      var date = new Date(parseInt(timestamp));

      // Formatage JJMMAAAA
      var day = ("0" + date.getDate()).slice(-2);
      var month = ("0" + (date.getMonth() + 1)).slice(-2);
      var year = date.getFullYear();

      return day + "/" + month + "/" + year;
    }
  };

});