function getCurrentDate() {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let min = date.getMinutes().toString().padStart(2, '0');
    let second = date.getSeconds().toString().padStart(2, '0');
    let hour = date.getHours().toString().padStart(2, '0');

    return `${hour}:${min}:${second} ${month}/${day}/${year}`;
}

function updateHeaderTime() {
    document.getElementById("timer").innerHTML = getCurrentDate();
}

window.onload = function() {
    updateHeaderTime(); 
    setInterval(updateHeaderTime, 1000); 
};

const pets = ["pet1.jpeg", "pet2.jpeg"];
let current = 0;

function update() {
    let slideshow = document.getElementById("slideshow");
    slideshow.src = pets[current];
}

function nextSlide() {
    current = (current + 1) % pets.length;
    update();
}

function prevSlide() {
    current = (current - 1 + pets.length) % pets.length;
    update();
}

function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailPattern.test(email);
}

function validateForm(event) {
    event.preventDefault();

    let form = event.target;
    let isValid = true;

    form.querySelectorAll('input[type="text"], input[type="radio"], input[type="email"]').forEach(input => {
        if (input.type === "text" && input.value.trim() === "" ||
            input.type === "radio" && !form.querySelector(`input[name="${input.name}"]:checked`) ||
            input.type === "email" && !validateEmail(input.value)) {
            isValid = false;
            input.style.borderColor = "red";
        } else {
            input.style.borderColor = "";
        }
    });

    if (isValid) {
        form.submit();
    } else {
        alert("Please fill in all the required fields and provide a valid email.");
    }
}

document.querySelector('form').addEventListener('submit', validateForm);