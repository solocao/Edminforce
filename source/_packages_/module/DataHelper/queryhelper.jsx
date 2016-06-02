
let Base = KG.getClass('Base');
KG.define('EF-DataHelper', class extends Base{
    _initDB(){}

    getDepModule(){
        return {
            ClassStudent : KG.get('EF-ClassStudent'),
            Class : KG.get('EF-Class'),
            Student : KG.get('EF-Student'),
            Customer : KG.get('EF-Customer'),
            Order : KG.get('EF-Order'),
            Program : KG.get('EF-Program'),
            Session : KG.get('EF-Session'),
            AdminUser : KG.get('EF-AdminUser'),
            Coupon : KG.get('EF-Coupon'),
            School : KG.get('EF-School'),
            StudentComment : KG.get('EF-StudentComment')
        };

    }

    getCustomerByClassData(classData){
        let m = this.getDepModule();
        let list = m.ClassStudent.getAll({classID:classData._id});

        let rs = [];
        _.each(list, (doc)=>{
            let so = m.Student.getDB().findOne({_id : doc.studentID});

            let co = m.Customer.getDB().findOne({_id : so.accountID});

            rs.push(co);
        });

        return rs;
    }

    defineMeteorMethod(){
        return {
            getFinanceReport(opts){
                let m = this.getDepModule();

                let result = [];

                // date is moment object
                let zone = m.School.getDB().findOne().timezone || 0;
                let loop = (date)=>{
                    let min = date.clone().hour(0).minute(0).second(0),
                        max = date.clone().hour(23).minute(59).second(59);
                    console.log(date.format(), min.format(), max.format());
                    let query = {
                        status : 'success',
                        //type : {$in:['register class', 'change class', 'cancel class', 'makeup class', 'cancel makeup', 'change school credit']},
                        paymentType : {
                            $in : ['credit card', 'echeck', 'check', 'cash']
                        },
                        updateTime : {
                            '$gte' : min.toDate(),
                            '$lte' : max.toDate()
                        }
                    };

                    let data = m.Order.getDB().find(query).fetch();

                    let rs = {
                        //[amount, paymentTotal]
                        'credit card' : [0, 0],
                        'echeck' : [0, 0],
                        'cash' : [0, 0],
                        'check' : [0, 0],
                        detail : [],
                        total : []
                    };
                    let total = [0, 0];
                    _.each(data, (item)=>{
                        if(_.isUndefined(rs[item.paymentType])){
                            rs[item.paymentType] = [0, 0];
                        }

                        rs.detail = rs.detail.concat(item.details);

                        rs[item.paymentType][0] += parseFloat(item.paymentTotal);
                        rs[item.paymentType][1] += parseFloat(item.paymentTotal)+parseFloat(item.discount);

                        total[0] += parseFloat(item.paymentTotal);
                        total[1] += parseFloat(item.paymentTotal)+parseFloat(item.discount);


                    });

                    rs.total = total;

                    _.each(rs, function(val, key){
                        if(key === 'detail') return true;
                        if(val[0]){
                            rs[key][0] = val[0].toFixed(2);
                        }
                        if(val[1]){
                            rs[key][1] = val[1].toFixed(2);
                        }

                    });

                    rs.date = date.clone().toDate();

                    result.push(rs);
                };

                let start = moment(opts.startDate, KG.const.dateFormat).utcOffset(zone),
                    end = moment(opts.endDate, KG.const.dateFormat).add(1, 'days').utcOffset(zone);
console.log(start.format(), end.format());
                do{
                    loop(start);
                    start = start.add(1, 'days');
                }while(end.isAfter(start, 'day'));

                return result;
            },

            getFinanceDetailByDate(date){
                let m = KG.DataHelper.getDepModule();

                let zone = m.School.getDB().findOne().timezone || 0;
                date = moment(date, KG.const.dateFormat).utcOffset(zone);
                let min = date.clone().hour(0).minute(0).second(0),
                    max = date.clone().hour(23).minute(59).second(59);
                console.log(date.format(), min.format(), max.format());
                let query = {
                    status : 'success',
                    paymentType : {
                        $in : ['credit card', 'echeck', 'check', 'cash']
                    },
                    updateTime : {
                        '$gte' : min.toDate(),
                        '$lte' : max.toDate()
                    }
                };

                let result = [];
                let data = m.Order.getDB().find(query, {
                    sort : {
                        updateTime : -1
                    }
                }).fetch();


                _.each(data, (item)=>{
                    var csID = _.last(item.details);
                    if(!csID) return true;

                    if(item.type !== 'change class'){
                        csID = item.details;
                    }
                    else{
                        csID = [csID];
                    }

                    console.log(csID);
                    _.each(csID, (id)=>{
                        let cs = m.ClassStudent.getDB().findOne({
                            _id : id
                            //status : 'checkouted'
                        });
                        if(!cs) return true;
                        let student = m.Student.getAll({_id : cs.studentID})[0],
                            cls = m.Class.getAll({_id : cs.classID})[0];
                        cs.student = student;
                        cs.class = cls;
                        cs.order = item;

                        cs.dateline = moment(new Date(item.updateTime)).format('MM/DD/YYYY HH:mm:ss');

                        result.push(cs);
                    });


                });

                return result;
            },

            getStudentReport(opts){
                let m = this.getDepModule();

                let date = moment(opts.date),
                    week = date.day(),
                    min = date.hour(0).minute(0).second(0).clone(),
                    max = date.hour(23).minute(59).second(59).clone();

                week = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][week];
                let query = {
                    'schedule.day' : week
                };
                if(opts.teacher){
                    query.teacher = opts.teacher;
                }
                if(opts.programID){
                    query.programID = opts.programID;
                }

                let classData = m.Class.getAll(query),
                    rs = {};

                let format = 'YYYYMMDD';
                _.each(classData, (item)=>{

                    let cld = m.Class.getClassLessonDate(item);
                    let tmp = _.find(cld, function(one){
                        return moment(one).format(format) === min.format(format);
                    });
                    if(!tmp) return true;



                    let tp = m.ClassStudent.getAll({
                        classID : item._id,
                        type : 'register',
                        status : {'$in' : ['pending', 'checkouted']}
                    });

                    let trail = m.ClassStudent.getAll({
                        classID : item._id,
                        type : {'$in' : ['trial', 'makeup']},
                        status : {'$in' : ['checkouted']},
                        lessonDate : {
                            '$gte' : min.clone().subtract(2, 'days').toDate(),
                            '$lt' : max.clone().add(2, 'days').toDate()
                        }
                    });

                    let cs = [];
                    cs = tp.concat(trail);

                    cs = _.map(cs, (one)=>{
                        one.student = m.Student.getAll({
                            _id : one.studentID
                        })[0];
                        return one;
                    });

                    rs[item._id] = {
                        classData : item,
                        list : cs
                    };
                });

                return rs;
            },

            getCouponReport(filter={}, option={}){
                let m = this.getDepModule();

                //filter = KG.util.setDBQuery(query);
                option = KG.util.setDBOption(option);
                let query = {
                    status : 'success',
                    '$or' : [
                        {
                            couponID : {$exists : true}
                        },
                        {
                            customerCouponID : {$exists : true}
                        }
                    ]
                };

                if(filter.source){
                    query.paymentSource = filter.source;
                }
                if(filter.coupon){
                    query['$or'] = [
                        {couponID : filter.coupon},
                        {customerCouponID : filter.coupon}
                    ];
                }

                if(filter.startDate || filter.endDate){
                    query.updateTime = {};
                }
                if(filter.startDate){
                    query.updateTime['$gte'] = filter.startDate;
                }
                if(filter.endDate){
                    query.updateTime['$lte'] = filter.endDate;
                }

                let list = m.Order.getDB().find(query, option).fetch(),
                    total = m.Order.getDB().find(query).count();

                list = _.map(list, function(item){
                    item.student = m.Student.getDB().findOne({_id : item.studentID});
                    item.customer = m.Customer.getDB().findOne({_id : item.accountID});

                    let cid = item.couponID || item.customerCouponID;
                    item.couponID = cid;
                    //item.coupon = m.Coupon.getDB().findOne({_id : cid});

                    return item;
                });

                return {list, total};
            }
        };
    }
});


Meteor.startup(function(){
    KG.DataHelper = KG.create('EF-DataHelper');
});