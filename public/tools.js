let menu_cont_elem = document.querySelector(".menu-cont");
let tools_cont_elem = document.querySelector(".tools-cont");
let pencil_tool_cont_elem = document.querySelector(".pencil-tool-cont");
let pencilFlag = false;
let eraser_width_cont_elem = document.querySelector(".eraser-width-cont");
let eraserFlag = false;
let sticky_notes_icon = document.querySelector(".StickyNote");
let upload_icon = document.querySelector(".Upload");

menu_cont_elem.addEventListener("click", (event) => {
    let menu_icon = menu_cont_elem.children[0];
    // console.log(menu_icon.innerText);
    if(menu_cont_elem.innerText === "menu"){
        menu_icon.innerText = "close";
        open_menu();
    }
    else if(menu_cont_elem.innerText === "close"){
        menu_icon.innerText = "menu";
        close_menu();
    }
    
})

function close_menu(){
    tools_cont_elem.style.display = "none";
    //During closing main tool box, must close sub-tool boxes.
    pencil_tool_cont_elem.style.display = "none";
    eraser_width_cont_elem.style.display = "none";
    pencilFlag = false;
    eraserFlag = false;
}
function open_menu(){
    tools_cont_elem.style.display = "flex";
    //During opening tools, need not open sub-tool boxes.
    //pencil_tool_cont_elem.style.display = "flex";
    //eraser_width_cont_elem.style.display = "flex";
}

let pencil_icon = document.querySelector(".Pencil");
pencil_icon.addEventListener("click", (event) => {
    pencilFlag = !pencilFlag;
    if(pencilFlag){
        pencil_tool_cont_elem.style.display = "block";
    }
    else{
        pencil_tool_cont_elem.style.display = "none";
    }
})

let eraser_icon = document.querySelector(".Eraser");
eraser_icon.addEventListener("click", (event) => {
    eraserFlag = !eraserFlag;
    if(eraserFlag){
        eraser_width_cont_elem.style.display = "flex";
    }
    else{
        eraser_width_cont_elem.style.display = "none";
    }
})

sticky_notes_icon.addEventListener("click", (event) => {
    let StickyNoteTemplate = `<div class="header-cont">
                                <div class="minimize"></div>
                                <div class="remove"></div>
                            </div>
                            <div class="note-cont">
                                <textarea spellcheck="false" class="SN-textarea"></textarea>
                            </div>`;
    createStickyNoteWindow(StickyNoteTemplate);
})

//function for mouse drag & drop functionality
function dragAndDrop(element, event){
    let shiftX = event.clientX - element.getBoundingClientRect().left;
    let shiftY = event.clientY - element.getBoundingClientRect().top;
      
    element.style.position = 'absolute';
    element.style.zIndex = 1000;

    moveAt(event.pageX, event.pageY);
      
    // moves the ball at (pageX, pageY) coordinates
    // taking initial shifts into account
    function moveAt(pageX, pageY) {
        element.style.left = pageX - shiftX + 'px';
        element.style.top = pageY - shiftY + 'px';
    }
      
    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }
      
    // move the ball on mousemove
    document.addEventListener('mousemove', onMouseMove);
      
    // drop the ball, remove unneeded handlers
    element.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        element.onmouseup = null;
    };
    element.ondragstart = function() {
        return false;
    };
}

//function for mouse drag & drop functionality for tool-box
function tools_cont_movement(){
    tools_cont_elem.onmousedown = function(event) {
        dragAndDrop(tools_cont_elem, event);
    };

    pencil_tool_cont_elem.onmousedown = function(event) {
        dragAndDrop(pencil_tool_cont_elem, event);
    };

    eraser_width_cont_elem.onmousedown = function(event) {
        dragAndDrop(eraser_width_cont_elem, event);
    };
}
tools_cont_movement();

//Function for minimizing/deleting sticky notes
function StickyNotesActions(minimize, remove, StickyNoteWindow){
    remove.addEventListener("click", (event) => {
        StickyNoteWindow.remove();
    })
    minimize.addEventListener("click", (event) => {
        //to know whether note's textarea is already hidden or visible. If visible hide it, if hidden make it visible.
        let note_cont_elem = StickyNoteWindow.querySelector(".note-cont");
        let note_display = getComputedStyle(note_cont_elem).getPropertyValue("display");
        //console.log(note_display);
        if(note_display === "none"){
            note_cont_elem.style.display = "block";
            note_cont_elem.style.box
        }
        else{
            note_cont_elem.style.display = "none";
        }
    })
}

upload_icon.addEventListener("click", (event) => {
    //Need to open file explorer to choose image for sticky note
    let FE_input_elem = document.createElement("input");
    FE_input_elem.setAttribute("type", "file");
    FE_input_elem.click();
    FE_input_elem.addEventListener("change", (event) => {
        //Once file is chosen, 
        let img_file = FE_input_elem.files[0];  //Will upload a single image file, although we could choose multiple image files.
        let img_url = URL.createObjectURL(img_file);
        let StickyNoteTemplate = `<div class="header-cont">
                                    <div class="minimize"></div>
                                    <div class="remove"></div>
                                </div>
                                <div class="note-cont">
                                    <img src="${img_url}">
                                </div>`;  //will take image URL, instead of textarea input.
        createStickyNoteWindow(StickyNoteTemplate);
    })
})

function createStickyNoteWindow(StickyNoteTemplate){
    let stickynotes_cont_div = document.createElement("div");
    stickynotes_cont_div.setAttribute("class", "sticky-notes-cont");
    stickynotes_cont_div.innerHTML = StickyNoteTemplate  //will take image URL or textarea, based on caller.

    document.body.appendChild(stickynotes_cont_div);  //body is the parent element of stickynotes_cont_div.

    let SN_minimize_icon = stickynotes_cont_div.querySelector(".minimize");
    let SN_remove_icon = stickynotes_cont_div.querySelector(".remove");
    StickyNotesActions(SN_minimize_icon, SN_remove_icon, stickynotes_cont_div);

    //Logic for mouse drag & drop functionality
    stickynotes_cont_div.onmousedown = function(event) {
        dragAndDrop(stickynotes_cont_div, event);
    };
}