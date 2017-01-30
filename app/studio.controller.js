angular.module('studio').controller('studioController',
                                    ['$scope','$http','$filter','$stateParams','$timeout',
                                    function($scope,$http,$filter,$stateParams, $timeout){

    $scope.funcTypes = [
        "General",
        "Wedding",
        "School",
        "Photo Shoot",
        "Other"
    ];
    $scope.orders = [];

    $scope.order_status_selection = [];
    $scope.orderStatusSelectionChange = function(selected,title){
        if(selected){
            if(title=='all'){
                $scope.order_status_selection = ['open','completed','cancelled'];
            }else{
                $scope.order_status_selection.push(title);
            }
        }else{
            if(title=='all'){
                $scope.order_status_selection = [];
            }else{
                $scope.filter_order_status_all = false;
                var arr_index = $scope.order_status_selection.indexOf(title);
                $scope.order_status_selection.splice( arr_index, 1 );
            }
        }
        $scope.getOrderList();

        if(title == 'all'){
            $scope.filter_order_status_open = selected;
            $scope.filter_order_status_completed = selected;
            $scope.filter_order_status_cancelled = selected;
        }
    }

    $scope.resetOrderForm = function(){
        $scope.neworder = {
            cust_name:'',
            cust_mobile:'',
            cust_address:'',
            func_type:'',
            func_date:'',
            func_venue:'',
            estimation:'',
            advance_paid:'',
            order_status:'open'
        };
        $timeout(function(){
            $('#function_type').material_select('destroy');
            $('#function_type').material_select();
        },100);
    }
    $scope.init = function(){
        $scope.resetOrderForm();
        $timeout(function(){
            //Jquery calls
            $('.datepicker').pickadate({
                selectMonths: true, // Creates a dropdown to control month
                selectYears: 15 // Creates a dropdown of 15 years to control year
            });
            $('ul.tabs').tabs();

            $('#filter_type').material_select();
            //Jquery Calls	
        },100);
        $scope.filter_order_status_open = true;
        $scope.order_status_selection.push('open');
        $scope.order_filter_type = 'Order Status';

        $scope.getOrderList();
        $scope.getCustomerList();
    }
    
    $scope.saveOrder = function(){
        $scope.neworder.func_date = new Date($scope.neworder.func_date).getTime();
        if($scope.sameas_cust_address){
            $scope.neworder.func_venue = $scope.neworder.cust_address;
        }
        var orderObj = angular.copy($scope.neworder);
        var apiurl = '/api/order/add';
        if(orderObj._id){
            apiurl = '/api/order/update';
        }
        $http.post(apiurl,orderObj).then(function(response){ 
            showNotificationMessage('success','Order saved successfully');
            $scope.getOrderList();
            $scope.resetOrderForm();
        }, function(err){});

    }

    $scope.updateOrderStatus = function(order,status){
        order.order_status = status;
        $http.post('/api/order/update',order).then(function(response){                
            $scope.getOrderList();
        }, function(err){});
    }

    $scope.deleteOrder = function(order){
        $http.post('/api/order/delete',order).then(function(response){                
            $scope.getOrderList();
        }, function(err){});
    }

    $scope.getOrderList = function(){
        var order_status = $scope.order_status_selection.join('-');

        $http.get('/api/order/list?order_status='+order_status).then(function(response){
            if(response.data){
                $scope.orders = response.data.payload.orders;
            }else{
                $scope.orders = [];
            }
        }, function(err){});
    }

    $scope.getCustomerList = function(){

        $http.get('/api/order/customer/list').then(function(response){
            var cust_list = {};
            if(response.data){
                angular.forEach(response.data, function(value, key) {
                    this[value] = null;
                }, cust_list);
            }
            $('#order_filter_customer').siblings().remove();
            $('#order_filter_customer').autocomplete({
                data: cust_list
            });
        }, function(err){});


    }

    $scope.onOrderFilterChange = function(){
        if($scope.order_filter_type == 'Order Status'){
            $scope.getOrderList();
        }else{
            $scope.searchOrder($scope.order_filter_type.toLowerCase())
        }
    }

    $scope.searchOrder = function(orderby){
        var apiUrl = "";
        if(orderby == 'date'){
            apiUrl = '/api/order/list?order_date='+(new Date($scope.order_filter_date)).getTime();
        }else if(orderby == 'customer'){
            apiUrl = '/api/order/list?cust_name='+$scope.order_filter_customer;
        }
        $http.get(apiUrl).then(function(response){
            if(response.data){
                $scope.orders = response.data.payload.orders;
            }else{
                $scope.orders = [];
            }
        }, function(err){});

    }
    
}]);


function showNotificationMessage(type,message,title){
    title = title || "";       
    toastr[type](message,title);
}