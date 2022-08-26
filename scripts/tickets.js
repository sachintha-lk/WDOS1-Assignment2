// Current Order as JS obj
let currentOrder = {
    type: "",
    number: 1,
    duration: "",
    foodToken: false,
    total:0
}

// Overall Order array will have the js objects of the orders when the order is placed
let overallOrder = [];

// costs given in the assignment stored as a js object
const cost = {
    type : {
        local: {
            adult: 1000,
            child: 500,
            annual: 4500
        },
        foreign: {
            adult: 5000,
            child: 2500,
            annual: 15000
        }
    },

    durationCharge: {
        local: {
            threeHours:0,
            halfday: 250,
            fullday: 500
        },
        foreign: {
            threeHours:0,
            halfday: 500,
            fullday: 1000
        }

    },
    extras: {
        foodToken: 500
    }
};

// calculating 2day by mulyipling cost per day by 2 and adding it to the cost obj
['local','foreign'].forEach( region => {
    cost.durationCharge[region].twodays = cost.durationCharge[region].fullday * 2;
})

// Element referneces
const ticketForm = document.getElementById("ticket-form");

// Current order section buttons
const btnOrderFav = document.getElementById("btn-order-fav");
const btnAddToFav = document.getElementById("btn-add-to-fav");
const btnAddToOrder = document.getElementById("btn-add-to-order");

// User input elements
const typeChoice = document.getElementById("type");
const numberOfPasses = document.getElementById("number");
const durationChoices = document.getElementsByName("duration");
const extraChoices = document.getElementsByName("extras");

// Overall order section buttons
const btnPlaceOrder = document.getElementById("btn-place-order");
const btnCheckLoyalty = document.getElementById("btn-check-loyalty")

// Output elements
const txtCurrentOrderTotal = document.getElementById("current-order-total");
const txtOverallOrderTotal = document.getElementById("overall-order-total");
const containerOverallOrder = document.getElementById("overall-order-items");



// Adding event listeners

document.addEventListener("DOMContentLoaded", resetCurrentOrder); // To make sure currentOrder and fields are blank in an event of reload

//current order buttons
btnOrderFav.addEventListener("click", orderFavorite);
btnAddToFav.addEventListener("click", addToFavoriteOrder);
btnAddToOrder.addEventListener("click", addToOrder);
//Overall order btns

btnPlaceOrder.addEventListener("click", placeOrder);
btnCheckLoyalty.addEventListener("click", checkLoyaltyPoints);

//input elements
typeChoice.addEventListener("change", typeUpdate);
durationChoices.forEach(duration => duration.addEventListener("change", durationUpdate));
extraChoices.forEach(extra => extra.addEventListener("change", extraUpdate));
numberOfPasses.addEventListener("change", numberUpdate);


// These functions will update the currentOrder objects values with user input
function typeUpdate() {
    currentOrder.type = this.value;
    disableFieldsIfNeeded(); // disables fields when annual pass is selected
    calculatePrice();
    
}

function durationUpdate() {
    currentOrder.duration = this.value;
    calculatePrice();
}

function numberUpdate() {
    currentOrder.number= parseInt(this.value);
    calculatePrice();
}

function extraUpdate() {
    if (this.value == "food-token") {
        if (this.checked) {
            currentOrder.foodToken = true;
            console.log("Food token checked");
        } else {
            currentOrder.foodToken = false;
            console.log("Food token unchecked");
        }
        calculatePrice();
    } else {
        alert("Error updating extras");
    }
}


// --

function addToFavoriteOrder() {
    if (ticketForm.checkValidity()) {
        if (confirm("WARNING: THIS WILL OVERWRITE ANY PREVIOUS FAVORITE ORDER \nDo you still want to set this order as favorite?")) {
            localStorage.setItem("fav-order", JSON.stringify(currentOrder));
            alert("Order set as favorite");
        }
    } else {
        alert("Please fill the order fields")
    }
}

function orderFavorite() {
    // Set the favorite Order as current order
    if (localStorage.getItem("fav-order") !== null) {
        currentOrder = JSON.parse(localStorage.getItem("fav-order"));
        console.log(currentOrder);
        setForm(currentOrder);
        disableFieldsIfNeeded();
    } else {
        alert("Sorry you haven't add any order to favorite");
    }

}

function setForm(order) {
    typeChoice.value = order.type;

    durationChoices.forEach((choice) => {
        if (order.duration === choice.value) {
            choice.checked = true;
        } else {
            choice.checked = false;
        }
    });
    extraChoices.forEach((choice => {
        if (choice.value === "food-token") {
            if(typeof(order.foodToken) === "boolean") {
                choice.checked = order.foodToken;  
            }
        }
    }));
    numberOfPasses.value = order.number;
    calculatePrice();
}

function addToOrder(evt) {
    if (ticketForm.checkValidity()) {
        evt.preventDefault();
        calculatePrice();
        overallOrder.push(currentOrder);
        calculateOverallTotal();
        let extrasText = "";
        if (currentOrder.foodToken) {
            extrasText = "Extras: Food Token";
        }
        orderItemElementHTML = `      
                    <div class="order-item">
                        <div class="order-type">${currentOrder.type.replace("-", " ").toUpperCase()}</div>
                        <div class="order-duration">${currentOrder.duration.replace("-", " ").toUpperCase()}</div>
                        <div class="order-extras">${extrasText}</div>
                        <div class="order-number-of-people">${currentOrder.number} passes</div>
                        <div class="order-price">${currentOrder.total} LKR</div>
                        <button class="remove-order btn-form" onclick="removeOrder(this)">X</button>                                      
                    </div>
                    `
        containerOverallOrder.innerHTML += orderItemElementHTML;
        
        resetCurrentOrder();
    } else {
        alert("Please fill all required fields")
    } 
}


function removeOrder(orderItem) {
    if(confirm("Are you sure you want to remove this order?")) {
        let index;
        // get the current order-item elements
        let orderItemElementList = document.querySelectorAll(".order-item");
        index = Array.prototype.indexOf.call(orderItemElementList, orderItem) ;
        overallOrder.splice(index); // removes the js object belonging to that order
        orderItem.parentElement.remove();
        calculateOverallTotal();
    }  
}

function resetCurrentOrder() {
    currentOrder = {
        type: "",
        number: 1,
        duration: "",
        foodToken: false,
        total:0
    }
    setForm(currentOrder);
    disableFields(false);
}

function disableFieldsIfNeeded() {
    if (currentOrder.type === "local-annual" || currentOrder.type === "foreign-annual"){
        disableFields(true);
        console.log("Disabled fields");
    
    } else {
        disableFields(false);
    }}
    
function disableFields(disable) {
    // disable parameter can be given a true value to disable, false to enable
    durationChoices.forEach( (durationChoice) => durationChoice.disabled = disable);
    extraChoices.forEach( (extraChoice) => extraChoice.disabled = disable); 
    if (disable == true) {
        currentOrder.duration = "";
        currentOrder.foodToken = false;
    }
    setForm(currentOrder);

}


// Calculate functions 

function calculatePrice() {
    let total = 0;
    let region = "";
    let passType = "";
    let duration = "";
    // split the type to two variables
    let orderTypeStrings = currentOrder.type.split("-");
    region = orderTypeStrings[0];
    console.log(region);
    passType = orderTypeStrings[1];
    console.log(passType);
    
    duration = currentOrder.duration;

    const regionTypeList = ['local', 'foreign'];
    const passTypeList = ['adult','child','annual'];
    const durationTypeList = ['threeHours', 'halfday', 'fullday', 'twodays'];

    // type and duration based price calculation
    // access the cost object with the string values stored in currentorder
    if ((regionTypeList.includes(region)) && (passTypeList.includes(passType))) {
        total += cost.type[region][passType]; 
        console.log(cost.type[region][passType]);
        if (durationTypeList.includes(duration)) {
            total += cost.durationCharge[region][duration];
        }
    }    

    if (currentOrder.foodToken === true) {
        total += cost.extras.foodToken;
    }

    total = total * currentOrder.number;
    currentOrder.total = total;
    txtCurrentOrderTotal.innerText = `${total} LKR`;
}

function calculateOverallTotal() {
    let overallOrderTotal = 0;
    overallOrder.forEach(order => overallOrderTotal += order.total);
    txtOverallOrderTotal.innerText = `${overallOrderTotal} LKR`;
}

// Loyalty points calculation
let totalLoyaltyPoints;

function addToLoyaltyPoints() {   
    let OverallOrderTotalPoints = 0;
    let OverallOrderLoyaltyPoints = 0;
    totalLoyaltyPoints = getLoyaltyPoints();
    overallOrder.forEach(order => {
        OverallOrderTotalPoints += order.number;
    });
    if (OverallOrderTotalPoints > 3) {
        OverallOrderLoyaltyPoints = OverallOrderTotalPoints * 20;
        totalLoyaltyPoints += OverallOrderLoyaltyPoints;
        // Save loyalty points to localStorage
        localStorage.setItem("loyaltyPoints", totalLoyaltyPoints);
        return `Congratualations you have earned ${OverallOrderLoyaltyPoints} Loyalty points!\nYour total loyalty points is ${totalLoyaltyPoints}`;
    } else {
        return "";
    }

}

function getLoyaltyPoints() {
    data = parseInt(localStorage.getItem("loyaltyPoints"), 10);
    if (isNaN(data)) {
        localStorage.setItem("loyaltyPoints", "0");
        return 0;
    } else {
        return data;
    }
}

function checkLoyaltyPoints() {
    totalLoyaltyPoints = getLoyaltyPoints();
    if (totalLoyaltyPoints === 0) {
        alert("Sorry you don't have any loyalty points");
    } else {
        alert(`You have ${totalLoyaltyPoints} loyalty points`);
    }
}


// Place order
function placeOrder() {
    if ((overallOrder.length !== 0)) {
        if (confirm("Are you sure you want to place this order?")) {
            // Calculate the loyalty points 
            let loyaltyPointsMessage = addToLoyaltyPoints();
            
            // If you want to send this data to a server, you can convert overallOrder array to JSON and send it

            // Clear overall order
            overallOrder = [];
            containerOverallOrder.innerHTML ="";
            resetCurrentOrder();
            calculateOverallTotal();
            alert(`Your order has been placed! Thank you! \n${loyaltyPointsMessage}`);

        }
    } else {
        alert("Sorry you haven't add any orders");
    }

}

