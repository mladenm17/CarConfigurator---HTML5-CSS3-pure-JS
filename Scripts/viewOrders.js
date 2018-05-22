var apiUrl = 'https://api.mercedes-benz.com/configurator/v1/markets/de_DE';
var apiKey = 'b1210384-5634-4b3f-89ab-15a618870e8c';

function loadData(url, callBackFunc){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            callBackFunc(this.response);
        }
    }
    xhttp.open('GET', url, true);  
    xhttp.send();
}
function loadMenu(){
    loadData(apiUrl+'/classes?apikey='+apiKey, getClasses);
}
function getClasses(xhttpResponse){ 

    var data = JSON.parse(xhttpResponse);
    console.log('classes:');    
    console.log(data); 
     
    data.forEach(element => {
        if(element.classId != 450 && element.classId != 453 && element.classId != "X22" && element.classId != "238"){
        var li = document.createElement('li');
        var text = document.createTextNode(element.className);    
        var a = document.createElement('a');
        a.onclick = loadTiles;
        li.appendChild(a).appendChild(text);            
        document.getElementById('menuList').appendChild(li);
    }
})};
function loadTiles(){
    var colors = ['purple', 'DarkCyan ', 'orange', 'brown', 'black', 'DarkGoldenRod ', 'BurlyWood ', 'Chocolate '];
    
    for(i = 0; i < 8; i++){
    var flipContainer = document.createElement('div');
    flipContainer.classList.add('flip-container');
    flipContainer.ontouchstart = this.classList.toggle('hover');

    var flipper = document.createElement('div');
    flipper.classList.add('flipper');

    var front = document.createElement('div');
    front.style.backgroundColor = colors[i];
    front.classList.add('front');
    front.innerHTML = 'front';

    var back = document.createElement('div');
    back.classList.add('back');
    back.innerHTML = 'back';
    flipper.appendChild(front);
    flipper.appendChild(back);

    flipContainer.appendChild(flipper);
    document.getElementById('grid').appendChild(flipContainer);
    } 
}