
EdminForce.Actions.Billing = {
    validateCouponId({LocalState, StateBag}, couponId) {
        LocalState.set('ERROR_CHECKOUT', null);
        Meteor.call('billing.validateCouponId', couponId, function(err, result){
            if (result) {
                StateBag.checkout.couponId = couponId;
            }
            else {
                StateBag.checkout.couponId = '';
                StateBag.checkout.popupError = 'Cannot verify this coupon, please make sure you typed correct coupon';
            }
            
            LocalState.set('state.checkout', new Date().getTime());            
        })
    },
    
    deleteCartItem({LocalState, StateBag}, cartItemId) {
        LocalState.set('ERROR_CHECKOUT', null);
        Meteor.call('billing.deleteCartItem', cartItemId, function(err, result){
            err && (StateBag.checkout.popupError = 'Delete Fail');
            LocalState.set('state.checkout', new Date().getTime());
        });
    },
    
    prepareOrder({LocalState},order, makeupOnly) {
        LocalState.set('ERROR_CHECKOUT', null);
        Meteor.call('billing.prepareOrder', order, function(err,result){
            if (err) {
                LocalState.set('ERROR_CHECKOUT', err.reason);
            }
            else {
                let path = FlowRouter.path('payment',null, {
                    orderId: result,
                    makeupOnly
                });
                FlowRouter.go(path);
            }
        });
    },
    
    payECheck({LocalState,makeupOnly}, orderId, routingNumber, accountNumber, nameOnAccount) {
        LocalState.set('ERROR_CHECKOUT', null);
        Meteor.call('billing.payECheck', {orderId,routingNumber,accountNumber,nameOnAccount}, function(err,result){
            if (err) {
                LocalState.set('ERROR_CHECKOUT', err.reason);
            }
            else {
                let path = FlowRouter.path('checkoutSummary',null, {
                    makeupOnly
                });
                FlowRouter.go(path);
            }
        });
    },

    payCreditCard({LocalState,makeupOnly}, orderId, routingNumber, accountNumber, nameOnAccount) {
        LocalState.set('ERROR_CHECKOUT', null);
        Meteor.call('billing.payCreditCard', {orderId,routingNumber,accountNumber,nameOnAccount}, function(err,result){
            if (err) {
                LocalState.set('ERROR_CHECKOUT', err.reason);
            }
            else {
                // check result
                if (!result.error || result.error == 'registrationExpired') {
                    let path = FlowRouter.path('checkoutSummary',null, {
                        makeupOnly,
                        expiredRegistrationIDs: result.expiredRegistrationIDs
                    });
                    FlowRouter.go(path);
                }
                else {
                    LocalState.set('ERROR_CHECKOUT', result.error);
                }
            }
        });
    },
    
    clearErrors({LocalState}, errorName) {
        LocalState.set(errorName, null);
    }
};

EdminForce.Contexts.Billing = {
    LocalState: new ReactiveDict(),
    MethodCache: {},
    
    // persisted state bag used for the communications between
    // UI component and its container
    StateBag: {
        checkout: {}
    }
}

ReactDI.injectContext(EdminForce.Contexts.Billing, EdminForce.Actions.Billing);