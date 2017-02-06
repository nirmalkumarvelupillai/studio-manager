(function(){

    angular.module('studio').controller('studioController',studioController);
    studioController.$inject = ['$scope','$http','$filter','$stateParams','$timeout','toastr'];

    function studioController($scope,$http,$filter,$stateParams, $timeout,toastr){
        $scope.new_order_open = true;
        $scope.funcTypes = [
            "General",
            "Wedding",
            "School",
            "Photo Shoot",
            "Other"
        ];
        $scope.orders = [];
        $scope.activepg =2;
        $scope.order_status_selection = [];
        $scope.order_filter = {};
        $scope.order_filter_list = ['Order Status', 'Date', 'Customer'];
        $scope.order_filter.type = "Order Status";
        $scope.order_payment = {};


        $scope.init = init;
        $scope.orderStatusSelectionChange = orderStatusSelectionChange;
        $scope.resetOrderForm = resetOrderForm;
        $scope.addOrderPayment = addOrderPayment;
        $scope.saveOrder = saveOrder;
        $scope.updateOrderStatus = updateOrderStatus;
        $scope.deleteOrder = deleteOrder;
        $scope.getOrderList = getOrderList;
        $scope.getCustomerList = getCustomerList;
        $scope.onOrderFilterChange = onOrderFilterChange;
        $scope.searchOrder = searchOrder;
        $scope.onFunctionDateChange = onFunctionDateChange;
        $scope.onFilterDateChange = onFilterDateChange;
        $scope.onOrderPaymentDateChange = onOrderPaymentDateChange;
        $scope.onPageChange = onPageChange;
        // Functions

        function init(){
            $scope.resetOrderForm();
            $scope.filter_order_status_open = true;
            $scope.order_status_selection.push('open');
            $scope.order_filter_type = 'Order Status';

            $scope.getOrderList();
            $scope.getCustomerList();
        }

        function orderStatusSelectionChange(selected,title){
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
        };

        function onPageChange(pageno){
            console.log(pageno);

        }

        function resetOrderForm(){
            $scope.neworder = {
                cust_name:'',
                cust_mobile:'',
                cust_address:'',
                func_type:'',
                func_date:undefined,
                func_venue:'',
                estimation:'',
                advance_paid:'',
                payments:[],
                order_status:'open'
            };
            $scope.sameas_cust_address = false;
        }

        function addOrderPayment(){
            if($scope.order_payment && $scope.order_payment.date && $scope.order_payment.amount){
                $scope.neworder.payments.push($scope.order_payment);
                $scope.order_payment = {};
            }
        }

        function saveOrder(){
            console.log($scope.neworder);
            if($scope.neworder.cust_name && $scope.neworder.func_type && $scope.neworder.func_date){
                if($scope.sameas_cust_address || !$scope.neworder.func_venue || $scope.neworder.func_venue == ''){
                    $scope.neworder.func_venue = $scope.neworder.cust_address;
                }
                $scope.neworder.estimation = $scope.neworder.estimation || 0;
                $scope.neworder.advance_paid = $scope.neworder.advance_paid || 0;
                var orderObj = angular.copy($scope.neworder);
                orderObj.func_date = new Date(orderObj.func_date).getTime();
                
                var apiurl = '/api/order/add';
                if(orderObj._id){
                    apiurl = '/api/order/update';
                }
                $http.post(apiurl,orderObj).then(function(response){ 
                    toastr.success('Order saved successfully');
                    $scope.getOrderList();
                    $scope.getCustomerList();
                    $scope.resetOrderForm();
                }, function(err){});
            }else{
                toastr.warning('Please fill order details!','Warning');
            }
        }

        function updateOrderStatus(order,status){
            order.order_status = status;
            $http.post('/api/order/update',order).then(function(response){                
                $scope.getOrderList();
                toastr.info('Order updated successfully.','Information');
            }, function(err){});
        }

        function deleteOrder(order){
            $http.post('/api/order/delete',order).then(function(response){                
                $scope.getOrderList();
                $scope.getCustomerList();
                toastr.info('Order deleted successfully.','Information');
            }, function(err){});
        }

        function getOrderList(){
            var order_status = $scope.order_status_selection.join('-');

            $http.get('/api/order/list?order_status='+order_status).then(function(response){
                if(response.data){
                    $scope.orders = response.data.payload.orders;
                }else{
                    $scope.orders = [];
                }
            }, function(err){});
        }

        function getCustomerList(){
            $http.get('/api/order/customer/list').then(function(response){
                var cust_list = {};
                if(response.data){
                    angular.forEach(response.data, function(value, key) {
                        this[value] = null;
                    }, cust_list);
                }
                $('#order_filter_customer').siblings('ul.autocomplete-content').remove();
                $('#order_filter_customer').autocomplete({
                    data: cust_list,
                    limit:20
                });
            }, function(err){});
        }

        function onOrderFilterChange(){
            if($scope.order_filter.type == 'Order Status'){
                $scope.getOrderList();
            }else{
                $scope.searchOrder($scope.order_filter.type.toLowerCase())
            }
        }

        function searchOrder(orderby){
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

        function onFunctionDateChange(){
            var datePicker = $('#function_date').pickadate('picker');
            if(datePicker && datePicker.component.item.select && datePicker.component.item.highlight.pick == datePicker.component.item.select.pick) {
                datePicker.close();
                $('#sameas_cust_address').focus();
            }
        }

        function onFilterDateChange(){
            var datePicker = $('#order_filter_date').pickadate('picker');
            if(datePicker && datePicker.component.item.select && datePicker.component.item.highlight.pick == datePicker.component.item.select.pick) {
                datePicker.close();
                $('#filter_type').focus();
            }
        }

        function onOrderPaymentDateChange(){
            var datePicker = $('#order_payment_date').pickadate('picker');
            if(datePicker && datePicker.component.item.select && datePicker.component.item.highlight.pick == datePicker.component.item.select.pick) {
                datePicker.close();
                $('#order_payment_amount').focus();
            }  
        }
    };
})();