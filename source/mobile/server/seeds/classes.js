Meteor.startup(function () {
    DB.Classes.remove()

    if (DB.Classes.find({}).count() === 0) {

        //////////////////////////////////
        //构造session1的class数据

        DB.Classes.insert({
            _id:  'class1',
            sessionId: 'testSession1',
            name: 'testSession1' + 'class1',

            level: 'level-1',
            day:1,
            startTime:App.time2num('9:00'),
            endTime:App.time2num('11:00'),

            startDate: new Date(),
            endDate: new Date(+new Date() + (1000 * 60 * 60 * 24 * 90  )),//90天后结束
            frequency: "2/week",

            type: 'ss',
            availableSeats: 10,
            price: 100,
            students: ['swimmer1']   //swimmer1已选‘class1’
        });

        DB.Classes.insert({
            _id: 'class2',
            sessionId: 'testSession1',
            name: 'testSession1' + 'class2',

            level: 'level-1',
            day:1,
            startTime:App.time2num('14:00'),
            endTime:App.time2num('16:00'),

            startDate: new Date(),
            endDate: new Date(+new Date() + (1000 * 60 * 60 * 24 * 90  )),//90天后结束
            frequency: "2/week",
            level: 'level-1',
            type: 'ss',
            availableSeats: 10,
            price: 100,
            students: ['swimmer1']
        });

        DB.Classes.insert({
            _id:  'class3',
            sessionId: 'testSession1',
            name: 'testSession1' + 'class3',

            level: 'level-1',
            day:1,
            startTime:App.time2num('15:00'),
            endTime:App.time2num('17:00'),

            startDate: new Date(),
            endDate: new Date(+new Date() + (1000 * 60 * 60 * 24 * 90  )),//90天后结束
            frequency: "2/week",
            level: 'level-1',
            type: 'ss',
            availableSeats: 10,
            price: 100,
            students: []   //swimmer1已选‘class1’
        });


        ////////////////////////////////////////////
        //构造session2的class数据
        //session2 和session的class一样时才可以bookTheSameTime

        DB.Classes.insert({
            _id:  'testSession2class1',
            sessionId: 'testSession2',
            name: 'testSession2' + 'class1',

            level: 'level-1',
            day:1,
            startTime:App.time2num('9:00'),
            endTime:App.time2num('11:00'),

            startDate: new Date(),
            endDate: new Date(+new Date() + (1000 * 60 * 60 * 24 * 90  )),//90天后结束
            frequency: "2/week",

            type: 'ss',
            availableSeats: 10,
            price: 100,
            students: ['swimmer1']   //swimmer1已选‘class1’
        });

        DB.Classes.insert({
            _id: 'testSession2class2',
            sessionId: 'testSession2',
            name: 'testSession2' + 'class2',

            level: 'level-1',
            day:1,
            startTime:App.time2num('14:00'),
            endTime:App.time2num('16:00'),

            startDate: new Date(),
            endDate: new Date(+new Date() + (1000 * 60 * 60 * 24 * 90  )),//90天后结束
            frequency: "2/week",
            level: 'level-1',
            type: 'ss',
            availableSeats: 10,
            price: 100,
            students: ['swimmer1']
        });

        DB.Classes.insert({
            _id:  'testSession2class3',
            sessionId: 'testSession2',
            name: 'testSession2' + 'class3',

            level: 'level-1',
            day:1,
            startTime:App.time2num('15:00'),
            endTime:App.time2num('17:00'),

            startDate: new Date(),
            endDate: new Date(+new Date() + (1000 * 60 * 60 * 24 * 90  )),//90天后结束
            frequency: "2/week",
            level: 'level-1',
            type: 'ss',
            availableSeats: 10,
            price: 100,
            students: []   //swimmer1已选‘class1’
        });




    }
});