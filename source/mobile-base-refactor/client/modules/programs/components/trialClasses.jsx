/*
 * Trial classes
 */
let {
    WeekDaySelector
} = EdminForce.Components; 

EdminForce.Components.TrialClasses = class extends RC.CSS {

    constructor(p) {
        super(p);
        this.state = {
            selectedDay: null
        }

        this.onSelectDay = this.onSelectDay.bind(this);
    }

    bookTrial(classItem) {
        this.props.actions.bookTrial(classItem);
    }

    onSelectDay(day) {
        this.setState({selectedDay:day});
    }

    render() {
        let self = this;
        let col = {
            display: "inline-block",
            float: "left",
            width: "50%",
            padding: 0
        };

        let lessons = this.props.classes || [];
        this.state.selectedDay && (lessons = _.filter(lessons,(lesson) => lesson.schedule && lesson.schedule.day.toLowerCase() === this.state.selectedDay.toLowerCase()));
        let lessonElements = lessons.map( (item) => (
            <RC.Item key={item.key} theme="divider" onClick={self.bookTrial.bind(self, item)}>
                <h3>{item.name}</h3>
                <div>
                    <br/>
                    <p style={col}>Day: {moment(item.lessonDate).format("MMMM Do YYYY")}</p>
                    <p style={col}>Length: {item.length}</p>
                    <br/>
                    <p>Teacher: {item.teacher}</p>
                </div>
            </RC.Item>
        ));

        return (
            <div>
                <EdminForce.Components.WeekDaySelector onSelectDay={this.onSelectDay} />
                <RC.List>
                    {lessonElements}
                </RC.List>
            </div>
        );
    }
};
