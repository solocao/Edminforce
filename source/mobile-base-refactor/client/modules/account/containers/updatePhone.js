// account > update phone
const reactiveFnAccountUpdatePhone = ({context,actions}, onData) => {
    const error = context.LocalState.get('ERROR_ACCOUNT_UPDATEPHONE');
    context.SubManager.subscribe('account');
    if (context.SubManager.ready()) {
        if (!Meteor.userId()) return;

        onData(null, {
            customer: Collections.Customer.findOne({_id:Meteor.userId()}),
            error
        })
    }

    return actions.clearErrors.bind(null,'ERROR_ACCOUNT_UPDATEPHONE');
};

EdminForce.Containers.AccountUpdatePhone = Composer.composeWithTracker(reactiveFnAccountUpdatePhone)(EdminForce.Components.AccountUpdatePhone);
