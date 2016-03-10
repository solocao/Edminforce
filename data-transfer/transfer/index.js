'use strict';

let excel = require('excel');
let jsonfile = require('jsonfile');
let fs = require('fs');
let Q = require('q');
let _ = require('lodash');
let outPutFolder = "../update/private";

let adminUser = {
    "_id": "admin_classforth_com",
    emails: [
        {
            address: "admin@classforth.com",
            verified: false
        }
    ],
    "nickName" : 'ClassForth Administrator',
    username: 'admin@classforth.com',
    role: "admin",

    //password
    services: {
        "password": {//admin
            "bcrypt": "$2a$10$ASUX6d8i21L/qT4oU7kzrOD76uop2S/M5TbDkQXWwQWfYGV0DvkqW"
        }
    }
};

let adminCustomer = {
    "name": "admin@classforth.com",
    "email": "admin@classforth.com",
    "phone": "",
    "status": "Active",
    "nickName" : 'ClassForth Administrator',
    "_id": "admin_classforth_com"
};

var user = {
    emails: [
        {
            address: "",
            verified: false
        }
    ],
    username: '',
    role: "user",

    //password
    services: {
        "password": {//classforth
            "bcrypt": "$2a$10$k13k26qALFBBapCEcvvuwOgQyc61fnqxnK0.tllZ2WUeCp3JS7x3i"
        }
    }
};

var customer = {
    "name": "",
    "email": "",
    "phone": "",
    "location": "Fremont",
    "status": "Active"
};

var classStudent = {
  "accountID": "",
  "classID": "",
  "programID": "",
  "studentID": "",
  "status": "checkouted",
  "type": "register"
};

var school = {
    "name": "Class Forth",
    "email": "contract@classforth.com"
};

var student = {
    "name": "",
    "accountID": "",
    "profile": {
        "gender": "Male",
        "birthday": ""
    },
    "status": "Active"
};

var session = {
    "name": "",
    "startDate": new Date("2016-03-31T21:00:00-0700"),
    "endDate": new Date("2016-06-29T21:00:00-0700"),
    "registrationStartDate": new Date("2016-01-31T21:00:00-0800"),
    "registrationStatus": "Yes",
    "blockOutDay": [
        new Date("2016-03-30T21:00:00-0700")
    ],
    "registrationEndDate": new Date("2016-06-29T21:00:00-0700")
};

var program = {
    name:"",
    description: 'Need to add',
    availableTrial: true
};

var classData = {
    programID: "",
    sessionID: "",
    status: "",
    length: "",
    levels: [],
    teacher: "",

    schedule: {
        day: '',
        time: ""
    },

    tuition: {
        type: "",
        money: ""
    },
    maxStudent: 10,

    minStudent: 0,
    trialStudent: 0,

    minAgeRequire: 0,
    maxAgeRequire: 100,
    genderRequire: "All"
};


function am_pm_to_hours(time) {
    if(!time){
        console.error("time not exist");
        return null;
    }
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/([ampm]*)$/)[1];

    //console.log(AMPM);
    //console.log(hours);
    //console.log(minutes);

    // If AMPM exist
    if(AMPM){
        AMPM = AMPM.toLowerCase();
        if (AMPM == "pm" && hours < 12) hours = hours + 12;
        if (AMPM == "am" && hours == 12) hours = hours - 12;
    }

    var sHours = hours.toString();
    var sMinutes = minutes.toString();

    if (hours < 10) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;

    return (sHours +':'+sMinutes);
}

function hours_am_pm(time) {
    if(!time){
        console.error("time not exist");
        return null;
    }
    var hours = Number(time.match(/^(\d+)/)[1]);
    var minutes = Number(time.match(/:(\d+)/)[1]);
    var AMPM = time.match(/([ampm]*)$/)[1];
    if(AMPM){
        return time;
    }
    var sHours = hours.toString();
    var sMinutes = minutes.toString();
    if(hours>12){
        sHours = (hours-12).toString();
    }

    if (hours < 10||(hours-12)>0) sHours = "0" + sHours;
    if (minutes < 10) sMinutes = "0" + sMinutes;

    if (hours < 12) {
        return sHours + ':' + sMinutes + ' am';
    } else {
        return sHours+ ':' + sMinutes + ' pm';
    }
}

function transferDay(day){
    var dayMap = {
        "mon": "monday",
        "tue": "tuesday",
        "wed": "wednesday",
        "thu": "thursday",
        "fri": "friday",
        "sat": "saturday",
        "sun": "sunday"
    };
    if(day.toString().length == 3){
        day = dayMap[day.toLowerCase()];
    }

    return day.toLowerCase();
}

function getProgramID(programName){
    return _.snakeCase(programName);
}

function getSessionID(name){
    return _.snakeCase(name);
}

function getClassID(programName, sessionName, teacher, day, startTime){
    let id = programName+ "-"+sessionName+ "-"+teacher+ "-"+transferDay(day)+ "-"+am_pm_to_hours(startTime);
    return _.snakeCase(id);
}

function getUserID(name){
    return _.snakeCase(name);
}

function getStudentID(userID, name){
    return _.snakeCase(userID+"_"+name);
}

function getPhoneNumber(phone){
    phone = phone.toString();
    return phone.replace(/[^\d]*/g, function(){return ''})
}

function getClassStudentID(classID, studentID){
    return _.snakeCase(classID+"_"+studentID);
}

function insertToArray(array, data){
    // Make sure don't have duplicate data

    let item = _.find(array, function(item){
        return item._id == data._id;
    });

    if(!item){
        array.push(data);
    }
}

excel('data/cca/cca-class.xlsx', function (err, datas) {
//excel('data/example-of-class.xlsx', function (err, datas) {
    if (err) throw err;

    //console.log(datas);

    let programs = [];
    let classes = [];
    let sessions = [];

    // the first item is title, so skip first item
    for(let i=1; i<datas.length; i++){
        let data = datas[i];

        //console.log(data);

        // Generate programs
        let nProgram = _.cloneDeep(program);
        nProgram.name = data[0];
        nProgram._id = getProgramID(data[0]);
        insertToArray(programs, nProgram);

        // Generate Session
        let nSession = _.cloneDeep(session);
        nSession.name = data[1];
        nSession._id = getSessionID(nSession.name);
        insertToArray(sessions, nSession);

        // Generate Class
        let nClass = _.cloneDeep(classData);
        nClass.programID = nProgram._id ;
        nClass.sessionID = nSession._id;
        nClass.status = "Active";
        nClass.length = data[5];
        nClass.teacher = data[2];
        nClass.schedule.day = data[3];
        nClass.schedule.time = hours_am_pm(data[4]);
        nClass.tuition.type = "total";
        nClass.tuition.money = "100";
        nClass._id = getClassID(data[0], data[1], data[2], data[3], data[4]);
        insertToArray(classes, nClass);

    }

    jsonfile.writeFile(outPutFolder+'/programs.json', programs, {spaces: 2}, function (err) {
        if(err){
            console.error(err);
        }
    });

    jsonfile.writeFile(outPutFolder+'/classes.json', classes, {spaces: 2}, function (err) {
        if(err){
            console.error(err);
        }
    });

    jsonfile.writeFile(outPutFolder+'/sessions.json', sessions, {spaces: 2}, function (err) {
        if(err){
            console.error(err);
        }
    });

});

excel('data/cca/cca-student.xlsx', function(err, datas){
    if (err) throw err;

    let classStudents = [];
    let accounts = [];
    let customers = [];
    let students = [];

    for(let i=2; i<datas.length; i++){
        let data = datas[i];

        if(!data[7]||!data[1]){
            continue;
        }

        let nUser = _.cloneDeep(user);
        nUser._id = getUserID(data[7]);
        nUser.emails[0].address = data[7];
        nUser.username = data[7];
        insertToArray(accounts, nUser);

        let nCustomer = _.cloneDeep(customer);
        nCustomer._id = getUserID(data[7]);
        nCustomer.name = data[7];
        nCustomer.email = data[7];
        nCustomer.phone = getPhoneNumber(data[4]);
        insertToArray(customers, nCustomer);

        let nStudent = _.cloneDeep(student);
        nStudent._id = getStudentID(nUser._id, data[1]);
        nStudent.name = data[1];
        nStudent.accountID = nUser._id;
        nStudent.profile.gender = _.capitalize(data[2]);
        nStudent.profile.birthday = data[3]?new Date(data[3]):new Date();
        insertToArray(students, nStudent);

        let nClassStudent = _.cloneDeep(classStudent);
        nClassStudent.accountID = nUser._id;
        nClassStudent.classID = getClassID(data[9], data[10], data[11], data[12], data[13]);
        nClassStudent.programID = getProgramID(data[9]);
        nClassStudent.studentID = nStudent._id;
        nClassStudent._id=getClassStudentID(nClassStudent.classID,nClassStudent.studentID);
        insertToArray(classStudents, nClassStudent);

    }

    accounts.push(adminUser);
    //customers.push(adminCustomer);

    jsonfile.writeFile(outPutFolder+'/accounts.json', accounts, {spaces: 2}, function (err) {
        if(err){
            console.error(err);
        }
    });
    jsonfile.writeFile(outPutFolder+'/customers.json', customers, {spaces: 2}, function (err) {
        if(err){
            console.error(err);
        }
    });
    jsonfile.writeFile(outPutFolder+'/students.json', students, {spaces: 2}, function (err) {
        if(err){
            console.error(err);
        }
    });
    jsonfile.writeFile(outPutFolder+'/classStudents.json', classStudents, {spaces: 2}, function (err) {
        if(err){
            console.error(err);
        }
    });
});
