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
    .config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

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
            url: "/reports/new/private",
            templateUrl: "views/reports/new-private.html",
            controller: "CreatePrivateReportController as vm"
        });

        $urlRouterProvider.otherwise("/login");
    });
