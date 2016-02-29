let themes = ["overlay-light","overlay-dark"]
RC.MQ = {};

KUI.Payment_CreditCardPay = class extends KUI.Page{

    constructor(p){
        super(p);
        this.state = {
            buttonActive: false,
            waiting: false,
            msg: null,
            notification: null
        };
    }

    getMeteorData() {
        return {
            currentUser: Meteor.user()
        };
    }


    postPayment(e){

        // To do: get the charging amount from database
        // To do: change the referece id

        e.preventDefault()
        let self = this
        var paymentInfo = {
            "createTransactionRequest": {
                "merchantAuthentication": {
                    "name": "42ZZf53Hst",
                    "transactionKey": "3TH6yb6KN43vf76j"
                },
                "refId": "123461",
                "transactionRequest": {
                    "transactionType": "authCaptureTransaction",
                    "amount": "5",
                    "payment": {
                        "creditCard": {
                            "cardNumber": "5424000000000015",
                            "expirationDate": "1220",
                            "cardCode": "999"
                        }
                    },
                    "profile":{
                        "createProfile": false

                    },
                    "lineItems": {
                        "lineItem": {
                            "itemId": "1",
                            "name": "vase",
                            "description": "Cannes logo",
                            "quantity": "1",
                            "unitPrice": "0.02"
                        }
                    },
                    // "tax": {
                    //     "amount": "4.26",
                    //     "name": "level2 tax name",
                    //     "description": "level2 tax"
                    // },
                    // "duty": {
                    //     "amount": "8.55",
                    //     "name": "duty name",
                    //     "description": "duty description"
                    // },
                    // "shipping": {
                    //     "amount": "4.26",
                    //     "name": "level2 tax name",
                    //     "description": "level2 tax"
                    // },
                    "poNumber": "456654",
                    "customer": {
                        "id": "99999456656"
                    },
                    "billTo": {
                        "firstName": "Ellen",
                        "lastName": "Johnson",
                        "company": "Souveniropolis",
                        "address": "14 Main Street",
                        "city": "Pecan Springs",
                        "state": "TX",
                        "zip": "44628",
                        "country": "USA"
                    },
                    // "shipTo": {
                    //     "firstName": "China",
                    //     "lastName": "Bayles",
                    //     "company": "Thyme for Tea",
                    //     "address": "12 Main Street",
                    //     "city": "Pecan Springs",
                    //     "state": "TX",
                    //     "zip": "44628",
                    //     "country": "USA"
                    // },
                    "customerIP": "192.168.1.1",
                    "transactionSettings": {
                        "setting": {
                            "settingName": "testRequest",
                            "settingValue": "false"
                        }
                    },
                    // "userFields": {
                    //     "userField": [
                    //         {
                    //             "name": "MerchantDefinedFieldName1",
                    //             "value": "MerchantDefinedFieldValue1"
                    //         },
                    //         {
                    //             "name": "favorite_color",
                    //             "value": "blue"
                    //         }
                    //     ]
                    // }
                }
            }
        }

        // if (this.state.msg) return null

        let form = this.refs.paymentForm.getFormData()

        console.log(form.creditCardNumber)
        console.log(form.expirationDate)
        console.log(form.ccv)

        var cardNumber = this.refs.paymentForm.getFormData().creditCardNumber
        var ccv = this.refs.paymentForm.getFormData().ccv
        var expirationDate = this.refs.paymentForm.getFormData().expirationDate
        var message = []
        if(cardNumber.length != 16){
            message.push("Credit Card Length Error; ")
        }

        var patt = /[0-9]{2}\/[0-9]{2}/


        if (!patt.test(expirationDate)){
            message.push("Expiration Date Format Format Error; ")
        }
        if (ccv.length > 4){
            message.push("CCV Format Error;")
        }
        if (message.length != 0) {
            this.setState({
                msg: message
            })
            return
        }
        // expirationDate = expirationDate.slice(0,2)+expirationDate.slice(3,5)

        paymentInfo.createTransactionRequest.transactionRequest.payment.creditCard.cardNumber = form.creditCardNumber
        paymentInfo.createTransactionRequest.transactionRequest.payment.creditCard.expirationDate = form.expirationDate
        paymentInfo.createTransactionRequest.transactionRequest.payment.creditCard.cardCode = form.ccv
        paymentInfo.createTransactionRequest.transactionRequest.billTo.firstName = form.cardHolderFirstName
        paymentInfo.createTransactionRequest.transactionRequest.billTo.lastName = form.cardHolderLastName
        paymentInfo.createTransactionRequest.transactionRequest.billTo.address = form.street
        paymentInfo.createTransactionRequest.transactionRequest.billTo.city = form.city
        paymentInfo.createTransactionRequest.transactionRequest.billTo.state = form.state
        paymentInfo.createTransactionRequest.transactionRequest.billTo.zip = form.zip
        paymentInfo.createTransactionRequest.refId = Math.floor((Math.random() * 100000) + 1).toString()
        paymentInfo.createTransactionRequest.transactionRequest.amount = "0.1"
        console.log(paymentInfo.createTransactionRequest.refId)

        var URL = 'https://apitest.authorize.net/xml/v1/request.api'
        HTTP.call('POST',URL, {data: paymentInfo}, function(error, response){
            if(!!error){
                console.log(error)
            }
            if(!!response){
                console.log(response)
            }

            if (response.data.messages.message[0].code == "I00001") {
                console.log("Success")
                alert('success');
                // console.log(response.data.profileResponse.customerPaymentProfileIdList[0])


            } else{
                self.setState({
                    msg: "The transaction was unsuccessful."
                })
            }

        })

    }

    getCustomerInfo(e){
        e.preventDefault()
        var customerInfoRequest = {
            "getCustomerProfileRequest": {
                "merchantAuthentication": {
                    "name": "42ZZf53Hst",
                    "transactionKey": "3TH6yb6KN43vf76j"
                },
                "customerProfileId": "39532821"
            }
        }
        var URL = 'https://apitest.authorize.net/xml/v1/request.api'
        HTTP.call('POST',URL, {data: customerInfoRequest}, function(error, response){
            debugger
            if(!!error){
                console.log(error)
            }
            if(!!response){
                debugger
                console.log(response)
                payUsingProfile(response.data.profile.paymentProfiles[0])

            }
        })
    }

    payUsingProfile(p) {

    }

    printMsg(){
        console.log("printMsg is called", this.state.msg)

        let currentMessages = this.state.msg ? [this.state.msg] : []
        return <div>
            {
                currentMessages.map(function(m,n){
                    return <div className="center" key={n}>
                        <div className="bigger inline-block invis-70 red">
                            {_.isString(m) ? <p>{m}</p> : m}
                        </div>
                    </div>
                })
            }
        </div>

    }

    checkCardNumber(e){
        var ccv = this.refs.paymentForm.getFormData().ccv
        var cardNumber = this.refs.paymentForm.getFormData().creditCardNumber
        var expirationDate = this.refs.paymentForm.getFormData().expirationDate
        if (cardNumber.length > 16){
            this.setState({
                msg: "Credit Card Length Error"
            })
        }
    }

    checkExpirationDate(e){
        var cardNumber = this.refs.paymentForm.getFormData().creditCardNumber
        var ccv = this.refs.paymentForm.getFormData().ccv
        var expirationDate = this.refs.paymentForm.getFormData().expirationDate
        var message = []
        if(cardNumber.length != 16){
            message.push("Credit Card Length Error; ")
        }

        if (expirationDate.length > 5){
            message.push("Expiration Date Format Format Error; ")
        }
        if (message.length != 0) {
            this.setState({
                msg: message
            })
        }
    }

    checkCCV(e){
        var cardNumber = this.refs.paymentForm.getFormData().creditCardNumber
        var ccv = this.refs.paymentForm.getFormData().ccv
        var expirationDate = this.refs.paymentForm.getFormData().expirationDate
        var message = []
        if(cardNumber.length != 16){
            message.push("Credit Card Length Error; ")
        }

        var patt = /[0-9]{2}\/[0-9]{2}/


        if (!patt.test(expirationDate)){
            message.push("Expiration Date Format Format Error; ")
        }
        if (ccv.length > 4){
            message.push("CCV Format Error;")
        }
        if (message.length != 0) {
            this.setState({
                msg: message
            })
        }

    }


    render() {
        var inputTheme = "small-label"
        var buttonTheme = "full"
        if (_.contains(["overlay-light","overlay-dark"], this.props.theme)) {
            inputTheme += ","+this.props.theme
            buttonTheme += ","+this.props.theme
        }

        // return (

        // 	<RC.List className="padding">

        //         { this.data.currentUser ?
        //         	<div>
        //         		<RC.Item theme="text-wrap"> User Name: {this.data.currentUser.username}</RC.Item>
        //         		<RC.Item theme="text-wrap"> User Email: {this.data.currentUser.emails[0].address}</RC.Item>
        //         	</div> : <RC.Item theme="text-wrap"> User Not Logged In</RC.Item>
        //         }
        //         { this.data.currentUser ?
        //         	<RC.Button onClick={this.logOut} name="button" theme="full" buttonColor="brand">
        //              Log Out
        //          </RC.Button> :
        //          <RC.URL href="/login">
        //              <RC.Button name="button" theme="full" buttonColor="brand">
        //                  Log In
        //              </RC.Button>
        //          </RC.URL>

        //      }
        //         <RC.URL href="/">
        //             <RC.Button name="button" theme="full" buttonColor="brand">
        //                 Home
        //             </RC.Button>
        //         </RC.URL>

        //         <RC.Form onSubmit={this.postPayment}   ref="paymentForm">
        //         	{this.printMsg()}
        //         	<RC.Input name="creditCardNumber" onKeyUp={this.checkCardNumber} label="Credit Card Number" theme={inputTheme} ref="cardNumber" />
        //       <RC.Input name="expirationDate" onKeyUp={this.checkExpirationDate} label="Expiration Date (MM/YY)"  theme={inputTheme} ref="expirationDate" />
        //       <RC.Input name="ccv" onKeyUp={this.checkCCV} label="CCV" theme={inputTheme} ref="ccv"/>
        //       <RC.Input name="cardHolderFirstName" label="Card Holder First Name" theme={inputTheme} ref="cardHolderFirstName"/>
        //       <RC.Input name="cardHolderLastName" label="Card Holder Last Name" theme={inputTheme} ref="cardHolderLastName"/>
        //       <RC.Input name="street"  label="Street Address" theme={inputTheme} ref="street"/>
        //       <RC.Input name="city"  label="City" theme={inputTheme} ref="city"/>
        //       <RC.Input name="state" label="State" theme={inputTheme} ref="state"/>
        //       <RC.Input name="zip" label="Zip" theme={inputTheme} ref="zip"/>
        //          <RC.Button name="button" theme="full" buttonColor="brand">
        //                  Pay Now
        //              </RC.Button>
        //      </RC.Form>
        //      <RC.Form onSubmit={this.getCustomerInfo}   ref="customerPayForm">
        //          <RC.Button name="button" theme="full" buttonColor="brand">
        //                  Pay Using Existed Card
        //              </RC.Button>
        //      </RC.Form>



        //    	</RC.List>
        // );

        let total = Session.get('_register_class_money_total_');
        return (

            <RC.List className="padding">
                <RC.Div>Total Money : ${total}</RC.Div>
                <RC.Form onSubmit={this.postPayment.bind(this)}  ref="paymentForm">
                    {this.printMsg()}
                    <RC.Input name="creditCardNumber" onKeyUp={this.checkCardNumber.bind(this)} label="Credit Card Number" theme={inputTheme} ref="cardNumber" />
                    <RC.Input name="expirationDate" onKeyUp={this.checkExpirationDate.bind(this)} label="Expiration Date (MM/YY)"  theme={inputTheme} ref="expirationDate" />
                    <RC.Input name="ccv" onKeyUp={this.checkCCV.bind(this)} label="CCV" theme={inputTheme} ref="ccv"/>
                    <RC.Input name="cardHolderFirstName" label="Card Holder First Name" theme={inputTheme} ref="cardHolderFirstName"/>
                    <RC.Input name="cardHolderLastName" label="Card Holder Last Name" theme={inputTheme} ref="cardHolderLastName"/>
                    <RC.Input name="street"  label="Street Address" theme={inputTheme} ref="street"/>
                    <RC.Input name="city"  label="City" theme={inputTheme} ref="city"/>
                    <RC.Input name="state" label="State" theme={inputTheme} ref="state"/>
                    <RC.Input name="zip" label="Zip" theme={inputTheme} ref="zip"/>
                    <RC.Button name="button" theme="full" buttonColor="brand">
                        Pay Now
                    </RC.Button>
                </RC.Form>
            </RC.List>
        );
    }
};