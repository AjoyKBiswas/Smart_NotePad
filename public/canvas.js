let canvas_elem = document.querySelector("canvas");
//Spreading the canvas tool through out the window
canvas_elem.width = window.innerWidth;
canvas_elem.height = window.innerHeight;
let canvas_tool = canvas_elem.getContext("2d");

// canvas_tool.strokeStyle = "black";  //stroke's color
// canvas_tool.lineWidth = 3;
// canvas_tool.beginPath();  //start of a new graphics
// canvas_tool.moveTo(10, 10);  //start of that stroke
// canvas_tool.lineTo(100, 100);  //end of that stroke
// canvas_tool.stroke();  //fill drawn stroke with defined color

// canvas_tool.lineTo(200, 250);  //beginPath for this stroke will be (100, 100), end is (200, 250)
// canvas_tool.stroke();

// canvas_tool.strokeStyle = "blue";  //stroke's color
// canvas_tool.lineWidth = 5;
// canvas_tool.beginPath();  //start of a new graphics
// canvas_tool.moveTo(300, 300);  //start of that stroke
// canvas_tool.lineTo(400, 400);  //end of that stroke
// canvas_tool.stroke();

let pencil_color_elems = document.querySelectorAll(".pencil-color");
let pencil_width_elem = document.querySelector(".pencil-width");
let eraser_width_elem = document.querySelector(".eraser-width");

let pencilColor = "black";  //default pencil color
let pencilWidth = pencil_width_elem.value;  //default pencil width

canvas_tool.strokeStyle = pencilColor;  //stroke's default color, if no color is chosen
canvas_tool.lineWidth = pencilWidth;  //stroke's default linewidth, if width is not chosen

let eraserColor = "white";  //default eraser color
let eraserWidth = eraser_width_elem.value;  //default eraser width

//Event listener for choosing pencil color
pencil_color_elems.forEach((selected_pencil_color_elem) => {
    selected_pencil_color_elem.addEventListener("click", (event) => {
        pencilColor = selected_pencil_color_elem.classList[0];
        canvas_tool.strokeStyle = pencilColor;
        //console.log(pencilColor);
    })
})

//Event listener for choosing pencil width
pencil_width_elem.addEventListener("change", (event) => {
    pencilWidth = pencil_width_elem.value;
    canvas_tool.lineWidth = pencilWidth;
    //console.log(pencilWidth);
})

//eraserFlag defined in tools.js.
//This event listener is to toggle between pencil & eraser operations.
eraser_icon.addEventListener("click", (event) => {
    if(eraserFlag){
        canvas_tool.strokeStyle = eraserColor;  //pencil color has to be over-written by white canvas default color
        canvas_tool.lineWidth = eraserWidth;  //linewidth has to be chosen eraser width
    }
    else{
        canvas_tool.strokeStyle = pencilColor;  //color has to be set back to last set pencil color
        canvas_tool.lineWidth = pencilWidth;  //linewidth has to be set back to pencilwidth
    }
})

//Event listener for choosing eraser width
eraser_width_elem.addEventListener("change", (event) => {
    eraserWidth = eraser_width_elem.value;
    canvas_tool.lineWidth = eraserWidth;
})

//add event listeners on canvas element on 3 mouse operations -
//mousedown -> beginpath, mousemove -> fill graphics with color for every destination coordinate, mouseup -> stop.
let mouseDown = false;
canvas_elem.addEventListener("mousedown", (event) => {
    mouseDown = true;
    let mouse_coordinate = {
        x: event.clientX,
        y: event.clientY
    }
    //canvas_tool.beginPath();
    //clientX and clientY are the coordinates of the location on canvas element where mouse has been clicked
    //canvas_tool.moveTo(event.clientX, event.clientY);
    let clientData = mouse_coordinate;
    BeginPath(mouse_coordinate);
    //Any change on canvas will have to be reflected on other remotely opened app
    socket.emit("BeginPath", clientData);
})
function BeginPath(mouse_coordinate){
    canvas_tool.beginPath();
    //clientX and clientY are the coordinates of the location on canvas element where mouse has been clicked
    canvas_tool.moveTo(mouse_coordinate.x, mouse_coordinate.y);
}
//After socket.emit() sends data to server, server will send data to this client also,
//to deal with that, we need to have event listener.
socket.on("BeginPath", (serverData) => {
    //On receiving mouse location, perfrom the actions to draw same image on current client
    BeginPath(serverData);

})

canvas_elem.addEventListener("mousemove", (event) => {
    // if(mouseDown){  //without this condition, even without mouse been clicked, wherever we move mouse, will keep on drawing on canvas.
    //     canvas_tool.lineTo(event.clientX, event.clientY);
    //     canvas_tool.stroke();
    // }
    if(mouseDown){
        let clientData = {
            x: event.clientX,
            y: event.clientY,
            color: eraserFlag ? eraserColor : pencilColor,
            width: eraserFlag ? eraserWidth : pencilWidth
        }
        socket.emit("drawStroke", clientData);
        drawStroke(clientData);
    }
})
function drawStroke(strokeObj){
    canvas_tool.strokeStyle = strokeObj.color;
    canvas_tool.lineWidth = strokeObj.width;
    canvas_tool.lineTo(strokeObj.x, strokeObj.y);
    canvas_tool.stroke();
}
//After socket.emit() sends data to server, server will send data to this client also,
//to deal with that, we need to have event listener.
socket.on("drawStroke", (serverData) => {
    drawStroke(serverData);
})

canvas_elem.addEventListener("mouseup", (event) => {
    mouseDown = false;
    let url = canvas_elem.toDataURL();
    UndoRedoTracker.push(url);
    tracker = UndoRedoTracker.length -1;
})

let Download_icon = document.querySelector(".Download");
Download_icon.addEventListener("click", (event) => {
    image_URL = canvas_elem.toDataURL();  //used it for camera-gallery-app project to save image.
    let anchor = document.createElement("a");
    anchor.href = image_URL;
    anchor.download = "Notes.jpg";
    anchor.click();
})

let UndoRedoTracker = [];  //store opeartions perfromed on canvas
let tracker = 0;  //represents which action from UndoRedoTracker has been performed
let Undo_icon = document.querySelector(".Undo");
let Redo_icon = document.querySelector(".Redo");

Undo_icon.addEventListener("click", (event) => {
    if(tracker > 0){
        tracker--;
    }
    let trackerObj = {
        trackValue:tracker,
        UndoRedoTracker
    }
    UndoRedoCanvas(trackerObj);
    socket.emit("UndoRedoCanvas", trackerObj);
})
Redo_icon.addEventListener("click", (event) => {
    if(tracker < UndoRedoTracker.length-1){
        tracker++;
    }
    let trackerObj = {
        trackValue:tracker,
        UndoRedoTracker
    }
    UndoRedoCanvas(trackerObj);
    socket.emit("UndoRedoCanvas", trackerObj);
})

function UndoRedoCanvas(trackerObj){
    let track = trackerObj.trackValue;
    UndoRedoTracker = trackerObj.UndoRedoTracker;
    let url = UndoRedoTracker[track];
    let img = new Image();
    img.src = url;
    img.onload = (event) => {
        canvas_tool.drawImage(img, 0, 0, canvas_elem.width, canvas_elem.height);
    }
}

//After socket.emit() sends data to server, server will send data to this client also,
//To deal with that, we need to have event listener.
socket.on("UndoRedoCanvas", (serverData) => {
    UndoRedoCanvas(serverData);
})