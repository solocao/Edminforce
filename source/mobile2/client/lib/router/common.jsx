/**
 * Client Routes
 */


{
    //global router control

    FlowRouter.LastRoute = []
    var savedRoute = null

    //define global triggers for test
    FlowRouter.triggers.enter([function(context){
        //console.log('Router enter: path='+context.path,' name= '+FlowRouter.getRouteName())

        //hack 从注册页跳过来 todo 系统处理url history
        if(savedRoute == '/login'){
            savedRoute ='/'
        }


        if (!FlowRouter.BackButton && savedRoute)
            FlowRouter.LastRoute.push(savedRoute)
        else if (FlowRouter.BackButton)
            FlowRouter.LastRoute.pop()

        FlowRouter.BackButton = false
        //calphin logic
        if (!(Meteor.loggingIn() || Meteor.userId())) {
            //Todo hard code; should使用name ;等待 name path最终确定
            if (context.path.indexOf("reset-password") > -1){
                /* 
                 * This is for resetting password via email.
                 * User will click on an URL contianing 'reset-password'.
                 * At that time, user is not logged in, but he has the token to reset password
                 * So, we send him to reset password page, instead of the login page.
                 * Todo: make sure that the token is provided in the link, if not, we should still
                 * direct user to login page.
                 */
                FlowRouter.go(context.path)
            } else if (context.path != '/login') {
                //用于登陆后回调  登陆应该以dispatch message方式
                Session.set('redirectAfterLogin', context.path)
                //var redirectAfterLogin =Session.get('redirectAfterLogin')
                //if(redirectAfterLogin && 'redirectAfterLogin不是login page时'){
                //    FlowRouter.go(redirectAfterLogin)
                //}else{
                //    //to verify
                //    FlowRouter.go('/')
                //}
                FlowRouter.go('/login')
            }
        }

    }]);



    FlowRouter.triggers.exit([function(context){
        //console.log('Router exit: path='+context.path,' name= '+FlowRouter.getRouteName())

        savedRoute = FlowRouter.current().path
        window.scrollTo(0,0)
    }]);



}





// Home Route
DefaultRoutes.route('/', {
    name: "home",
    action: function (p) {
        App.routeHandler(p, {
            pageTitle: "Home",
            headerNav: null,
            leftNavToggle:true, //左侧导航触发按钮
            bodyTmpl: <Cal.Home/>,

            hideBackButton:true,
            leftNavToggle:true
        })
    }
})

DefaultRoutes.route('/ContactInfoPage', {
    name: "ContactInfoPage",
    action: function (p) {
        App.routeHandler(p, {
            pageTitle: "ContactInfoPage",
            headerNav: null,
            leftNavToggle:true, //左侧导航触发按钮
            bodyTmpl: <Cal.ContactInfoPage/>
        })
    }
})




