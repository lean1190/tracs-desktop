/**
 * @ngdoc function
 * @name tracsDesktopApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the tracsDesktopApp
 */

(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .controller("PatientsListController", PatientsListController);

    PatientsListController.$inject = ["$http", "$log", "storage"];

    function PatientsListController($http, $log, storage) {

        // Mock de usuario hasta que tengamos el login
        storage.setUser({
            // hay q poner uno de la base para que traiga algo, paja mockear todos los pacientes
            _id: "56fff620e56cb4da123dba1e"
        });

        var vm = this,
            patientEndpoint = "http://localhost:3000/patient",
            userId = storage.getUser()._id;

        vm.profiles = [];

        function activate() {
            $http.get(patientEndpoint + "/user/" + userId).then(function (result) {
                console.log("### Patients", result.data)
                vm.profiles = result.data;
            }, function (error) {
                $log.error("Ocurrió un error al recuperar los pacientes del usuario con id " + userId, error);
            });
        }

        activate();
    }

})();
