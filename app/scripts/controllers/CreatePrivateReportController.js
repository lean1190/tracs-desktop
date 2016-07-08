(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreatePrivateReportController", CreatePrivateReportController);

    CreatePrivateReportController.$inject = ["$stateParams", "$sce", "GapiHelper", "environment","storage","$q"];

    function CreatePrivateReportController($stateParams, $sce, GapiHelper, environment, storage,$q) {

        var vm = this;

        var patientPrivateFolderName = GapiHelper.getTracsPrivateFolderName(),
            parentFolderId = $stateParams.folderId;
        vm.privateFolderId ="";
        vm.newDocUrl = "";
        vm.patient = {};

        function checkAndCreatePatientFolder() {
            return $q(function(resolve) {
                GapiHelper.isFolderCreated(patientPrivateFolderName).then(function(result) {
                    // Si no se encontró una carpeta con ese nombre, se crea
                    if (!result.created) {
                        GapiHelper.createDriveFolder(patientPrivateFolderName, parentFolderId).then(resolve);
                    } else {
                        resolve(result.files[0]);
                    }
                });
            });
        }

        function activate() {
            vm.patient = storage.getLastVisitedPatient();
            patientPrivateFolderName += " - " + vm.patient._id;
            checkAndCreatePatientFolder().then(function(folder) {
                vm.privateFolderId = folder.id;
                vm.newDocUrl = "https://docs.google.com/document/create?usp=drive_web&folder=" + vm.privateFolderId;
                vm.newDocUrl = $sce.trustAsResourceUrl(vm.newDocUrl);
            });
        }

        activate();
    }

})();
