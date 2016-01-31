/**
 * Created on 9/20/15.
 */


{
    //let ShoppingCart;
    //Dependency.autorun(function () {
    //    ShoppingCart = Dependency.get('classRegister.ShoppingCart.model');
    //});

    //subscribes
    Meteor.subscribe('accountWithSwimmersAndClasses');
    Meteor.subscribe("classes");


    Dependency.add('classRegister.bookTheSameTimePage.store', new function () {

        var self = this;

        //this function may be called in Tracker.autorun and before  DB.Swimmers loaded
        //so should take care
        self.getSwimmers = function () {
            return DB.Swimmers.find({accountId: Meteor.userId()})
        }


        //////////////////////////////////////////////////////
        ///////////////////selection info
        // should reset after add to
        //选中的swimmer
        self.currentSwimmer = new ReactiveVar()
        //当前的level
        self.currentLevel = new ReactiveVar()
        //选中的day
        self.currentDay = new ReactiveVar()
        self.currentTime = new ReactiveVar()
        self.currentClass = new ReactiveVar()
        //当前的步骤
        self.currentStep = new ReactiveVar(1)

        //注册信息
        self.nowClasses =new ReactiveVar([])
        self.registeredClasses =new ReactiveVar([])
        self.historyClasses =new ReactiveVar([])

        self.shoppingCartClasses= new ReactiveVar([])

        self.isFirstTime =new ReactiveVar(false)



        //当前用户正在进行的课程
        //self.currentSwimmerClassesRegisterInfo=new ReactiveVar([]) //当前正在上的课程的注册信息

        self.currentSwimmerClasses = new ReactiveVar([]) //当前正在上的课程的详细信息
        self.currentSwimmerSameClasses = new ReactiveVar([])  //classes for book the same time

        self.currentSwimmerAvaibleSameClasses = new ReactiveVar([]) //除去了购物车已有的项


        self.currentSwimmerType=new ReactiveVar()  //标记当前的类型




        //self.classes= new ReactiveVar({})  //by swimmerId
        //self.classesRegister = new ReactiveVar([])
       //self.swimmerClasses = new ReactiveVar({})
       //self.selectClassView = new ReactiveVar({})  //'bookTheSameTime','common'






        //可选days 依赖于 当前的currentLevel
        self.avaiableDays = new ReactiveVar([])
        //可选时间   依赖于 当前选中的currentDay
        self.avaiableTimes = new ReactiveVar([])


        //Session.set('CART_ID')


        /*
         * 一次流程选择的class信息  3步
         * 使用Immutable库进行对象修改
         * {
         *  swimmer:
         *  class1:{classId, swimmerId}
         *  class2:
         *  class3:
         * }
         * */
        self.selectedClasses = new ReactiveVar(Immutable.Map())


        var undefinedSelectValueOption = {text:'', value: ''};
        var undefinedSelectValue = '';

        //暂存购物车ID 后端会验证其有效性


        function resetDateAndTime() {
            self.currentDay.set(undefinedSelectValue)
            self.currentTime.set(undefinedSelectValue)
        }


        self.tokenId = Dispatcher.register(function (payload) {
            switch (payload.actionType) {

                case "BookTheSameTime_SWIMMER_CHANGE": //选择swimmer  level可能会变
                {
                    let swimmer = payload.swimmer

                    self.currentSwimmer.set(swimmer)

                    //当前swimmer returnback new swimmer区别处理
                    //self.currentLevel.set(App.getNextClassLevel(swimmer.level))

                    self.currentDay.set(undefinedSelectValue)
                    self.currentTime.set(undefinedSelectValue)

                    //var swimmerClasses = self.swimmerClasses.get()
                    //var swimmerId = swimmer._id
                    //if (swimmerClasses && swimmerId) {
                    //    if (swimmerClasses[swimmerId] && swimmerClasses[swimmerId] > 0) {
                    //        self.selectClassView.set('bookTheSameTime')
                    //    } else {
                    //        self.selectClassView.set('common')
                    //    }
                    //
                    //}



                    break;
                }
                case "BookTheSameTime_DAY_CHANGE"://选择day
                {


                    self.currentDay.set(payload.day)
                    self.currentTime.set()
                    break;
                }

                case "BookTheSameTime_TIME_CHANGE"://选择time  确定一个class
                {

                    self.currentTime.set(payload.time)
                    break;
                }


                //sibling 三步  可能是current swimmer BookTheSame time后的选择 也可能是return back用户 也可能是新用户
                case "BookTheSameTime_CLASS_SELECT_FOR_SIBLING"://select确定
                {


                    if (payload.currentStep == 1) {

                        let currentSwimmer = self.currentSwimmer.get()

                        var currentClass;

                        currentClass = self.currentClass.get() //sibling first step


                        let isFistTime = self.isFirstTime.get()



                        Meteor.call('add_class_to_cart', {
                            swimmerId: currentSwimmer._id,
                            classId: currentClass._id,
                            quantity: 1,
                            swimmer: currentSwimmer,
                            class1: currentClass,
                            type:'register-paced',

                            isFistTime:isFistTime

                        }, function (err, result) {

                            if (err) {
                                alert(err.error)
                                return; //todo  prompt
                            }


                            //selectedClasses
                            let map = self.selectedClasses.get()
                            map = map.set('swimmer', currentSwimmer)
                            map = map.set('class1', currentClass)
                            self.selectedClasses.set(map)



                            Session.set('CART_ID', result.cartId)


                            console.log('step1', currentSwimmer, currentClass)

                            self.currentStep.set(2)


                            resetDateAndTime();
                        })


                    }

                    if (payload.currentStep == 2) {

                        let currentClass = self.currentClass.get()

                        let map = self.selectedClasses.get()
                        map = map.set('class2', currentClass)
                        self.selectedClasses.set(map)


                        let swimmer = map.get('swimmer')
                        let class1 = map.get('class1')


                        //ShoppingCart.addClassPreference(2,{
                        //    'swimmer': swimmer,
                        //    'class1':  class1,
                        //    data: currentClass
                        //},function(err,result){
                        //    if(err) return;
                        //
                        //    self.currentStep.set(3),
                        //    resetDateAndTime()
                        //})

                        Meteor.call('add_preference_to_cart', {
                            cartId: Session.get('CART_ID'),

                            preferenceNum: 2,

                            classId: class1._id,
                            swimmerId: swimmer._id,
                            data: currentClass
                        }, function (err) {
                            if (err) return; //todo  prompt

                            console.log('step2', currentClass)


                            self.currentStep.set(3)
                            resetDateAndTime()
                        })


                    }

                    if (payload.currentStep == 3) {

                        //todo unify with currentStep == 2

                        let currentClass = self.currentClass.get()

                        let map = self.selectedClasses.get()
                        map = map.set('class3', currentClass)
                        self.selectedClasses.set(map)


                        let swimmer = map.get('swimmer')
                        let class1 = map.get('class1')

                        //ShoppingCart.addClassPreference(3,{
                        //    'swimmer': swimmer,
                        //    'class1':   class1,
                        //    data:currentClass
                        //},function(err,result){
                        //    if(err) return;
                        //
                        //    FlowRouter.go('/classRegister/SelectClassReady');
                        //
                        //})

                        Meteor.call('add_preference_to_cart', {
                            cartId: Session.get('CART_ID'),

                            preferenceNum: 3,

                            classId: class1._id,
                            swimmerId: swimmer._id,
                            data: currentClass
                        }, function (err) {
                            if (err) return; //todo  prompt

                            console.log('step3', currentClass)

                            var href="/classRegister/BookTheSameTimeSelectClassReady"
                                +"?cartId="+Session.get('CART_ID')
                                +"&swimmerId="+swimmer._id
                                +"&classId="+class1._id
                            FlowRouter.go(href);

                        })

                    }

                    break;
                }

                //正在进行用户 四步  todo和以上合并?
                case "BookTheSameTime_CLASS_SELECT_FOR_CURRENT":{
                    payload


                    if (payload.currentStep == 1) {

                        let currentSwimmer = self.currentSwimmer.get()


                        var currentClass =  payload.selectedClass  // special; book the same time


                        //todo获取一个classId




                        //ShoppingCart.addShoppingItem(
                        //    {
                        //        swimmer: currentSwimmer,
                        //        class1: currentClass
                        //    }
                        //);



                        Meteor.call('add_class_to_cart', {
                            swimmerId: currentSwimmer._id,
                            classId: currentClass._id,
                            quantity: 1,
                            swimmer: currentSwimmer,
                            class1: currentClass,

                            isBookTheSameTime:true,

                            type:'register-paced'
                        }, function (err, result) {

                            if (err) {
                                alert(err.error)
                                return; //todo  prompt
                            }

                            //selectedClasses
                            let map = self.selectedClasses.get()
                            map = map.set('swimmer', currentSwimmer)
                            map = map.set('class1', currentClass)
                            self.selectedClasses.set(map)



                            Session.set('CART_ID', result.cartId)


                            console.log('step1', currentSwimmer, currentClass)

                            //self.currentStep.set('1-1') //
                            self.currentStep.set(2)

                            resetDateAndTime();
                        })


                    }

                    if (payload.currentStep == '1-1'){ //confirm  此步骤后来取消  todo delete


                        self.currentStep.set(2)

                    }

                    if (payload.currentStep == 2) {

                        let currentClass = self.currentClass.get()

                        let map = self.selectedClasses.get()
                        map = map.set('class2', currentClass)
                        self.selectedClasses.set(map)


                        let swimmer = map.get('swimmer')
                        let class1 = map.get('class1')



                        //ShoppingCart.addClassPreference(2,{
                        //    'swimmer': swimmer,
                        //    'class1':  class1,
                        //    data: currentClass
                        //},function(err,result){
                        //    if(err) return;
                        //
                        //    self.currentStep.set(3),
                        //    resetDateAndTime()
                        //})

                        Meteor.call('add_preference_to_cart', {
                            cartId: Session.get('CART_ID'),

                            preferenceNum: 2,

                            classId: class1._id,
                            swimmerId: swimmer._id,
                            data: currentClass
                        }, function (err) {
                            if (err) return; //todo  prompt

                            console.log('step2', currentClass)


                            self.currentStep.set(3)
                            resetDateAndTime()
                        })


                    }

                    if (payload.currentStep == 3) {

                        //todo unify with currentStep == 2

                        let currentClass = self.currentClass.get()

                        let map = self.selectedClasses.get()
                        map = map.set('class3', currentClass)
                        self.selectedClasses.set(map)


                        let swimmer = map.get('swimmer')
                        let class1 = map.get('class1')



                        //ShoppingCart.addClassPreference(3,{
                        //    'swimmer': swimmer,
                        //    'class1':   class1,
                        //    data:currentClass
                        //},function(err,result){
                        //    if(err) return;
                        //
                        //    FlowRouter.go('/classRegister/SelectClassReady');
                        //
                        //})

                        Meteor.call('add_preference_to_cart', {
                            cartId: Session.get('CART_ID'),

                            preferenceNum: 3,

                            classId: class1._id,
                            swimmerId: swimmer._id,
                            data: currentClass
                        }, function (err) {
                            if (err) return; //todo  prompt

                            console.log('step3', currentClass)


                            //FlowRouter.go('/classRegister/BookTheSameTimeSelectClassReady');
                            var href="/classRegister/BookTheSameTimeSelectClassReady"
                                +"?cartId="+Session.get('CART_ID')
                                +"&swimmerId="+swimmer._id
                                +"&classId="+class1._id
                            FlowRouter.go(href);
                        })

                    }



                    break;
                }

                case "componentWillMount_CRBookTheSameTimePage":
                {
                    //
                    console.log('componentWillMount_CRBookTheSameTimePage')
                    //清空上一轮的选择

                    self.currentDay.set(undefinedSelectValue)
                    self.currentTime.set(undefinedSelectValue)
                    self.currentClass.set(null)
                    self.currentStep.set(1)
                    //self.avaiableDays //依赖于 当前的currentLevel
                    //self.avaiableTimes //依赖于 当前选中的currentDay

                    self.selectedClasses.set(Immutable.Map())

                    break;
                }

            }
        });

        /*
         *
         * ********************* wait for ******************
         * wrap in Meteor.startup for Tracker.autorun can run before cellections loaded
         *
         * */

        Meteor.startup(function () {

            //初始化swimmer
            Tracker.autorun(function () {

                var swimmers = self.getSwimmers().fetch()

                if (swimmers.length) {
                    console.log('set currentSwimmer',swimmers[0]._id)

                    self.currentSwimmer.set(swimmers[0])
                    //self.currentLevel.set(App.getNextClassLevel(swimmers[0].level))

                }

            })

            //获取当前swimmer的课数 用于判断swimmer的类型
            //todo case:用户已经注册新的session 但当前session还未结束 用户又去注册正在进行的session
            Tracker.autorun(function () {
                var currentSwimmer = self.currentSwimmer.get()
                var appInfo = DB.App.findOne()

                if(!appInfo) return;
                if(!currentSwimmer) return;

                Tracker.autorun(function () {

                    //var nowClasses = DB.ClassesRegister.find({
                    //    swimmerId: currentSwimmer._id,
                    //    status:'normal',  //不显示cancel中的和 change中的
                    //    sessionId: App.info.sessionNow
                    //}).fetch();

                    var nowClasses =DB.Classes.find({
                        'students.swimmerId':currentSwimmer._id,
                        sessionId: appInfo.sessionNow
                    }).fetch()

                    self.nowClasses.set(nowClasses)
                    console.log('nowClasses',nowClasses)


                    //self.currentSwimmerClassesRegisterInfo.set(currentSwimmerClassesRegisterInfo)


                })
                Tracker.autorun(function () {

                    //var registeredClasses = DB.ClassesRegister.find({
                    //    swimmerId: currentSwimmer._id,
                    //    status:'normal',  //不显示cancel中的和 change中的
                    //    sessionId: App.info.sessionRegister
                    //}).fetch();

                    var registeredClasses =DB.Classes.find({
                        'students.swimmerId':currentSwimmer._id,
                        sessionId: appInfo.sessionRegister
                    }).fetch()


                    self.registeredClasses.set(registeredClasses)
                    console.log('registeredClasses',registeredClasses)


                })
                Tracker.autorun(function () {

                    //var historyClasses=DB.ClassesRegister.find({
                    //    swimmerId: currentSwimmer._id,
                    //    status:'normal',  //不显示cancel中的和 change中的
                    //    sessionId:{$nin:[ App.info.sessionNow , App.info.sessionRegister]}
                    //
                    //}).fetch();

                    var historyClasses =DB.Classes.find({
                        'students.swimmerId':currentSwimmer._id,
                        sessionId:{$nin:[ appInfo.sessionNow , appInfo.sessionRegister]}
                    }).fetch()


                    self.historyClasses.set(historyClasses)
                    console.log('historyClasses',historyClasses)


                })

                //shoppingCartClasses
                Tracker.autorun(function () {

                    var shoppingCart= DB.ShoppingCart.findOne({
                        status:'active',
                        type:'register'
                    })

                    var classItems=[];
                    if(shoppingCart && shoppingCart.items.length){
                        classItems = _.filter(shoppingCart.items,function(item){
                            return item.class1 && item.class2 && item.class3   //完整的注册
                                &&  item.swimmerId == currentSwimmer._id

                        })
                    }

                    self.shoppingCartClasses.set(classItems)
                    console.log('shoppingCartClasses',classItems)

                })

            })

            //判断swimmer是不是第一次注册
            Tracker.autorun(function () {
                let nowClasses =self.nowClasses.get()
                let registeredClasses =self.registeredClasses.get()

                let historyClasses =self.historyClasses.get()

                let shoppingCartClasses =self.shoppingCartClasses.get()


                if(nowClasses.length==0
                    && registeredClasses.length ==0
                    && historyClasses.length ==0
                //&& shoppingCartClasses.length>0
                ){

                    self.isFirstTime.set(true)
                }else{
                    self.isFirstTime.set(false)
                }


            })


            //确定课程注册level
            //对于return back 和 new swimmer  Level即当前level
            //对于正在游的level＋1
            Tracker.autorun(function(){
                var nowClasses =self.nowClasses.get()
                var currentSwimmer = self.currentSwimmer.get()

                if(!currentSwimmer) return;

                //当前session正在游
                if(nowClasses.length>0){
                    self.currentLevel.set(App.getNextClassLevel(currentSwimmer.level))

                }else{
                    self.currentLevel.set(currentSwimmer.level)
                }

            })

            //days depend on level of swimmer
            Tracker.autorun(function () {
                //if (!DB.Classes) return;
                var level = self.currentLevel.get();
                //var appInfo = DB.App.findOne()

                //if(!appInfo || !level) return;

                var selectedSession = Session.get('selectedSession')
                if (!selectedSession) return;


                let classesAllByLevel =DB.Classes.find({
                    sessionId: App.info.sessionRegister, //level session
                    levels: level
                }).fetch()

                let classesHasSeatByLevel = DB.Classes.find({
                    sessionId: selectedSession, //level session
                    levels: level,
                    seatsRemain:{$gt:0}
                }).fetch()


                var currentStep = self.currentStep.get()

                if(1==currentStep){
                    classes=classesHasSeatByLevel

                }else{
                    classes=classesAllByLevel  //第二步和三不考虑是否有空位
                }



                //
                classes = _.uniq(classes, function (item, key, a) {
                    return item.day;
                });

                let days = classes.map(function (v, n) {
                    return {text: App.Config.week[v.day], value: v.day}
                })

                days.sort(function (a, b) {
                    return (a.value - b.value);
                })

                //add an empty value to prevent browser init select value  use the first item
                days.unshift(undefinedSelectValueOption)

                self.avaiableDays.set(days)

                //设置默认值
                //if (days.length) {
                //    self.currentDay.set(days[0].value)
                //}

            });

            /// time depend on day
            Tracker.autorun(function () {
                //if (!DB.Classes) return;

                var currentDay = self.currentDay.get();
                //var appInfo = DB.App.findOne()
                //
                //if(!appInfo) return;

                var selectedSession = Session.get('selectedSession')
                if (!selectedSession) return;


                var level
                Tracker.nonreactive(function () {
                    level = self.currentLevel.get()
                });

                let classes = DB.Classes.find({
                    sessionId: selectedSession, // session level day
                    levels: level,
                    day: currentDay,
                    seatsRemain:{$gt:0}
                }).fetch()

                let classesAll = DB.Classes.find({
                    sessionId: selectedSession, // session level day
                    levels: level,
                    day: currentDay,
                }).fetch()

                //第二步和三不考虑是否有空位
                var currentStep = self.currentStep.get()
                if(2==currentStep || 3==currentStep){
                    classes=classesAll
                }


                let times = classes.map(function (v, n) {
                    return {
                        text: App.num2time(v.startTime) + "-" + App.num2time(v.endTime),
                        value: v.startTime
                    }
                })
                times.sort(function (a, b) {
                    return (a.value - b.value);
                })

                //add an empty value to prevent browser init select value  use the first item
                times.unshift(undefinedSelectValueOption)

                self.avaiableTimes.set(times)

                //初始化time
                //if (times.length) {
                //    self.currentTime.set(times[0].value)
                //}


            });

            //time确定后class就确定了
            //level + day+ time  确定一个class
            Tracker.autorun(function () {
                //if (!DB.Classes) return;

                let time = self.currentTime.get()
                //let appInfo = DB.App.findOne()
                //
                //if(!appInfo) return;


                var selectedSession = Session.get('selectedSession')
                if (!selectedSession) return;


                let level
                let day
                Tracker.nonreactive(function () {
                    level = self.currentLevel.get()
                    day = self.currentDay.get()
                });



                var theClass;
                var currentStep = self.currentStep.get()
                if(1==currentStep ){
                    theClass = DB.Classes.find({
                        sessionId: selectedSession, // session level day
                        levels: level,
                        day: day,
                        startTime: time,
                        seatsRemain:{$gt:0}
                    }).fetch()
                }else{
                    theClass = DB.Classes.find({
                        sessionId: selectedSession, // session level day
                        levels: level,
                        day: day,
                        startTime: time,
                    }).fetch()
                }



                if (theClass[0]) {
                    self.currentClass.set(theClass[0])
                }


            });




            /*
             若无sameclass 显示正常选择页

            * */
            Tracker.autorun(function () {
                //App.info = App.info || DB.App.findOne()
                var nowClasses= self.nowClasses.get()

                var currentLevel = self.currentLevel.get()

               // if(!App.info) return;
                if(!currentLevel) return;

                var selectedSession = Session.get('selectedSession')
                if (!selectedSession) return;



                Tracker.autorun(function () {//获取当前class详细信息

                    var ids=[]
                    _.each(nowClasses,function(item){
                        ids.push(item._id)
                    })
                    var currentClasses =  DB.Classes.find({
                        _id:{$in:ids}
                    }).fetch()

                    self.currentSwimmerClasses.set(currentClasses)


                     //console.log(currentClasses)

                    Tracker.autorun(function () {//获取类似class
                        var sameClasses =[]

                        _.each(currentClasses,function(currentClass){

                            var sameClass = DB.Classes.findOne({
                                sessionId: selectedSession,
                                levels:currentLevel,

                                day:currentClass.day,
                                startTime:currentClass.startTime,
                                seatsRemain:{$gt:0}
                            })

                            if(sameClass){
                                sameClasses.push(sameClass)
                            }

                        })

                        self.currentSwimmerSameClasses.set(sameClasses)

                        console.log('currentSwimmerSameClasses',sameClasses)

                    })


                })



            })


            //sameclass 已在购物车中则不显示该项
            //sameclass 除去购物车已有的后数目为0 则显示正常选择页面
            //若已经注册过该class 也要除去
            //由于bookthesametime 在一个流程的第一步 所以不需考虑重复 后面的步骤需要考虑
            Tracker.autorun(function (){

                var currentSwimmer = self.currentSwimmer.get()
                var currentSwimmerSameClasses = self.currentSwimmerSameClasses.get() //can be []

                var registeredClasses = self.registeredClasses.get()
                var shoppingCartClasses= self.shoppingCartClasses.get()


                if(!currentSwimmer) return;


                var registeredClassesIds = registeredClasses.map(function(item){
                    return item._id
                });
                var shoppingCartClassesIds = shoppingCartClasses.map(function(item){
                    return item._id
                })

                var exceptionIds=_.union(registeredClassesIds,shoppingCartClassesIds)

                console.log('registeredClasses',registeredClassesIds)
                console.log('shoppingCartClasses',shoppingCartClassesIds)
                console.log('exceptionIds',exceptionIds)




                var avaibleSameClasses = _.filter(currentSwimmerSameClasses,function(item){
                    return exceptionIds.indexOf(item._id)==-1
                })
                self.currentSwimmerAvaibleSameClasses.set(avaibleSameClasses)


                console.log('currentSwimmerAvaibleSameClasses',avaibleSameClasses)


                //avaibleSameClasses


            })


            //view  bookthesame time or common
            Tracker.autorun(function () {
                var avaibleSameClasses = self.currentSwimmerAvaibleSameClasses.get()

                if(avaibleSameClasses.length>0){
                    self.currentSwimmerType.set('swimmer-ongoing')
                }else{
                    self.currentSwimmerType.set('swimmer-sibling')
                }
            })







        })


    });
}