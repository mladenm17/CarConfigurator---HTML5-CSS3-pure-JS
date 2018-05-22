var apiUrl = 'https://api.mercedes-benz.com/configurator/v1/markets/de_DE';
var apiKey = 'b1210384-5634-4b3f-89ab-15a618870e8c';

var equipmentArray = [];
var technicalInfo = "";
var equipmentId;
var totalPrice;
var wheelPrice;
var equipmentElementPrice;
//fabrik pupup
(function() {
    var example = document.querySelector(".docs-DialogExample-lgHeader");
    var button = example.querySelector(".docs-DialogExample-button");
    var dialog = example.querySelector(".ms-Dialog");
    var label = example.querySelector(".docs-DialogExample-label")
    var actionButtonElements = example.querySelectorAll(".ms-Dialog-action");
    var actionButtonComponents = [];
    // Wire up the dialog
    var dialogComponent = new fabric['Dialog'](dialog);
    // Wire up the buttons
    for (var i = 0; i < actionButtonElements.length; i++) {
      actionButtonComponents[i] = new fabric['Button'](actionButtonElements[i], actionHandler);
    }
    // When clicking the button, open the dialog
    button.onclick = function() {
      fillFabrikPopUp();
      openDialog(dialog);
    };
    function actionHandler(event) {
      if(this.innerText.trim() == 'Cancel'){
        clearFabrikPopUp();
      }
      if(this.innerText.trim() == 'Save'){
          saveConfiguration();
      }
    }
    function openDialog(dialog) {
      // Open the dialog
      dialogComponent.open();
    }
  }());

//loading car bodies displayed in the left vertical menu
function loadBodies(){
    loadData(apiUrl+'/bodies?&apikey='+apiKey, getBodies);
}
function loadClasses(){
    //getting this variable before deleting all, because we want to keep this one
    var orders = localStorage.getItem('orders');
    localStorage.clear();  
    if(orders != null)
    localStorage.setItem('orders', orders);
    hideWeclomePage();
    showTiles();
    hideRightPriceTab();
    clearPreviousConfiguration();
    document.getElementById('finishedOrder').style.display = "none"; 
    var bodyId = event.target.value;
    localStorage.setItem("bodyId",bodyId);
    var bodyName = event.target.id;
    localStorage.setItem("bodyName",bodyName);
    loadData(apiUrl+'/classes?bodyId='+bodyId+'&apikey='+apiKey, getClasses);
}
function loadModels(){
    var classId = event.target.value;
    var className = event.target.id;
    localStorage.setItem("className",className);
    //showing models of selected class in the bottom
    document.getElementById('classDetailsBottom').style.height = "150px";
    var bodyId = localStorage.getItem("bodyId"); 
    loadData(apiUrl+'/models?classId='+classId+'&bodyId='+bodyId+'&apikey='+apiKey, getModels);
}
function loadModelConfiguration(){
    var modelId = localStorage.getItem("modelId");
    loadData(apiUrl+'/models/'+modelId+'/configurations/initial?apikey='+apiKey, getModelConfiguration);
}
function addColorToConfiguration(){
    var modelPrice = document.getElementById('modelPrice');
    modelPrice.classList.remove('animated');
    modelPrice.classList.remove('flash'); 
    //if default car color remained selected no need for adding it to configuration 
    if(event.target.value != "default") 
    {
        var colorId = event.target.value;
        var modelId = localStorage.getItem("modelId");
        var configurationId = localStorage.getItem("configurationId");
        loadData(apiUrl+'/models/'+modelId+'/configurations/'+configurationId+'/alternatives/+'+colorId+'?apikey='+apiKey, addComponentToConfiguration);
    }
}
function addWheelToConfiguration(){
    var modelPrice = document.getElementById('modelPrice');
    modelPrice.classList.remove('animated');
    modelPrice.classList.remove('flash'); 
    var wheelId = event.currentTarget.id;
    //collecting selected data to be shown on pup up
    var wheelSizeAndPrice = event.currentTarget.children[0].children[1].innerHTML;
    localStorage.setItem('hiddenWheelName', event.currentTarget.children[0].children[2].innerHTML);
    localStorage.setItem('wheelSizeAndPrice', wheelSizeAndPrice);
    var wheelPriceArray = wheelSizeAndPrice.split("|");
    //cutting off euro sign, setting varibale for showing in popup
    wheelPrice = wheelPriceArray[1].substr(0, wheelPriceArray[1].length - 1).trim();
    //graying and ungraying div background on selection/unselection
    var previousChoice = localStorage.getItem("wheelId");
    if(previousChoice != null)
    document.getElementById(previousChoice).style.backgroundColor = "white";
    document.getElementById(wheelId).style.backgroundColor = "lightgray";
    localStorage.setItem("wheelId", wheelId);
    var modelId = localStorage.getItem("modelId");
    var configurationId = localStorage.getItem("configurationId");
    loadData(apiUrl+'/models/'+modelId+'/configurations/'+configurationId+'/alternatives/+'+wheelId+'?apikey='+apiKey, addComponentToConfiguration);
}
function addEquipmentToConfiguration(){
    var modelPrice = document.getElementById('modelPrice');
    modelPrice.classList.remove('animated');
    modelPrice.classList.remove('flash'); 
    equipmentId = event.currentTarget.id;
    //collecting selected data by user to be shown on pup up
    var equipmentPrice = event.currentTarget.nextSibling.children[1].innerHTML;
    var equipmentName = event.currentTarget.nextElementSibling.children[0].innerHTML;
    //cutting off euro sign, setting varibale for showing in popup
    equipmentElementPrice = equipmentPrice.substr(0, equipmentPrice.length - 1).trim(); 
    var modelId = localStorage.getItem("modelId");
    var configurationId = localStorage.getItem("configurationId");
    if(document.getElementById(equipmentId).checked == true){   
        equipmentArray.push(equipmentName);
        loadData(apiUrl+'/models/'+modelId+'/configurations/'+configurationId+'/alternatives/+'+equipmentId+'?apikey='+apiKey, addComponentToConfiguration);
    }
    else{
        equipmentArray.pop(equipmentName);
        loadData(apiUrl+'/models/'+modelId+'/configurations/'+configurationId+'/alternatives/-'+equipmentId+'?apikey='+apiKey, removeComponentFromConfiguration);
    }
}
function saveConfiguration(){
    hideRightPriceTab();
    clearFabrikPopUp();
    var onlineeCode;
    var modelId = localStorage.getItem("modelId");
    var configurationId = localStorage.getItem("configurationId");
    var bodyJsonObject = JSON.stringify({"modelId":modelId,"configurationId":configurationId});
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var data = JSON.parse(this.response)
            console.log(data);
            onlineCode = data.onlineCode;
            localStorage.setItem("onlineCode", onlineCode);
            //do ajax call to load order details based on order online code
            loadData(apiUrl+'/onlinecode/'+onlineCode+'?apikey='+apiKey, getOrderDetails);
        }
    }
    xhttp.open('POST', apiUrl+'/onlinecode?apikey='+apiKey, true); 
    xhttp.setRequestHeader("Content-type", "application/json"); 
    xhttp.send(bodyJsonObject);
    clearPreviousConfiguration();
    document.getElementById('finishedOrder').style.display = "block";
    var h2 = document.createElement('h2');
    h2.innerHTML = 'Thanks! Order successful!'
    var p = document.createElement('p');
    p.innerHTML = 'Order summary: ';
    document.getElementById('finishedOrder').appendChild(h2);
    document.getElementById('finishedOrder').appendChild(p);
}
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
function loadDataExtended(url, callBackFunc, extraParam, extraParam2, extraParam3){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            callBackFunc(this.response, extraParam, extraParam2, extraParam3);
        }
    }
    xhttp.open('GET', url, true);  
    xhttp.send();
}
function getBodies(xhttpResponse){
    
    var data = JSON.parse(xhttpResponse);
    console.log('bodies:');  
    console.log(data);   
    data.forEach(element => {  
    if(element.bodyId == 1 || element.bodyId == 3 || element.bodyId == 5 || element.bodyId == 6 || element.bodyId == 13 || element.bodyId == 16){
        var item = document.createElement("li");   
        //translation of car bodies
        if(element.bodyId == 13){
            item.innerHTML = 'Hatchback';
            item.id = 'Hatchback';
        } 
        else if(element.bodyId == 3){
            item.innerHTML = 'Estate';
            item.id = 'Estate';
        }
        else if(element.bodyId == 16){
            item.innerHTML = 'SUV';
            item.id = 'SUV';
        }
        else{
            item.innerHTML = element.bodyName;
            item.id = element.bodyName;
        }         
        item.value = element.bodyId;
      
        document.getElementById('bodiesList').appendChild(item);  
    }    
    });  
}
function getModels(xhttpResponse){
    document.getElementById('modelsList').innerHTML = "";
    var data = JSON.parse(xhttpResponse);  
    console.log('models:');
    console.log(data);   
    data.forEach(element => {    
        var li = document.createElement('li');
        li.classList.add('modelItem');
        li.id = element.modelId;
        var text = document.createTextNode(element.shortName);    
        li.value = element.baumuster;
        li.appendChild(text);      
        li.onclick = showModelConfiguration;
        document.getElementById('modelsList').appendChild(li);
        });
}
function getClasses(xhttpResponse){ 
    // var className = "MarkoClass";
    // var bodyName = "MarkoBody";
    // var modelName = "MarkoModel";
    // totalPriceJSON = '333';
    // var orders = JSON.parse(localStorage.getItem('orders'));
    // if(orders != null){
    //     if(orders[className] == null){
    //         orders[className] = [];
    //         orders[className].push({"body":bodyName,  "model":modelName,  "totalPrice":totalPriceJSON});
    //     }
    //     else{             
    //         orders[className].push({"body":bodyName,  "model":modelName,  "totalPrice":totalPriceJSON});
    //     }
    // }
    // else{
    //     orders = {};
    //     orders[className] = [];
    //     orders[className].push({"body":bodyName,  "model":modelName,  "totalPrice":totalPriceJSON});
    // }
    clearTiles();
    var data = JSON.parse(xhttpResponse);
    console.log('classes:');    
    console.log(data); 
    var bodyId = localStorage.getItem('bodyId');   
    data.forEach(element => {
    if((bodyId == 6 && (element.classId == 253 || element.classId == 238 || element.classId == 257 || element.classId == 217 || element.classId == 190 || element.classId == 292)) || (bodyId == 1 && element.classId == 177) || (bodyId == 16 && element.classId == 463)){  
    //do not create tiles (no images for these classes)
    }
    else{
    var div = document.createElement('div');
    div.classList.add('tile');
    div.value = element.classId;
    var className = document.createElement('p');
    className.innerHTML = element.className;
    className.classList.add('className');
    var overlay = document.createElement('span');
    overlay.classList.add('overlay'); 
    var txtLayover = document.createElement('p');
    txtLayover.classList.add('txtLayover'); 
    txtLayover.innerHTML = 'Click for more';
    txtLayover.onclick = showClassDetails;
    txtLayover.value = element.classId;
    txtLayover.id = element.className; 
    div.appendChild(className);
    div.appendChild(txtLayover); 
    div.appendChild(overlay);
    loadImagesByCLass(div, element.classId, bodyId);
    document.getElementById('tilesListContent').appendChild(div);
    }});
}
function getModelConfiguration(xhttpResponse){
    equipmentArray = [];
    clearFabrikPopUp();
    localStorage.removeItem('wheelId');
    document.getElementById('finishedOrder').innerHTML = "";
    document.getElementById('finishedOrder').style.display = "none";
    document.getElementById('technicalInfo').innerHTML = "";
    var data = JSON.parse(xhttpResponse);    
    console.log('model configuration:');
    console.log(data);   
    loadData(data._links.image, loadVehicleImage);
    var configurationId = data.configurationId;
    localStorage.setItem('configurationId',configurationId);
    //setting technicalDetails aside car model picture
    technicalInfo = document.createElement('p');
    technicalInfo.innerHTML = "<strong>"+localStorage.getItem("bodyName") +" | "+localStorage.getItem("className") +" | "+ localStorage.getItem("modelName") + "</strong>"
    + "<br>"+ "Height: "+ data.technicalInformation.dimensions.height.value +"mm"+", Width: "+ data.technicalInformation.dimensions.width.value+"mm"+", Length: "+ data.technicalInformation.dimensions.length.value+"mm"
    + "<br>"+ "Doors: "+data.technicalInformation.doors 
    + "<br>"+ "Top speed: "+data.technicalInformation.topSpeed.value + "km/h"
    + "<br>"+ "Fuel type: "+data.technicalInformation.engine.fuelType 
    + "<br>"+ "Horse power: "+data.technicalInformation.engine.powerHp.value + " PS"  
    + "<br>"+ "Capacity: "+data.technicalInformation.engine.capacity.value +"cm"+"\u00B3"
    + "<br>"+ "Weight: "+data.technicalInformation.kerbWeight.value + "kg";
    document.getElementById('technicalInfo').appendChild(technicalInfo);
    //setting model price on the right info tab
    var modelPrice = document.getElementById('modelPrice');  
    modelPrice.innerHTML ="TOTAL: "+data.initialPrice.price + '\u20AC';
    localStorage.setItem("modelPrice",data.initialPrice.price);
    localStorage.setItem("modelInitPrice", data.initialPrice.price);
    //following link provided by API response to get components for specific model
    var selectablesUrl = data._links.selectables;
    loadData(selectablesUrl, getSelectables);   
}
function loadVehicleImage(xhttpResponse){
    var data = JSON.parse(xhttpResponse);    
    var vehicleExteriorImg = document.getElementById('vehicleExteriorImg');
    vehicleExteriorImg.src = data.vehicle.EXT020.url;
    localStorage.setItem('image', data.vehicle.EXT020.url);
    // var vehicleInteriorImg = new Image(70,70);
    // vehicleInteriorImg.src = data.vehicle.INT1.url; 
}
function getSelectables(xhttpResponse){
    var data = JSON.parse(xhttpResponse);    
    console.log('selectables:');
    console.log(data);  
    console.log('component categories');
    console.log(data.componentCategories); 
    data.componentCategories.forEach(element => {
        if(element.categoryName == 'PAINTS'){ 
            var i = 0;
            var defaultOption = document.createElement('option');
            defaultOption.innerHTML = 'default'; //| 0' + '\u20AC'; 
            defaultOption.value = "default";
            document.getElementById('colorSelector').appendChild(defaultOption);  
            element.subcategories.forEach(subcategory => {
                //reducing number of iterations due too many requests on api 
                if(i < 2){
                    subcategory.componentIds.forEach(componentId => {                                                         
                        var option = document.createElement('option');
                        option.innerHTML = data.vehicleComponents[componentId].name; //+" | "+data.vehicleComponents[componentId].priceInformation.price + '\u20AC';
                        option.value = componentId;
                        //option.value = data.vehicleComponents[componentId].priceInformation.price;
                        document.getElementById('colorSelector').appendChild(option);                                                                          
                    }); 
                } 
                i++;                                                       
            });
        }
        if(element.categoryName == 'WHEELS'){
            var i = 0;
            element.subcategories.forEach(subcategory => {  
                if(i < 3){
                    var n = 0;   
                    subcategory.componentIds.forEach(componentId => {
                    var tireSize = data.vehicleComponents[componentId].name;   
                    var tirePrice = data.vehicleComponents[componentId].priceInformation.price;                  
                    if(n < 4){          
                        loadDataExtended(data.vehicleComponents[componentId]._links.image, getConfigurationWheels, tireSize, componentId, tirePrice);   
                    }
                    n++;                           
                    });
                } 
                i++;                                                         
            });
        }
        if(element.categoryName == 'SPECIAL_EQUIPMENT'){
            var i = 0;
            element.subcategories.forEach(subcategory => {
                if(i < 3){
                    var n = 0;                          
                    subcategory.componentIds.forEach(componentId => {
                    var equipmentPrice = data.vehicleComponents[componentId].priceInformation.price;
                    var equipmentName = data.vehicleComponents[componentId].name;
                    if(n < 4){
                        loadDataExtended(data.vehicleComponents[componentId]._links.image, getConfigurationSpecEquipment, equipmentName, componentId, equipmentPrice);     
                    }
                    n++;                                                                   
                    });  
                } 
                i++;                                                  
            }); 
        }
    });
}
function getConfigurationWheels(xhttpResponse, tireSize, componentId, tirePrice){
    var data = JSON.parse(xhttpResponse);
    var li = document.createElement('li');
    li.id = componentId;
    var div = document.createElement('div'); 
    div.classList.add('configurationTilesWheels');
    //hidden element to be read and shown on fabrik popup later
    var hiddenTireName = document.createElement('p');         
    hiddenTireName.innerHTML = tireSize;
    hiddenTireName.classList.add('hiddenTireName'); 

    var p = document.createElement('p');         
    var tireSizeInches = tireSize.substr(tireSize.length - 5, 4); 
    p.innerHTML = tireSizeInches +" | " + tirePrice + '\u20AC';
    p.classList.add('tireSize');        
    var img = new Image(70,70);
    img.src = data.rim.url; 
    li.appendChild(div); 
    li.onclick = addWheelToConfiguration;                                      
    document.getElementById('wheelsList').appendChild(li);
    div.appendChild(img); 
    div.appendChild(p); 
    div.appendChild(hiddenTireName);
}
function getConfigurationSpecEquipment(xhttpResponse, equipmentName, componentId, equipmentPrice){
    var data = JSON.parse(xhttpResponse);
    var div = document.createElement('div'); 
    div.classList.add('configurationTilesEquipment');
    var img = new Image(200,100);
    img.src = data.equipment.url;    
    var chkBox = document.createElement('input');
    chkBox.setAttribute('type',"checkbox");
    chkBox.setAttribute('name', componentId);
    chkBox.value = equipmentPrice;
    chkBox.id = componentId;
    chkBox.onclick =  addEquipmentToConfiguration;
    var descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('equipmentDescription');  

    var equipmentNameText = document.createElement('p'); 
    equipmentNameText.innerHTML = equipmentName;  
    equipmentNameText.classList.add('equipmentNameText');  

    var equipmentPriceText = document.createElement('p'); 
    equipmentPriceText.innerHTML = equipmentPrice + '\u20AC';
    equipmentPriceText.classList.add('equipmentPriceText');  

    descriptionDiv.appendChild(equipmentNameText);  
    descriptionDiv.appendChild(equipmentPriceText);  
    document.getElementById('specEquipment').appendChild(div);  
    div.appendChild(img);                    
    div.appendChild(chkBox); 
    div.appendChild(descriptionDiv); 
}
function addComponentToConfiguration(xhttpResponse){
    var data = JSON.parse(xhttpResponse); 
    localStorage.setItem('configurationId', data[0].configurationId)
    loadData(data[0]._links.image, loadVehicleImage);
    //with selected component, some extra components are obligatory and included in package, 
    //so it is necessary to aware user of adding extra components to price, in popup window
    var addedComponentsTotalPrice = document.createElement('p');
    addedComponentsTotalPrice.innerHTML = "TOTAL: "+data[0].priceInformation.price + '\u20AC';
  
    addedComponentsTotalPrice.classList.add('addedComponentsTotalPrice');;
    var popupFooter = document.getElementsByClassName('popupFooter');
   
    if(data[0].addedComponents.length != 0)
    {
        var choosedComponentDiv = document.getElementById('choosedComponent');
        var addedComponentsDiv = document.getElementById('addedComponents');
        var removedComponentsDiv = document.getElementById('removedComponents');

        var choosedComponent = document.createElement('p');
        choosedComponent.classList.add('popupComponents');
        choosedComponent.innerHTML = data[0].addedComponents[data[0].addedComponents.length - 1].name;
        choosedComponentDiv.appendChild(choosedComponent);

        var choosedComponentPrice = document.createElement('p');
        choosedComponentPrice.classList.add('popupComponentsPrice');
        choosedComponentPrice.innerHTML = data[0].addedComponents[data[0].addedComponents.length - 1].priceInformation.price + '\u20AC'; 
        choosedComponentDiv.appendChild(choosedComponentPrice);
 
        //slicing last element not to be shown twice (it will be shown in "you choosed" section above)
        var arrayWithouthLastElement = data[0].addedComponents.slice(0, (data[0].addedComponents.length - 1));
        arrayWithouthLastElement.forEach(element => {
            var addedComponent = document.createElement('p');
            addedComponent.innerHTML = element.name;
            addedComponent.classList.add('popupComponents');
            addedComponentsDiv.appendChild(addedComponent);
            var addedComponentPrice = document.createElement('p');
            addedComponentPrice.innerHTML = element.priceInformation.price + '\u20AC'; 
            addedComponentPrice.classList.add('popupComponentsPrice');
            addedComponentsDiv.appendChild(addedComponentPrice);
            popupFooter[0].appendChild(addedComponentsTotalPrice);
            //showing div in case there are added components to show
            addedComponentsDiv.style.display = "block";
            showPopUp();
        });
    }
    if(data[0].removedComponents.length != 0)
    {   
        data[0].removedComponents.forEach(element => {   
            var removedComponent = document.createElement('p');
            removedComponent.innerHTML = element.name;
            removedComponent.classList.add('popupComponents');
            removedComponentsDiv.appendChild(removedComponent);
            var removedComponent = document.createElement('p');
            removedComponent.innerHTML = element.priceInformation.price + '\u20AC'; 
            removedComponent.classList.add('popupComponentsPrice');
            removedComponentsDiv.appendChild(removedComponent);
            popupFooter[0].appendChild(addedComponentsTotalPrice);
            //showing div in case there are removed components to show
            removedComponentsDiv.style.display = "block";        
            showPopUp();
        });
    }
    sumTotalPrice(data);
}
function sumTotalPrice(data){
        //summing total price to be shown on the right price info panel
        var componentsPrice = data[0].priceInformation.price; 
        localStorage.setItem('componentPrice', componentsPrice);   
        //checking if componentsPrice(returned by API) is not 0 or wheelPrice(read from html) is not 0
        //because if no extra components are added, componentsPrice is 0 and pop up will not be shown,
        //so price must be read from wheelPrice variable in order to be counted 
        var initialPrice = localStorage.getItem("modelPrice"); 
        if(componentsPrice != 0){      
            totalPrice = Number(initialPrice) + componentsPrice;     
        } 
        else if(wheelPrice != 0 && wheelPrice != null){     
            totalPrice = Number(initialPrice) + Number(wheelPrice);
            //total price is shown without popup and confirm buton
            var modelPrice = document.getElementById('modelPrice');
            modelPrice.classList.add('animated');
            modelPrice.classList.add('flash'); 
            modelPrice.innerHTML = "TOTAL: "+totalPrice.toFixed(1)+ '\u20AC';
            //setting wheel price back to zero because it's global variable
            //so next time if something else is clicked, this codition will not be affected
            wheelPrice = 0;
        }
        else if(equipmentElementPrice != 0 && equipmentElementPrice != null){       
            totalPrice = Number(initialPrice) + Number(equipmentElementPrice);
            //total price is shown without popup and confirm buton
            var modelPrice = document.getElementById('modelPrice');
            modelPrice.classList.add('animated');
            modelPrice.classList.add('flash'); 
            modelPrice.innerHTML = "TOTAL: "+totalPrice.toFixed(1)+ '\u20AC';
            //setting wheel price back to zero because it's global variable
            //so next time if something else is clicked, this IF codition will not be affected
            equipmentElementPrice = 0;
        }
        //total price is calculated, and it will be shown only if user clicks "confirm" button, 
        //and this is implemented in "confirmOrder()" function below
        localStorage.setItem("modelPrice", totalPrice);
        if(totalPrice == null){
            localStorage.setItem("modelPrice", initialPrice);
        }
}
function confirmOrder(){
    closePopUp();
    var modelPrice = document.getElementById('modelPrice');
    modelPrice.classList.add('animated');
    modelPrice.classList.add('flash'); 
    modelPrice.innerHTML = "TOTAL: "+totalPrice.toFixed(1)+ '\u20AC';
}
function removeComponentFromConfiguration(xhttpResponse){
    var data = JSON.parse(xhttpResponse);
    localStorage.setItem('configurationId', data[0].configurationId)
    var removedComponentPrice = localStorage.getItem('addedComponentsTotalPrice');
    if(removedComponentPrice != 0){
        var initialPrice = localStorage.getItem("modelPrice");  
        var totalPrice = Number(initialPrice) - removedComponentPrice;
        localStorage.setItem("modelPrice", totalPrice);
        var modelPrice = document.getElementById('modelPrice');
        modelPrice.classList.add('animated');
        modelPrice.classList.add('flash');  
        modelPrice.innerHTML ="TOTAL: "+totalPrice.toFixed(1)+ '\u20AC'; 
    }
    console.log('configuredPackage:');
    console.log(data);  
}
function getOrderDetails(xhttpResponse){
    var data = JSON.parse(xhttpResponse);
    console.log("order details");
    console.log(data);
    var className = localStorage.getItem("className");
    var bodyName = localStorage.getItem("bodyName");
    var modelName = localStorage.getItem("modelName");
    var image = localStorage.getItem("image");
    var onlineCode = localStorage.getItem("onlineCode");
    var totalPriceJSON = data.configurationPrice.price;
    //setting all orders in JSON object, to be showed in ViewOrders page later
    var orders = JSON.parse(localStorage.getItem('orders'));
    if(orders != null){
        if(orders[className] == null){
            orders[className] = [];
            orders[className].push({"body":bodyName,  "model":modelName,  "totalPrice":totalPriceJSON, "image":image, "onlineCode":onlineCode});
        }
        else{             
            orders[className].push({"body":bodyName,  "model":modelName,  "totalPrice":totalPriceJSON, "image":image, "onlineCode":onlineCode});
        }
    }
    else{
        orders = {};
        orders[className] = [];
        orders[className].push({"body":bodyName,  "model":modelName,  "totalPrice":totalPriceJSON, "image":image, "onlineCode":onlineCode});
    }

    var JSONStore = JSON.stringify(orders);
    localStorage.setItem('orders', JSONStore);

    createOrderTable(xhttpResponse, bodyName, className, modelName);
}
function createOrderTable(xhttpResponse, bodyName, className, modelName){
    var data = JSON.parse(xhttpResponse);
    //creating first table that contains general data about order
    var generalDataTableLeft = document.createElement('table');
    generalDataTableLeft.classList.add('orderDetailsTable');
    generalDataTableLeft.classList.add('tableLeft');

    //table row
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = 'Body';
    var td = document.createElement('td');
    td.innerHTML = bodyName;    
    tr.appendChild(th);  
    tr.appendChild(td);
    generalDataTableLeft.appendChild(tr); 

    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = 'Class';
    var td = document.createElement('td');
    td.innerHTML = className;    
    tr.appendChild(th);  
    tr.appendChild(td);
    generalDataTableLeft.appendChild(tr); 

    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = 'Model';
    var td = document.createElement('td');
    td.innerHTML = modelName;    
    tr.appendChild(th);  
    tr.appendChild(td);
    generalDataTableLeft.appendChild(tr); 

    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = 'Initial price (\u20AC)'; 
    var td = document.createElement('td');
    td.innerHTML = data.initialPrice.price;      
    tr.appendChild(th);  
    tr.appendChild(td);
    generalDataTableLeft.appendChild(tr); 

    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = 'Built - configured price (\u20AC)'; 
    var td = document.createElement('td');
    td.innerHTML = (data.configurationPrice.price - data.initialPrice.price).toFixed(1); 
    tr.appendChild(th);  
    tr.appendChild(td);
    generalDataTableLeft.appendChild(tr); 

    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.innerHTML = 'TOTAL PRICE (\u20AC)';
    var td = document.createElement('td');
    td.innerHTML = "<strong>" + data.configurationPrice.price + "</strong>";             
    tr.appendChild(th);  
    tr.appendChild(td);
    generalDataTableLeft.appendChild(tr); 

    document.getElementById('finishedOrder').appendChild(generalDataTableLeft);
    //end of table

    var generalDataSpec = document.createElement('div');
    generalDataSpec.classList.add('tableRight');

    var generalDataSpecWrapper = document.createElement('div');
    generalDataSpecWrapper.classList.add('tableRightWrapper');
    var generalDataHeading = document.createElement('h3');
    generalDataHeading.innerHTML = "Short vehicle specification";

    //list
    var ul = document.createElement('ul');
    ul.classList.add('shortSpecList');

    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Height: "+"</strong>"+ data.technicalInformation.dimensions.height.value +"mm";    
    ul.appendChild(li); 
    
    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Doors: "+"</strong>"+data.technicalInformation.doors;    
    ul.appendChild(li); 

    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Top speed: "+"</strong>"+data.technicalInformation.topSpeed.value + "km/h";    
    ul.appendChild(li); 
    
    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Width: "+"</strong>"+ data.technicalInformation.dimensions.width.value+"mm";    
    ul.appendChild(li); 

    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Fuel type: "+"</strong>"+data.technicalInformation.engine.fuelType;    
    ul.appendChild(li); 

    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Horse power: "+"</strong>"+data.technicalInformation.engine.powerHp.value + " PS";    
    ul.appendChild(li); 

    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Length: "+"</strong>"+ data.technicalInformation.dimensions.length.value+"mm";    
    ul.appendChild(li); 

    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Weight: "+"</strong>"+data.technicalInformation.kerbWeight.value + "kg";    
    ul.appendChild(li); 

    var li = document.createElement('li');
    li.classList.add('shortSpecListElement');
    li.innerHTML = "<strong>" + "Capacity: "+"</strong>"+data.technicalInformation.engine.capacity.value +"cm"+"\u00B3";    
    ul.appendChild(li); 

    generalDataSpecWrapper.appendChild(generalDataHeading);
    var hr = document.createElement('hr');
    generalDataSpecWrapper.appendChild(hr);
    generalDataSpecWrapper.appendChild(ul);
    generalDataSpec.appendChild(generalDataSpecWrapper);
    document.getElementById('finishedOrder').appendChild(generalDataSpec);
    //end of table

    //creating second table containg vehicle components about order
    var table = document.createElement('table');
    table.classList.add('orderDetailsTable');
    //table row
    var tr = document.createElement('tr');
    //table headers
    var th = document.createElement('th');
    th.innerHTML = 'Vehicle components'; 
    tr.appendChild(th);
    var th = document.createElement('th');
    th.innerHTML = 'Component type'; 
    tr.appendChild(th);
    var th = document.createElement('th');
    th.innerHTML = 'Price (\u20AC)'; 
    tr.appendChild(th);
    //end of headers
    table.appendChild(tr);
    //end of row
    //filling table rows with data from api array, with vehicle components
    var vehicleComponents = data.vehicleComponents.forEach(element => {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.innerHTML = element.name;    
        tr.appendChild(td);       
        var td = document.createElement('td');
        td.innerHTML = element.componentType;    
        tr.appendChild(td);
        var td = document.createElement('td');
        td.innerHTML = element.priceInformation.price;    
        tr.appendChild(td);
        table.appendChild(tr);
    });
    document.getElementById('finishedOrder').appendChild(table);
}
function fillFabrikPopUp(){
    var content = document.getElementById('ms-Dialog-content');
    if(content.children[0] == null){
        var generalDescription = document.createElement('p');;
        generalDescription.innerHTML = technicalInfo.innerHTML;
        content.appendChild(generalDescription);
    }
   
    var select = document.getElementById('colorSelector');
    var colorName = select.options[select.selectedIndex].text;
    var color = document.createElement('p');
    color.innerHTML = colorName;
    color.classList.add('popupComponents');
    document.getElementById('selectedColor').appendChild(color);

    var wheel = document.createElement('p');
    wheel.innerHTML = localStorage.getItem('hiddenWheelName');
    wheel.classList.add('popupComponents');
    document.getElementById('selectedWheel').appendChild(wheel);

    if(equipmentArray.length != 0){
        equipmentArray.forEach(element => {
            var equipment = document.createElement('p');
            equipment.innerHTML = element;
            equipment.classList.add('popupComponents');
            document.getElementById('selectedEquipment').appendChild(equipment);
        });
    }
    else{
        var equipment = document.createElement('p');
            equipment.innerHTML = "none";
            equipment.classList.add('popupComponents');
            document.getElementById('selectedEquipment').appendChild(equipment);
    }
    var initPrice = localStorage.getItem("modelInitPrice");
    var initialPriceText = document.createElement('p');
    initialPriceText.innerHTML = "<strong>"+"Initial price: "+initPrice + '\u20AC' + "</strong>";
    initialPriceText.classList.add('fabrikPopUpPriceInfo');
    initialPriceText.classList.add('reset');
    document.getElementById('priceInfoPopUp').appendChild(initialPriceText);
  
    var builtPrice = Number(localStorage.getItem("modelPrice"));
    var priceDifference = document.createElement('p');
    priceDifference.innerHTML = "<strong>"+"Added components price: "+(builtPrice - initPrice).toFixed(1) + '\u20AC' + "</strong>";
    priceDifference.classList.add('fabrikPopUpPriceInfo');
    priceDifference.classList.add('reset');
    document.getElementById('priceInfoPopUp').appendChild(priceDifference);

    var totalBuiltPrice = document.createElement('p');
    totalBuiltPrice.innerHTML = "<strong>"+"TOTAL price: "+ builtPrice.toFixed(1) + '\u20AC' + "</strong>";
    totalBuiltPrice.classList.add('fabrikPopUpPriceInfo');
    totalBuiltPrice.classList.add('totalPriceStrong');
    totalBuiltPrice.classList.add('reset');
    document.getElementById('priceInfoPopUp').appendChild(totalBuiltPrice);
}
function showPopUp(){
    var popup = document.getElementById("popup1");
    popup.classList.add("show");
}
function closePopUpAndUncheckChkBox(){
    closePopUp();
    if(equipmentId != null)
    document.getElementById(equipmentId).checked = false;
}
function closePopUp(){
    var popup = document.getElementById("popup1");
    popup.classList.remove("show");
    var popupComponents = document.getElementsByClassName('popupComponents');
    while (popupComponents.length > 0) popupComponents[0].remove();
    
    var popupComponentsPrice = document.getElementsByClassName('popupComponentsPrice');
    while (popupComponentsPrice.length > 0) popupComponentsPrice[0].remove();

    var addedComponentsTotalPrice = document.getElementsByClassName('addedComponentsTotalPrice');
    while (addedComponentsTotalPrice.length > 0) addedComponentsTotalPrice[0].remove();

    document.getElementById('addedComponents').style.display = "none";
    document.getElementById('removedComponents').style.display = "none";
}
function clearFabrikPopUp(){
    var popupComponents = document.getElementsByClassName('popupComponents');
    while (popupComponents.length > 0) popupComponents[0].remove();
    
    var fabrikPriceInfo = document.getElementsByClassName('fabrikPopUpPriceInfo');
    while (fabrikPriceInfo.length > 0) fabrikPriceInfo[0].remove();
}
function openNav() {
    document.getElementById('bodiesSidenav').style.width = "180px";
    document.getElementById('openMenu').style.marginLeft = "175px";
    document.getElementById('closeMenu').style.marginLeft = "175px";
    document.getElementById('closeMenu').style.visibility = 'visible';
    document.getElementById('openMenu').style.visibility = 'hidden';
    document.getElementById('bodiesList').style.visibility = 'visible';
}
function closeNav() {
    document.getElementById('bodiesSidenav').style.width = "10px";
    document.getElementById('openMenu').style.marginLeft = "0px";
    document.getElementById('closeMenu').style.marginLeft = "0px";
    document.getElementById('closeMenu').style.visibility = 'hidden';
    document.getElementById('openMenu').style.visibility = 'visible';
    document.getElementById('bodiesList').style.visibility = 'hidden';
}
function hideWeclomePage(){
    document.getElementById('welcomePageContent').style.display="none";  
}
function showTiles(){
    document.getElementById('tilesListContent').style.display="block";
}
function clearPreviousConfiguration(){
    document.getElementById('modelConfig').style.display="none"; 
    document.getElementById('vehicleExteriorImg').innerHTML = ""; 
    document.getElementById('colorSelector').innerHTML = ""; 
    document.getElementById('wheelsList').innerHTML = ""; 
    document.getElementById('specEquipment').innerHTML = "";  
    document.getElementById('modelPrice').innerHTML = "";  
}
function showClassDetails(){
    loadModels();
}
function clearTiles(){
    document.getElementById('tilesListContent').innerHTML = "";
}
function minimizeClassDetails(){
    document.getElementById("classDetailsBottom").style.height = "0px";
}
function showModelConfiguration(){
    minimizeClassDetails();
    clearTiles();
    showRightPriceTab();
    var modelId = event.currentTarget.id;
    localStorage.setItem("modelId", modelId);
    var modelName = event.target.innerHTML;
    localStorage.setItem("modelName", modelName);
    document.getElementById('tilesListContent').style.display="none"; 
    document.getElementById('modelConfig').style.display="block"; 
    loadModelConfiguration();
}
function showRightPriceTab(){
    document.getElementById('priceInfo').style.width = "230px";
    document.getElementById('priceInfo').style.height = "15%";
}
function hideRightPriceTab(){
    document.getElementById('priceInfo').style.width = "0px";
    document.getElementById('priceInfo').style.height = "0%";
}
function loadImagesByCLass(div, classId, bodyId){
    // SUVs
    if(classId == 253 && bodyId == 16){ 
      div.style.backgroundImage = 'url(Images/classes/SUVs/GLC.png)';     
    } 
    else if(classId == 156){ 
        div.style.backgroundImage = 'url(Images/classes/SUVs/GLA.png)';   
    } 
    else if(classId == 'X66'){ 
        div.style.backgroundImage = 'url(Images/classes/SUVs/GLS.png)';
    } 
    else if(classId == 'M66'){ 
        div.style.backgroundImage = 'url(Images/classes/SUVs/GLE.png)';
    } 
    //Hatchbacks
    else if(classId == 246){ 
        div.style.backgroundImage = 'url(Images/classes/Hatchbacks/B-Class.png)';
    } 
    //Limosines
    else if(classId == 222){ 
        div.style.backgroundImage = 'url(Images/classes/Limo/S-Class.png)';
    } 
    else if(classId == 213 && bodyId == 1){ 
        div.style.backgroundImage = 'url(Images/classes/Limo/E-Class.png)';
    } 
    else if(classId == 205 && bodyId == 1){ 
        div.style.backgroundImage = 'url(Images/classes/Limo/C-Class.png)';
    } 
    //Estates (caravan)
    else if(classId == 213){ 
        div.style.backgroundImage = 'url(Images/classes/Estates/E-Class.png)';
    } 
    else if(classId == 205 && bodyId == 3){ 
        div.style.backgroundImage = 'url(Images/classes/Estates/C-Class.png)';
    } 
    //Cabrio
    else if(classId == 205 && bodyId == 5){ 
        div.style.backgroundImage = 'url(Images/classes/Cabrio/C-Class.png)';
    }   
    else if(classId == 217 && bodyId == 5){ 
        div.style.backgroundImage = 'url(Images/classes/Cabrio/S-Class.png)';
    }   
    //Coupe
    else if(classId == 117){ 
        div.style.backgroundImage = 'url(Images/classes/Coupe/CLA.png)';    
    } 
}

//view orders html
function loadMenu(){
    loadData(apiUrl+'/classes?apikey='+apiKey, getClassesForMenu);
}
function getClassesForMenu(xhttpResponse){ 
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
    var classNameInMenu = event.currentTarget.innerText;
    localStorage.setItem('classNameInMenu', classNameInMenu);
    document.getElementById('finishedOrder').innerHTML = "";
    document.getElementById('finishedOrder').style.display = "none";
    document.getElementById('grid').innerHTML = "";

    var orders = JSON.parse(localStorage.getItem('orders'));
    if(orders == null){
        swal("Empty!", "No orders for this class!", "warning");
    }
    else{
        if(orders[classNameInMenu] != null){
            orders[classNameInMenu].forEach(orderItem => {
                   
            var flipContainer = document.createElement('div');
            flipContainer.classList.add('flip-container');
            flipContainer.ontouchstart = this.classList.toggle('hover');

            var flipper = document.createElement('div');
            flipper.classList.add('flipper');

            var front = document.createElement('div');
            front.style.background = "transparent url('"+orderItem.image+"') no-repeat center center / cover";
            front.classList.add('front');
            front.innerHTML = 'ORDER CODE: '+orderItem.onlineCode;

            var back = document.createElement('div');
            back.classList.add('back');

            var backText = document.createElement('p');
            backText.innerHTML = orderItem.body + "<br><strong>" + orderItem.model + "</strong><br>" + "<br>"+"Total price: <br><strong>"+orderItem.totalPrice +"</strong>" + " \u20AC";
            backText.classList.add('tileText');
            back.appendChild(backText);
            back.onclick = orderDetailsClicked;

            flipper.appendChild(front);
            flipper.appendChild(back);

            flipContainer.appendChild(flipper);
            document.getElementById('grid').appendChild(flipContainer);
            });
        }  
        else{
            swal("Empty!", "No orders for this class!", "warning");
        }    
    }    
}
function resetOrders(){
    localStorage.clear();
}
function orderDetailsClicked(){
    var title = event.currentTarget.previousSibling.innerText;
    var stringArray = title.split(':');
    var onlineCode = stringArray[1].trim();
    var backText = event.currentTarget.innerText;
    var backStringArray = backText.split(/\r?\n/);
    var bodyName = backStringArray[0];
    var modelName = backStringArray[1];
    var className = localStorage.getItem('classNameInMenu');

    document.getElementById('grid').innerHTML = "";
    document.getElementById('finishedOrder').style.display = "block";
    loadDataExtended(apiUrl+'/onlinecode/'+onlineCode+'?apikey='+apiKey, createOrderTable, bodyName, className, modelName);
}
 









