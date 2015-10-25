/**
 * Created on 10/23/15.
 */

Cal.StudentsIndexPage = React.createClass({

    mixins: [ReactMeteorData],
    getMeteorData() {

        Meteor.subscribe("admin/swimmers")

        return {
            students: DB.Swimmers.find().fetch()

        }
    },

    render: function () {




        var columns = [
            {label: "Student Name", key: 'name', type: ""},
            {label: "Location", key: 'location', type: ""},
            {label: "Level", key: 'level', type: ""},
            {label: "Account", key: 'accountId', type: ""}

        ]
        var Table = Reactable.Table,
            Thead = Reactable.Thead,
            Th = Reactable.Th,
            Tr = Reactable.Tr,
            Td = Reactable.Td


        return <div>

            <RB.Panel >

                <Table
                    sortable={true}
                    filterable={['name', 'location','Level']}
                    className="prop-table table table-striped table-bordered">
                    <Thead>
                    {
                        columns.map(function (col) {

                            return <Th column={col.key} key={col.key}>
                                <strong className="name-header">{col.label}</strong>
                            </Th>
                        })
                    }
                    </Thead>


                    {
                        this.data.students.map(function (item) {
                            return <Tr key={item._id}>
                                {
                                    columns.map(function (col) {


                                        if (col.key == 'name' ) {
                                            console.log(col)

                                            let link = (
                                                <a href={"/adminStudents/detail/"+item._id}> {item.name} </a>
                                            )

                                            return <Td column={col.key}  key={col.key}  data={link}>

                                            </Td>
                                        }else {

                                            return <Td column={col.key} key={col.key} data= {item[col.key]}>
                                                {item[col.key]}
                                            </Td>
                                        }
                                    })
                                }


                                <Td column="action">

                                </Td>
                            </Tr>
                        })
                    }
                </Table>


            </RB.Panel >


        </div>;
    }

});