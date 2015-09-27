Cal.Home = React.createClass({
    render() {
        return <RC.List className="padding">
            <RC.Item theme="text-wrap">
                <p>Test home page</p>
            </RC.Item>
            <RC.URL href="/auth">
                <RC.Button name="button" theme="full" buttonColor="brand">
                    Authentication Module
                </RC.Button>
            </RC.URL>

            <RC.Item theme="divider">用户信息编辑模块</RC.Item>

            <RC.Item theme="divider">课程编辑模块</RC.Item>


            <RC.URL href="/classEdit/swimmerList">
                <RC.Button name="button" theme="full" buttonColor="brand">
                    Your Swimmers
                </RC.Button>
            </RC.URL>


            <RC.Item theme="divider">课程注册模块</RC.Item>
            <RC.URL href="/registraionInfoPage">
                <RC.Button name="button" theme="full" buttonColor="brand">
                    Register Class
                </RC.Button>
            </RC.URL>
            <RC.URL href="/classRegister/BookTheSameTimePage">
                <RC.Button name="button" theme="full" buttonColor="brand">
                    Book The Same Time
                </RC.Button>
            </RC.URL>


        </RC.List>

    }
})