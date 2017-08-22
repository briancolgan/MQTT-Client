// Set up local variables
var client;
var urlVar;
var portVar;
var connected;
var timestamp;
var now;

//Add an event listener for each button on the HTML page
document.getElementById("connect").addEventListener("click", startsession);
document.getElementById("disconnect").addEventListener("click", stopsession);
document.getElementById("customSubscribe").addEventListener("click", subscribeTopic);
document.getElementById("customPublish").addEventListener("click", publishTopic);

//Declare MQTT parameters
var options = {
  useSSL: true,
  userName: "",
  password: "",
  onSuccess:onConnect,
  onFailure:doFail
}

// called when the client connects
function onConnect() {
  //Set connected state variable to true upon connecting
  connected = true;
  // Print an alert message to the user's screen
  alert("Connected");
}
//Error handling function
function doFail(e){
  //Print error message to screen
  console.log(e);
}  

// called when the client loses its connection
function onConnectionLost(responseObject) {
  //Set connected state variable to false upon disconnecting
  connected = false;
  // Print an alert message to the user's screen
  alert("Disconnected");
  if (responseObject.errorCode !== 0) {
    //If an error code occurs, print it to the console
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  //Print received subscription message to console
  console.log("MessageArrived:"+message.payloadString);
  //Get a timestamp for the received message
  getTimestamp();
  //Insert timestamp and received message into the HTML text area
  document.getElementById("msgS").value+=timestamp+"\n"+message.payloadString+"\n\n";
  //Create a document varible for the subscription textarea
  var textarea = document.getElementById('msgS');
  //Make the textarea scroll to the bottom, ensuring the newest message is always shown
  textarea.scrollTop = textarea.scrollHeight;
}  

//Creates a new Messaging.Message Object and sends it to the Cloud MQTT Broker
var publish = function (payload, topic, qos) {
  //Send your message (also possible to serialize it as JSON or protobuf or just use a string, no limitations)
  var message = new Paho.MQTT.Message(payload);
  //Set the topic of publishing message
  message.destinationName = topic;
  //Set Quality of Service to 0
  message.qos = qos;
  //Send message object
  client.send(message);
}
//function to connect to the broker
function startsession(){
  //If the state is already connected
  if (connected) {
    //inform user with alert
    alert("Already connected!");
  }
  //check if all login fields on page have been filled
  else if (!document.getElementById("url") ||  !document.getElementById("port") || !document.getElementById("username") || !document.getElementById("password") ) {
    //inform user with alert
    alert("Please enter all the login fields...");
  }
  //otherwise connect to the broker
  else {
    //Update MQTT parameters from webpage fields
    setServer();
    //Create MQTT client object with above parameters
    client = new Paho.MQTT.Client(urlVar, portVar,"web_" + parseInt(Math.random() * 100, 10));
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;
    //Make client connection
    client.connect(options);
  }
} 

//function to disconnect from the broker
function stopsession(){
  //If the state is already disconnected
  if (!connected) {
    //inform user with alert
    alert("Already disconnected!");
  }
  //Else, perform disconnect
  else {
    //Set connected state variable to false upon disconnecting
    connected = false;
    //Disconnect from MQTT broker
    client.disconnect();
     //Reset text field on web page
    location.reload(); 
  }
}

//function to subscribe to topic on broker
function subscribeTopic () {
  //If not yet connected
  if (!connected) {
    //inform user with alert
    alert("Please connect to a broker before subscribing to a topic!");
  }
  //if no topic specified by user
  else if (!document.getElementById("topicS").value) {
    //inform user with alert
    alert("Please enter a topic to subscribe to!");
  }
  //otherwise
  else {
    //set topic variable to subscribe to
    var mytopic = document.getElementById("topicS").value;
    //subscribe to specified topic
    client.subscribe(mytopic);
  }
}
//function to publish to topic on broker
function publishTopic () {
  //If not yet connected
  if (!connected) {
    //inform user with alert
    alert("Please connect to a broker before publishing to a topic!");
  }
  //if no topic specified by user
  else if (!document.getElementById("topicP").value) {
    //inform user with alert
    alert("Please enter a topic to publish to!");
  }
  //if no message specified by user
  else if (!document.getElementById("msgP").value) {
    //inform user with alert
    alert("Please enter a message to publish!");
  }
  //otherwise
  else {
    //set topic variable to publish to
    var myTopic = document.getElementById("topicP").value;
    //set message to publish
    var myMsg = document.getElementById("msgP").value;
    //publish message to topic with qos of '0'
    publish(myMsg, myTopic, 0);
  }
}

//Get human-readable timestamp
function getTimestamp() {
  //Update gloabal now variable to new date object
  now=new Date();
  //Update year element to Universal Co-ordinated Time (UTC) Year
  var year=now.getUTCFullYear();
  //Update month element, add 1 (as it starts with 0)
  var month=now.getUTCMonth()+1;
  //Update day element
  var day=now.getUTCDate();
  //Update hour elemet, taking into account daylight savings
  var hour=now.getUTCHours()-(now.getTimezoneOffset()/60);
  //Update minutes
  var minute=now.getUTCMinutes();
  //Update seconds
  var second=now.getUTCSeconds();
  //Prefix any single digit elements with a leading-zero
  if(month<10) {
    month="0"+month;
  }
  if(day<10) {
    day="0"+day;
  }
  if(hour<10) {
    hour="0"+hour;
  }
  if(minute<10) {
    minute="0"+minute;
  }
  if(second<10) {
    second="0"+second;
  }
  // Formating date into a string
  timestamp=year+"/"+month+"/"+day+" @ "+hour+":"+minute+":"+second;
}

//Update MQTT parameters with values from webpage
function setServer() {
  options.userName = document.getElementById("username").value;
  options.password = document.getElementById("password").value;
  urlVar = document.getElementById("url").value;
  portVar = parseInt(document.getElementById("port").value);
}

