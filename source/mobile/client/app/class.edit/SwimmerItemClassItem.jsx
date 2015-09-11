
Cal.ClassEditSwimmerItemClassItem = React.createClass({

    mixins: [ReactMeteorData],
    getMeteorData() {

        //account swimmers classes
        //Meteor.subscribe("accountWithSwimmersAndClasses",'account1');

        let classId = this.props.registerInfo.classId;

        Meteor.subscribe("class",classId);


        return {
            classInfo:DB.Classes.find({_id:classId}).fetch()[0]
        };
    },

    render() {
        return <p>
            {this.data.classInfo && this.data.classInfo.name}
            { this.data.classInfo && this.data.classInfo.level}

            {this.props.registerInfo.registerDate.toTimeString()}
        </p>
    }
});
