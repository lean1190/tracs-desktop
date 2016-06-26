/* jshint bitwise: false, camelcase: false, curly: true, eqeqeq: true, globals: false, freeze: true, immed: true, nocomma: true, newcap: true, noempty: true, nonbsp: true, nonew: true, quotmark: true, undef: true, unused: true, strict: true, latedef: nofunc */

/* globals angular */

/**
 * @ngdoc function
 * @name TracsClient:storage
 * @description
 * Factory para el manejo del localStorage
 * de una forma más cómoda y sin hardcodear strings
 * de keys en todo el código
 */

(function () {
    "use strict";

    angular
        .module("tracsDesktopApp")
        .factory("storage", Storage);

    Storage.$inject = ["localStorageService"];

    function Storage(localStorageService) {

        // Constantes para acceder a las propiedades
        var USER_KEY = "user",
            PATIENT_USER_KEY = "patientUser",
            LAST_VISITED_PATIENT_KEY = "lastVisitedPatient";

        var service = {
            getUser: getUser,
            setUser: setUser,
            getLastVisitedPatient: getLastVisitedPatient,
            setLastVisitedPatient: setLastVisitedPatient
        };

        return service;

        function getUser() {
            return localStorageService.get(USER_KEY);
        }

        function setUser(user) {
            return localStorageService.set(USER_KEY, user);
        }

        function getLastVisitedPatient() {
            return localStorageService.get(LAST_VISITED_PATIENT_KEY);
        }

        function setLastVisitedPatient(lastVisitedPatient) {
            return localStorageService.set(LAST_VISITED_PATIENT_KEY, lastVisitedPatient);
        }



    }

})();
