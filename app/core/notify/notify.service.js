angular.module('core.notify')
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