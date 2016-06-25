"use strict";

/**
 * @ngdoc overview
 * @name tracsDesktopApp
 * @description
 * # tracsDesktopApp
 *
 * Main module of the application.
 */
angular
    .module("tracsDesktopApp", [
        "ngAnimate",
        "ngCookies",
        "ngResource",
        "ngRoute",
        "ngSanitize",
        "ngTouch",
        "ui.router",
        "LocalStorageModule",
    ])
    .constant("environment", {
        api: "http://localhost:3000",
        clientId: "1017723616061-btjadg1pe5tug819i8b3sffek1klev6m.apps.googleusercontent.com"
    })
    .config(function($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

        // Configuración del prefijo para el localStorage
        localStorageServiceProvider.setPrefix("tracs");

        // Configuración de estados y rutas
        $stateProvider

        .state("login", {
            url: "/login",
            templateUrl: "views/login.html",
            controller: "LoginController as vm"
        })

        .state("main", {
            url: "/main",
            abstract: true,
            templateUrl: "views/main.html"
        })

        .state("main.patients", {
            url: "/patients",
            templateUrl: "views/list.html",
            controller: "PatientsListController as vm"
        })

        .state("main.detail", {
            url: "/detail/:id",
            templateUrl: "views/detail.html",
            controller: "PatientDetailController as vm"
        })

        .state("main.newPrivateReport", {
            url: "/reports/new/private/:folderId",
            templateUrl: "views/reports/new-private.html",
            controller: "CreatePrivateReportController as vm"
        })

        .state("main.editPrivateReport", {
            url: "/reports/edit/private/:fileId",
            templateUrl: "views/reports/edit-private.html",
            controller: "EditPrivateReportController as vm"
        })

        .state("main.newSharedReport", {
            url: "/reports/new/shared/:folderId",
            templateUrl: "views/reports/new-shared.html",
            controller: "CreateSharedReportController as vm"
        })

        .state("main.editSharedReport", {
            url: "/reports/edit/shared/:fileId",
            templateUrl: "views/reports/edit-shared.html",
            controller: "EditSharedReportController as vm"
        });

        $urlRouterProvider.otherwise("/login");
    });
