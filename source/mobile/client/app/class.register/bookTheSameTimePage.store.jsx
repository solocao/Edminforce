/**
 * Created on 9/20/15.
 */


{
    let ShoppingCart;
    Dependency.autorun(function () {
        ShoppingCart = Dependency.get('classRegister.ShoppingCart.model');
    });


    Dependency.add('classRegister.bookTheSameTimePage.store', new function () {

        var self = this;


        //this function may be called in Tracker.autorun and before  DB.Swimmers loaded
        //so should take care
        self.getSwimmers = function () {
            return DB.Swimmers.find({accountId: 'account1'})
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


        //可选days 依赖于 当前的currentLevel
        self.avaiableDays = new ReactiveVar([])
        //可选时间   依赖于 当前选中的currentDay
        self.avaiableTimes = new ReactiveVar([])


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


        var undefinedSelectValue = {value: undefined};

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
                    self.currentLevel.set(swimmer.level)

                    debugger

                    break;
                }
                case "BookTheSameTime_DAY_CHANGE"://选择day
                {
                    debugger

                    self.currentDay.set(payload.day)
                    break;
                }

                case "BookTheSameTime_TIME_CHANGE"://选择time  确定一个class
                {
                    debugger
                    self.currentTime.set(payload.time)
                    break;
                }


                case "BookTheSameTime_CLASS_SELECT"://select确定
                {
                    debugger

                    if (payload.currentStep == 1) {

                        let currentSwimmer = self.currentSwimmer.get()
                        let currentClass = self.currentClass.get()


                        //selectedClasses
                        let map = self.selectedClasses.get()
                        map = map.set('swimmer', currentSwimmer)
                        map = map.set('class1', currentClass)
                        self.selectedClasses.set(map)


                        ShoppingCart.addShoppingItem(
                            {
                                swimmer: currentSwimmer,
                                class1: currentClass
                            }
                        );

                        self.currentStep.set(2)
                        resetDateAndTime();

                    }

                    if (payload.currentStep == 2) {

                        let currentClass = self.currentClass.get()

                        let map = self.selectedClasses.get()
                        map = map.set('class2', currentClass)
                        self.selectedClasses.set(map)


                        let swimmer = map.get('swimmer')
                        let class1 =map.get('class1')


                        ShoppingCart.addClassPreference(2,{
                            'swimmer': swimmer,
                            'class1':  class1,
                            data: currentClass
                        },function(err,result){
                            if(err) return;

                            self.currentStep.set(3),
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
                        let class1 =map.get('class1')

                        ShoppingCart.addClassPreference(3,{
                            'swimmer': swimmer,
                            'class1':   class1,
                            data:currentClass
                        },function(err,result){
                            if(err) return;

                            FlowRouter.go('/classRegister/SelectClassReady');

                        })

                    }

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
            //初始化swimmer and level
            Tracker.autorun(function () {
                //if(!DB.Swimmers) return;

                var swimmers = self.getSwimmers().fetch()
                if (swimmers.length) {
                    self.currentSwimmer.set(swimmers[0])
                    self.currentLevel.set(swimmers[0].level) //todo real logic
                }

            })

            //days depend on level of swimmer
            Tracker.autorun(function () {
                if (!DB.Classes) return;

                var level = self.currentLevel.get();


                //todo  计算可用数目报名数
                let classes = DB.Classes.find({
                    sessionId: 'testSession2', //level session
                    level: level
                }).fetch()

                //debugger
                classes = _.uniq(classes, function (item, key, a) {
                    return item.day;
                });

                let days = classes.map(function (v, n) {
                    return {text: App.Config.week[v.day], value: v.day}
                })

                //add an empty value to prevent browser init select value  use the first item
                days.unshift({value: undefined})

                self.avaiableDays.set(days)

                //设置默认值
                //if (days.length) {
                //    self.currentDay.set(days[0].value)
                //}

            });

            /// time depend on day
            Tracker.autorun(function () {
                if (!DB.Classes) return;

                var currentDay = self.currentDay.get();

                var level = self.currentLevel.get()

                let classes = DB.Classes.find({
                    sessionId: 'testSession2', // session level day
                    level: level,
                    day: currentDay
                }).fetch()

                let times = classes.map(function (v, n) {
                    return {
                        text: App.num2time(v.startTime) + "-" + App.num2time(v.endTime),
                        value: v.startTime
                    }
                })

                //add an empty value to prevent browser init select value  use the first item
                times.unshift({value: undefined})

                self.avaiableTimes.set(times)

                //初始化time
                //if (times.length) {
                //    self.currentTime.set(times[0].value)
                //}

            });

            //time确定后class就确定了
            //level + day+ time  确定一个class
            Tracker.autorun(function () {
                if (!DB.Classes) return;

                let time = self.currentTime.get()

                let level = self.currentLevel.get()
                let day = self.currentDay.get()


                let theClass = DB.Classes.find({
                    sessionId: 'testSession2', // session level day
                    level: level,
                    day: day,
                    startTime: time
                }).fetch()

                if (theClass[0]) {
                    self.currentClass.set(theClass[0])
                }

            });
        })


    });
}