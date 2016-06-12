(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreatePrivateReportController", CreatePrivateReportController);

    CreatePrivateReportController.$inject = ["$stateParams", "$http", "$log", "storage"];

    function CreatePrivateReportController($stateParams, $http, $log, storage) {

        function activate() {

            /*$http.get(patientEndpoint + "/detail/" + patientId).then(function (result) {
            }, function (error) {
                $log.error("Ocurrió un error al recuperar el detalle del usuario con id " + patientId, error);
            });*/
            var request = gapi.client.drive.files.list({
                                'pageSize': 10,
                                'fields': "nextPageToken, files(id, name)"
                            });

                            request.execute(function (resp) {
                                console.log("### list", resp);
                            });
        }

        activate();
    }

})();
