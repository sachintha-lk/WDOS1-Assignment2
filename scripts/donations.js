const donationForm = document.getElementById("fixed-donation-form");

const fullname = document.getElementById("fullname");
const address = document.getElementById("address");
const email = document.getElementById("email");

const ccNumber = document.getElementById("cc-number");
const expiryMonthSelect = document.getElementById("expiry-month");
const expiryYearSelect = document.getElementById("expiry-year");
const cvv = document.getElementById("cvv");

const donationAmounts = document.getElementsByName("donation-amount");



const btnDonate = document.getElementById("donate-button");

// auto generate expiry years for 15 years from the current yr
const date = new Date();
const currentYear = date.getFullYear();
let year = currentYear;
for (let i = 0; i < 14; i++) {
    expiryYearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    year++;
}

btnDonate.addEventListener("click", donate);


// donation = {
//     fullname: "",
//     address: "",
//     email: "",
//     ccNumber: "",
//     expiryMonth:"",
//     expiyYear: "",
//     cvv: "",
//     donationAmount:""
// }
function donate(evt) {
    evt.preventDefault();
    if (donationForm.checkValidity()) {
        let ccNumberValid = false;
        let cvvValid = false;
        let amountDonated = 0;
        donationAmounts.forEach(amount => {
            if (amount.checked) {
                amountDonated = amount.value;
          }
        });
        if (parseInt(ccNumber.value) !== "NaN") {
            if(ccNumber.value.length === 16) {
                ccNumberValid = true;
            } else {
                alert("Number of digits in credit card should be 16");
            }
        } else {
             alert("Please enter credit card number in digits");
        }
        if (isNaN(parseInt(cvv.value))) {
            alert("Please enter cvv in digits");
        } else {
            if (cvv.value.length === 3) {
                cvvValid = true;
            } else {
                alert("Number of digits in CVV should be 3");
            }
        }

        if (ccNumberValid && cvvValid) {
            evt.preventDefault();
            resetForm();
            alert(`Thank you for your donation of ${amountDonated}`);
        }
            
    } else {
        alert("Please fill out all the fields");
    }
        
}

function resetForm() {
    fullname.value = "";
    address.value = "";
    email.value = "";
    ccNumber.value = "";
    expiryYearSelect.value = "";
    expiryMonthSelect.value = "";
    cvv.value = "";
    donationAmounts.forEach(checkbox => checkbox.checked = false);
}



