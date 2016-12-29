/**
 * @name core
 * @description Sub module for various shared features that can be used in all other modules. Depends on core.auth and core.notify.
 * 
 */
angular.module('core', [
    'core.auth',
    'core.notify'
]);