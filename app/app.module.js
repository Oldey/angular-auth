'use strict';

/**
 * @name statesApp
 * @description Main module of the application. It has ui-router and all the sub modules as dependencies.
 * 
 */
angular.module('statesApp', [
    'ui.router',
    'core',
    'login',
    'map'
]);