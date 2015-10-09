/**
 * Created on 10/1/15.
 */

Cal.CRClassBookItem = React.createClass({
    propTypes: {
        classId: React.PropTypes.string //.isRequired
    },
    mixins: [ReactMeteorData],
    getMeteorData() {

        var classId = this.props.classId

        //上个session的class
        var oldClass = DB.Classes.findOne({
            _id: classId
        })

        //相同class不存在时的判断逻辑
        var similarClass = DB.Classes.findOne({
            sessionId:App.info && App.info.sessionRegister,
            day:oldClass && oldClass.day,
            startTime:oldClass && oldClass.startTime

        })

        console.log('similarClass',similarClass)

        return {
            similarClass: similarClass
        }
    },
    //actions
    book(){

        //alert('onBook')

        Dispatcher.dispatch({
            actionType: "BookTheSameTime_CLASS_SELECT_FOR_CURRENT",
            selectedClass: this.data.similarClass,
            currentStep:1
        });
    },

    render() {

        return <RC.Item uiColor="brand1">
            {
                this.data.similarClass ?

                    <div className="row">
                        <div className="col">
                            {this.data.similarClass && this.data.similarClass.level}

                            <br/>
                            {this.data.similarClass && App.Config.week[this.data.similarClass.day]}

                            <br/>
                            {this.data.similarClass && App.num2time(this.data.similarClass.startTime)}

                        </div>

                        <div className="col">
                            <span onClick={this.book} className="button button-small">
                            BOOK
                            </span>
                        </div>
                    </div>
                    : ''
            }


        </RC.Item>

    }
})