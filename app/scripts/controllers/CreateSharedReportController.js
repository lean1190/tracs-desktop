(function() {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("CreateSharedReportController", CreateSharedReportController);

    CreateSharedReportController.$inject = ["$http", "$stateParams", "$sce", "GapiHelper", "$log", "storage", "environment", "$q"];

    function CreateSharedReportController($http, $stateParams, $sce, GapiHelper, $log, storage, environment, $q) {

        var vm = this;

        var patientSharedFolderName = GapiHelper.getTracsSharedFolderName(),
            parentFolderId = $stateParams.folderId;

        vm.patientEndpoint = environment.api + "/patient";
        vm.profiles = [];
        vm.patient = {};
        vm.sharedFolderId = "";
        vm.fileOwnerId ="";
        vm.user={};

        function checkAndCreatePatientFolder() {
            return $q(function(resolve) {
                GapiHelper.isFolderCreated(patientSharedFolderName).then(function(result) {
                    // Si no se encontró una carpeta con ese nombre, se crea
                    if (!result.created) {
                        GapiHelper.createDriveSharedFolder(patientSharedFolderName, parentFolderId, vm.profiles,vm.fileOwnerId).then(resolve);
                    } else {
                        resolve(result.files[0]);
                    }
                });
            });
        }

        function activate() {

            vm.user = storage.getUser();
            vm.patient = storage.getLastVisitedPatient();
            patientSharedFolderName += " - " + vm.patient._id;
            vm.fileOwnerId = vm.user._id;

            //Obtengo todos los usuarios relacionados al paciente para poder darle los permisos para trabajar con el reporte compartido
            $http.get(vm.patientEndpoint + "/profiles/" + vm.patient._id).then(function(result) {
                vm.profiles = result.data;
            }, function(error) {
                $log.error("Ocurrió un error al recuperar los usuarios del paciente con id " + vm.patient._id, error);
            });

            checkAndCreatePatientFolder().then(function(folder) {
                vm.sharedFolderId = folder.id;
                vm.newDocUrl = "https://docs.google.com/document/create?usp=drive_web&folder=" + vm.sharedFolderId;
                vm.newDocUrl = $sce.trustAsResourceUrl(vm.newDocUrl);
            });

        }

        activate();
    }

})();
