let TIME = [
    '08:00AM', '08:15AM',
    '08:30AM', '08:45AM',
    '09:00AM', '09:15AM',
    '09:30AM', '09:45AM',
    '10:00AM', '10:15AM',
    '10:30AM', '10:45AM',
    '11:00AM', '11:15AM',
    '11:30AM', '11:45AM',
    '12:00PM', '12:15PM',
    '12:30PM', '12:45PM',
    '01:00PM', '01:15PM',
    '01:30PM', '01:45PM',
    '02:00PM', '02:15PM',
    '02:30PM', '02:45PM',
    '03:00PM', '03:15PM',
    '03:30PM', '03:45PM',
    '04:00PM', '04:15PM',
    '04:30PM', '04:45PM',
    '05:00PM', '05:15PM',
    '05:30PM', '05:45PM',
    '06:00PM', '06:15PM',
    '06:30PM', '06:45PM',
    '07:00PM', '07:15PM',
    '07:30PM', '07:45PM',
    '08:00PM', '08:15PM',
    '08:30PM'
];

KUI.Class_comp_add = class extends KUI.Page{

    constructor(p){
        super(p);
        this.m = KG.DataHelper.getDepModule();

        this.C = {
            Program : util.getModuleName('Program'),
            Session : util.getModuleName('Session'),
            AdminUser : util.getModuleName('AdminUser'),
            ClassLevel : util.getModuleName('ClassLevel')
        };
    }

    getProgramData(){

        return this.m.Program.getDB().find({}, {sort:{
            createTime : -1
        }}).fetch();
    }
    getSessionData(){

        return this.m.Session.getDB().find({}, {
            sort : {
                updateTime : -1
            }
        }).fetch();
    }

    getMeteorData(){


        let x1 = Meteor.subscribe(this.C.Program),
            x2 = Meteor.subscribe(this.C.Session, {
                query : {
                    registrationStatus : 'Yes'
                }
            });

        let x3 = Meteor.subscribe(this.C.AdminUser, {
            query : {
                role : 'teacher',
                status : 'active'
            }
        });

        let x4 = Meteor.subscribe(this.C.ClassLevel);


        return {
            ready : x1.ready() && x2.ready() && x3.ready() && x4.ready(),
            program : this.getProgramData(),
            session : this.getSessionData(),
            teacherList : this.m.AdminUser.getDB().find({status : 'active'}).fetch(),
            classLevelList : this.m.ClassLevel.getDB().find({}).fetch()
        };
    }

    getReactObj(){

        return {
            name : this.refs.name,
            program : this.refs.program,
            session : this.refs.session,
            status : this.refs.status,
            teacher : this.refs.teacher,
            len : this.refs.lengthOfClass,
            number : this.refs.numberOfClass,
            maxAge : this.refs.maxAge,
            minAge : this.refs.minAge,
            level : this.refs.level,
            gender : this.refs.gender,
            trial : this.refs.trialStudent,
            min : this.refs.minStudent,
            max : this.refs.maxStudent,
            tuitionMoney : this.refs.tuitionMoney,
            tuitionType : this.refs.tuitionType,
            scheduleDay : this.refs.scheduleDay,
            scheduleTime : this.refs.scheduleTime,

            makeup : this.refs.makeupStudent,
            makeupFee : this.refs.makeupFee
        };
    }

    getValue(){
        let {
            name, program, session, status, teacher, len, number, maxAge, minAge,
            level, gender, trial, min, max, tuitionMoney, tuitionType, scheduleDay, scheduleTime,
            makeup, makeupFee
            } = this.getReactObj();

        let data = {
            name : '',
            programID : program.getValue(),
            sessionID : session.getValue(),
            status : status.getValue(),
            teacher : teacher.getValue(),
            length : len.getValue(),
            maxAgeRequire : maxAge.getValue(),
            minAgeRequire : minAge.getValue(),
            levels : level.getValue(),
            genderRequire : gender.getValue(),
            trialStudent : trial.getValue(),
            minStudent : min.getValue(),
            maxStudent : max.getValue(),
            makeupStudent : makeup.getValue(),
            tuition : {
                type : tuitionType.getValue(),
                money : tuitionMoney.getValue()
            },
            schedule : {
                days : scheduleDay.getValue(),
                time : scheduleTime.getValue()
            },
            makeupClassFee : makeupFee.getValue()
        };

        let stmp = this.m.Session.getDB().findOne({_id : data.sessionID});
        data.numberOfClass = this.m.Class.calculateNumberOfClass(data, stmp);

        let tmp = _.find(this.data.teacherList, (t)=>{
            return t.nickName === data.teacher;
        });
        if(tmp){
            data.teacherID = tmp._id;
        }


        return data;
    }

    reset(){
        let {
            name, program, session, status, teacher, len, number, maxAge, minAge,
            level, gender, trial, min, max, tuitionMoney, tuitionType, scheduleDay, scheduleTime,
            makeup, makeupFee
            } = this.getReactObj();
        let opt = this.getSelectOption();
        program.getInputDOMNode().value = opt.program[0]._id;
        session.getInputDOMNode().value = opt.session[0]._id;
        status.getInputDOMNode().value = opt.status[0];
        teacher.getInputDOMNode().value = '';
        len.getInputDOMNode().value = opt.lengthOfClass[0];
        maxAge.getInputDOMNode().value = '';
        minAge.getInputDOMNode().value = '';

        util.getReactJQueryObject(level.getInputDOMNode()).val('');

        gender.getInputDOMNode().value = opt.gender[0];
        trial.getInputDOMNode().value = '';
        min.getInputDOMNode().value = '';
        max.getInputDOMNode().value = '';
        tuitionMoney.getInputDOMNode().value = '';
        tuitionType.getInputDOMNode().value = opt.tuitionType[0];
        util.getReactJQueryObject(scheduleDay.getInputDOMNode()).val([opt.scheduleDay[1],opt.scheduleDay[2],opt.scheduleDay[3],opt.scheduleDay[4]]);
        scheduleTime.getInputDOMNode().value = opt.scheduleTime[0];
        makeup.getInputDOMNode().value = '';
        makeupFee.getInputDOMNode().value = '';
    }

    getSelectOption(){
        return {
            program : this.data.program,
            session : this.data.session,
            status : KG.get('EF-Class').getDBSchema().schema('status').allowedValues,
            lengthOfClass : ['30 min', '45 min', '1 hr', '1.5 hr', '2 hr'],
            scheduleDay : KG.get('EF-Class').getDBSchema().schema('schedule.day').allowedValues,
            scheduleTime : TIME,
            tuitionType : KG.get('EF-Class').getDBSchema().schema('tuition.type').allowedValues,
            level : this.data.classLevelList,
            gender : KG.get('EF-Class').getDBSchema().schema('genderRequire').allowedValues,
            teacher : this.data.teacherList
        };
    }


    render(){

        if(!this.data.ready){
            return util.renderLoading();
        }

        let edit = this.props.edit ? true : false;

        let p = {
            name : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'name',
                label : 'Class Name',
                placeholder : '',
                disabled : true
            },
            program : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'program',
                label : 'Program',
                disabled : edit
            },
            session : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'session',
                label : 'Session',
                disabled : edit
            },
            status : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'status',
                label : 'Status'
            },
            teacher : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'teacher',
                label : 'Teacher'
            },

            lengthOfClass : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'lengthOfClass',
                label : 'Length Of Class'
            },
            numberOfClass : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'numberOfClass',
                label : 'Number Of Class',
                placeholder : 'automatic calculation',
                disabled : true
            },
            maxAge : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'maxAge',
                label : 'Maximum Age'
            },
            minAge : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'minAge',
                label : 'Minimum Age'
            },

            scheduleDay : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'scheduleDay',
                label : 'Day',
                disabled : edit,
                multiple : true
            },
            scheduleTime : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'scheduleTime',
                label : 'Time'
                //disabled : edit
            },
            tuitionMoney : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'tuitionMoney',
                label : 'Tuition'
            },
            tuitionType : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'tuitionType',
                label : ' ',
                disabled : true
            },
            level : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'level',
                label : 'Level',
                multiple : true
            },

            minStudent : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'minStudent',
                label : 'Minimum Student'
            },
            maxStudent : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'maxStudent',
                label : 'Maximum Student'
            },
            gender : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'gender',
                label : 'Gender'
            },
            trialStudent : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'trialStudent',
                label : 'Trial Maximum'
            },
            makeupStudent : {
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8',
                ref : 'makeupStudent',
                label : 'Makeup Maximum'
            },
            makeupFee : {
                label : 'Make up fee ($)',
                ref : 'makeupFee',
                labelClassName : 'col-xs-4',
                wrapperClassName : 'col-xs-8'
            }

        };

        let option = this.getSelectOption();
console.log(option)
        let dis = {
            display : (edit ? 'none' : 'block')
        };

        return (
            <RB.Row>
                <form className="form-horizontal">
                    <RB.Col md={6} mdOffset={0}>
                        {false ? <RB.Input type="text" {... p.name} /> : null}

                        <RB.Input type="select" {... p.status}>
                            {
                                _.map(option.status, (item, index)=>{
                                    return <option key={index} value={item}>{item}</option>;
                                })
                            }
                        </RB.Input>

                        <div style={dis}>
                            <RB.Input type="select" {... p.session}>
                                {
                                    _.map(option.session, (item, index)=>{
                                        return <option key={index} value={item._id}>{item.name}</option>;
                                    })
                                }
                            </RB.Input>
                        </div>

                        <RB.Input type="select" {... p.scheduleDay}>
                            {
                                _.map(option.scheduleDay, (item, index)=>{
                                    return <option key={index} value={item}>{item}</option>;
                                })
                            }
                        </RB.Input>
                        <RB.Input type="select" {... p.scheduleTime}>
                            {
                                _.map(option.scheduleTime, (item, index)=>{
                                    return <option key={index} value={item}>{item}</option>;
                                })
                            }
                        </RB.Input>



                        {false ? <RB.Input type="text" {... p.numberOfClass} /> : ''}



                        <RB.Input type="text" {... p.minAge} />

                        <RB.Input type="text" {... p.tuitionMoney} />




                        <RB.Input type="text" {... p.minStudent} />

                        <RB.Input type="text" {... p.trialStudent} />

                        <RB.Input type="text" {... p.makeupStudent} />


                        <RB.Input type="select" {... p.gender}>
                            {
                                _.map(option.gender, (item, index)=>{
                                    return <option key={index} value={item}>{item}</option>;
                                })
                            }
                        </RB.Input>


                    </RB.Col>

                    <RB.Col md={6} mdOffset={0}>
                        <div style={dis}>
                            <RB.Input type="select" {... p.program}>
                                {
                                    _.map(option.program, (item, index)=> {
                                        return <option key={index} value={item._id}>{item.name}</option>;
                                    })
                                }
                            </RB.Input>
                        </div>

                        <RB.Input type="select" {... p.teacher}>
                            {
                                _.map(option.teacher, (item, index)=>{
                                    return <option key={index} value={item.nickName}>{item.nickName}</option>;
                                })
                            }
                        </RB.Input>

                        <RB.Input type="select" {... p.level}>
                            {
                                _.map(option.level, (item, index)=>{
                                    return <option key={index} value={item._id}>{item.name}</option>;
                                })
                            }
                        </RB.Input>


                        <RB.Input type="select" {... p.lengthOfClass}>
                            {
                                _.map(option.lengthOfClass, (item, index)=>{
                                    return <option key={index} value={item}>{item}</option>;
                                })
                            }
                        </RB.Input>


                        <RB.Input type="text" {... p.maxAge} />


                        <RB.Input type="select" {... p.tuitionType}>
                            {
                                _.map(option.tuitionType, (item, index)=>{
                                    return <option key={index} value={item}>{`per ${item}`}</option>;
                                })
                            }
                        </RB.Input>

                        <RB.Input type="text" {... p.maxStudent} />

                        <div style={{height:'50px'}}></div>
                        <RB.Input type="text" {... p.makeupFee} />



                    </RB.Col>
                </form>
            </RB.Row>
        );
    }


    setValue(data){
        let {
            name, program, session, status, teacher, len, number, maxAge, minAge,
            level, gender, trial, min, max, tuitionMoney, tuitionType, scheduleDay, scheduleTime,
            makeup, makeupFee
            } = this.getReactObj();
        console.log(data.teacher);
        //name.getInputDOMNode().value = data.nickName;
        program.getInputDOMNode().value = data.programID;
        session.getInputDOMNode().value = data.sessionID;
        status.getInputDOMNode().value = data.status;
        teacher.getInputDOMNode().value = data.teacher || '';
        len.getInputDOMNode().value = data.length;
        //number.getInputDOMNode().value = data.numberOfClass;
        maxAge.getInputDOMNode().value = data.maxAgeRequire || 0;
        minAge.getInputDOMNode().value = data.minAgeRequire || 0;

        util.getReactJQueryObject(level.getInputDOMNode()).val(_.map(data.levels, (l)=>{return l._id;}));

        gender.getInputDOMNode().value = data.genderRequire;
        trial.getInputDOMNode().value = data.trialStudent || '';
        min.getInputDOMNode().value = data.minStudent || '';
        max.getInputDOMNode().value = data.maxStudent || '';
        tuitionMoney.getInputDOMNode().value = data.tuition.money || '';
        tuitionType.getInputDOMNode().value = data.tuition.type;
        util.getReactJQueryObject(scheduleDay.getInputDOMNode()).val(data.schedule.days);
        scheduleTime.getInputDOMNode().value = data.schedule.time.replace(/ /g, '').toUpperCase();
        makeup.getInputDOMNode().value = data.makeupStudent || '';
        makeupFee.getInputDOMNode().value = data.makeupClassFee;
    }

    runOnceAfterDataReady(){
console.log(this.props['init-data'])
        if(this.props['init-data']){
            this.setValue(this.props['init-data']);
        }
        else{
            this.reset();
        }
    }
};


KUI.Class_add = class extends RC.CSS{



    render(){
        if(!util.user.checkPermission('class', 'view')){
            return util.renderNoViewPermission();
        }

        const sy = {
            rd : {
                textAlign : 'right'
            },
            ml : {
                marginLeft : '20px'
            }
        };

        return (
            <RC.Div>
                <h3>Add Class</h3>
                <hr/>
                <KUI.Class_comp_add ref="form"></KUI.Class_comp_add>

                <RC.Div style={sy.rd}>
                    <KUI.NoButton onClick={this.resetAddBox.bind(this)} label="Reset"></KUI.NoButton>
                    <KUI.YesButton style={sy.ml} onClick={this.save.bind(this)} label="Add"></KUI.YesButton>
                </RC.Div>

            </RC.Div>
        );
    }

    resetAddBox(){
        this.refs.form.reset();
    }

    save(){
        let data = this.refs.form.getValue();
        console.log(data);

        let rs = KG.get('EF-Class').insert(data);
        KG.result.handle(rs, {
            success : function(json){
                console.log(json);
                alert('insert success');
                util.goPath('/program/class');
            },
            error : function(err, error){
                util.message.publish('KG:show-error-message', {
                    error : error.statusText
                });
            }
        });
    }

};
