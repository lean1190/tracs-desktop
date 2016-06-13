(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("PatientDetailController", PatientDetailController);

    PatientDetailController.$inject = ["$stateParams", "$http", "$log", "storage", "environment", "GapiHelper"];

    function PatientDetailController($stateParams, $http, $log, storage, environment, GapiHelper) {

        var vm = this,
            patientEndpoint = environment.api + "/patient",
            patientId = $stateParams.id;

        vm.patient = {};

        function activate() {

            $http.get(patientEndpoint + "/detail/" + patientId).then(function (result) {
                vm.patient = result.data;
                storage.setLastVisitedPatient(vm.patient);
            }, function (error) {
                $log.error("Ocurrió un error al recuperar el detalle del usuario con id " + patientId, error);
            });

            /*GapiHelper.createDriveFolder("miCarpetaPiola").then(function () {
                console.log("### createDriveFolder...");
                GapiHelper.isFolderCreated("miCarpetaPiola").then(function (res) {
                    console.log("### isFolderCreated...", res);
                    if (res.created) {
                        GapiHelper.getFolderFiles(res.files[0].id).then(function (files) {
                            console.log("### getFolderFiles...", files);
                        });
                    }
                });
            });*/

        }

        activate();
    }

})();
