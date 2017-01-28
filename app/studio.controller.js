angular.module('studio').controller('studioController',
                                    ['$scope','$http','$filter','$stateParams','$timeout',
                                    function($scope,$http,$filter,$stateParams, $timeout){
    // console.log("controller loaded...");

    $scope.funcTypes = [
        "General",
        "Wedding",
        "School",
        "Photo Shoot",
        "Other"
    ];
    
    $scope.resetOrderForm = function(){
        $scope.neworder = {
            cust_info:{
                name:'',
                mobile:'',
                address:'',
                city:''
            },
            func_info:{
                type:'',
                date:'',
                address:''
            },
            account_info:{
                estimation:'',
                advance:''
            },
            status:'open'
        };
    }
    $scope.orders = [];
    $scope.orders_bkp = [
        {
            cust_info:{
                name:'Ashok Kumar',
                mobile:'9834323222',
                address:'Madurai',
                city:'Madurai'
            },
            func_info:{
                type:'General',
                date:new Date(),
                address:'Madurai'
            },
            account_info:{
                estimation:5000,
                advance:1000
            },
            status:'open'
        },{
            cust_info:{
                name:'Jamesh Paul',
                mobile:'9834323222',
                address:'',
                city:''
            },
            func_info:{
                type:'School',
                date:new Date(),
                address:'Jamesh Matric School, Madurai'
            },
            account_info:{
                estimation:2000,
                advance:0
            },
            status:'open'
        },{
            cust_info:{
                name:'Vincent Roy',
                mobile:'746223233',
                address:'',
                city:''
            },
            func_info:{
                type:'Wedding',
                date:new Date(),
                address:'123,Daniel Street, Virudhunagar, Tamil Nadu'
            },
            account_info:{
                estimation:20000,
                advance:3000
            },
            status:'open'
        }
    ];

    
    $scope.init = function(){
        $scope.resetOrderForm();
        $timeout(function(){
            //Jquery calls
            $('.datepicker').pickadate({
                selectMonths: true, // Creates a dropdown to control month
                selectYears: 15 // Creates a dropdown of 15 years to control year
            });

            $('#function_type').material_select();
            $('ul.tabs').tabs();

            //Jquery Calls	
        },100);
    }
    
    $scope.saveOrder = function(){
        $scope.neworder.func_info.date = new Date($scope.neworder.func_info.date);
        var orderObj = angular.copy($scope.neworder);
        $scope.orders.push(orderObj);
        $scope.resetOrderForm();
    }
    
}]);