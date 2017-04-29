//welcome to main.js!

//check if everything works

var text = "";
for(var period in ADay.schedule){
    text += ADay.schedule[period].getName() + "--" + ADay.schedule[period].getTimeSlot() + "<br>";
}

document.getElementById("Text").innerHTML = text;

function onClick(){
    //document.getElementById("Text").innerHTML = "Hello World"
}
