(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreatePrivateReportController", CreatePrivateReportController);

    CreatePrivateReportController.$inject = ["$stateParams", "$http", "$log", "storage"];

    function CreatePrivateReportController($stateParams, $http, $log, storage) {

        function activate() {
            gapi.client.load('drive', 'v3').then(function(result) {
                console.log("### result", result);
            });
            /*$http.get(patientEndpoint + "/detail/" + patientId).then(function (result) {
            }, function (error) {
                $log.error("Ocurrió un error al recuperar el detalle del usuario con id " + patientId, error);
            });*/
        }

        activate();
    }

})();
