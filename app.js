const express_lib = require("express");
const socket = require("socket.io");
const app = express_lib();  //initialize express application
app.use(express_lib.static("public"));

let port = 3000;
let server = app.listen(port, () => {
    console.log("Listening to port:", port);
})

//Will listen to the pprt for any IO request initiated from index.html.
let io = socket(server);
//on() similar to onload()/onsuccess() for event listener
io.on("connection", (socket) => {
    console.log("Socket connection success!");
    //event listener for client request for BeginPath
    socket.on("BeginPath", (clientData) => {
        console.log("Client data BeginPath received succesfully to central server..");
        //Now broadcast the received data on server to all opened client connections
        console.log("Broadcast BeginPath server data to all opened clients..");
        let serverData = clientData;
        io.sockets.emit("BeginPath", serverData);
    });

    //Event listener for client request fpr drawStroke
    socket.on("drawStroke", (clientData) => {
        console.log("Client data drawStroke received succesfully to central server..");
        //Now broadcast the received data on server to all opened client connections
        let serverData = clientData;
        io.sockets.emit("drawStroke", serverData);
    })

    //Event listener for client request for UndoRedoCanvas
    socket.on("UndoRedoCanvas", (clientData) => {
        //Now broadcast the received data on server to all opened client connections
        let serverData = clientData;
        io.sockets.emit("UndoRedoCanvas", serverData);
    })
})