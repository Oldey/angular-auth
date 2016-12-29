angular.module('core.notify')

    /**
     * @name core.notify.factory:NotifyService
     * @description Service that contains a method for showing alerts for a time.
     * 
     */
    .factory('NotifyService', ['$timeout',
        function($timeout) {

            function showMessage(messages, action) {
                $timeout.cancel(messages.lastMessage);
                for(property in messages) {
                    if (messages[property]) {
                        messages[property] = false;
                        break;
                    }
                }
                messages[action] = true;
                messages.lastMessage = $timeout(() => {
                    messages[action] = false;
                }, 5000)
            };

            return {
                showMessage
            };

        }

    ]);