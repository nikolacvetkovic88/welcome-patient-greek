app.controller('loginCtrl', function ($scope, $location, helper, AuthService, AccountService, ReminderService) {
    $scope.$emit('body:class:add', "transparent");
    AuthService.clearCredentials();

    $scope.login = function () {
        $scope.loading = true;

        AuthService.login({ username: $scope.username, password: $scope.password })
        .success(function(data) {   
            AuthService.setCredentials($scope.username, $scope.password, data);
            AccountService.storeToken(data.access_token);
            AccountService.getAccount()
            .success(function(data) {
                AccountService.getPatient(data.cloudRef)
                .success(function(data) {
                    AccountService.storePatient(data);
                    ReminderService.getReminders();
                    $location.path("/");
                })
                .error(function(data, status) {
                    helper.notify(data && data.error_description || data && data.description || 'Ανεπιτυχής ανάκτηση ασθενή', 'danger'); 
                    $scope.loading = false;
                });
            })
            .error(function(data, status) {
               helper.notify(data && data.error_description || data && data.description || 'Ανεπιτυχής ανάκτηση λογαριασμού ασθενή', 'danger'); 
               $scope.loading = false;
            });
        })
        .error(function(data, status) {
            helper.notify(data && data.error_description || data && data.description || 'Αποτυχία εισόδου', 'danger'); 
            $scope.loading = false;
        });
    }
});