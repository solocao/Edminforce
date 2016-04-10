// billing
Meteor.methods({
    //Retrieves registration summary for a list of pending registrations
    'billing.getRegistrationSummary': function (studentClassIDs) {
        check(studentClassIDs, [String]);
        return EdminForce.Registration.getRegistrationSummary(this.userId, studentClassIDs);
    },

    'billing.validateCouponId': function(couponId) {
        check(couponId, String);
        return Collections.coupon.find({_id: couponId}).count();
    },

    // get shopping cart items, with coupon applied or not
    'billing.getShoppingCartItems': function (couponId) {
        couponId && check(couponId, String);
        return EdminForce.Registration.getRegistrationSummary(this.userId, null, couponId);
    },

    // delete a registration item (student class doc), update registration count in class document
    'billing.deleteCartItem': function(studentClassId) {
        check(studentClassId, String);
        EdminForce.Registration.removePendingRegistration(this.userId, studentClassId);
    },
    
    'billing.prepareOrder': function(order) {
        check(order, {
            details: [String],
            amount: Number,
            discount: Number,
            couponID: Match.Optional(String)
        });
        
        return Collections.orders.insert({
            accountID: this.userId,
            details: order.details,
            status: 'waiting',
            amount: order.amount,
            //discount: order.discount
            couponID: order.couponID
        });
    },
    
    'billing.getExpiredRegistrations': function(expiredRegistrationIDs) {
        check(expiredRegistrationIDs, [String]);
        return EdminForce.Registration.getExpiredRegistrations(this.userId, expiredRegistrationIDs);
    },
    
    'billing.payECheck': function(checkPaymentInfo) {
        check(checkPaymentInfo, {
            orderId: String,
            routingNumber: String,
            accountNumber: String,
            nameOnAccount: String
        });

        return EdminForce.Registration.payECheck(this.userId, checkPaymentInfo);
    }
});
