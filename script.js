// ============================
// FRONTEND UI EFFECTS
// ============================

// NAVBAR ACTIVE LINK
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop();
    document.querySelectorAll(".nav-links a").forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
});

// MOBILE NAVBAR TOGGLE
const menuToggle = document.createElement("div");
menuToggle.classList.add("menu-toggle");
menuToggle.innerHTML = "&#9776;";
document.querySelector(".navbar").prepend(menuToggle);

menuToggle.addEventListener("click", () => {
    document.querySelector(".nav-links").classList.toggle("show");
});

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

// FADE-IN ON SCROLL
const faders = document.querySelectorAll(".fade-in");
const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };

const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("appear");
        observer.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(fader => appearOnScroll.observe(fader));

// POPUP MESSAGE
function showPopup(message, isError = false) {
    const popup = document.createElement("div");
    popup.classList.add("popup-message");
    popup.textContent = message;
    if (isError) popup.classList.add("error-popup");

    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 10);
    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// ============================
// BACKEND API FUNCTIONS
// ============================

const BASE_URL = "http://localhost:5000/api";

// Helper: Get JWT token
function getToken() {
    return localStorage.getItem("token");
}

// REGISTER USER
async function registerUser(name, email, password, role) {
    try {
        const res = await fetch(`${BASE_URL}/users/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();
        if (data.token) localStorage.setItem("token", data.token);
        showPopup(data.message);
    } catch (err) {
        console.error(err);
        showPopup("Error registering user", true);
    }
}

// LOGIN USER
async function loginUser(email, password) {
    try {
        const res = await fetch(`${BASE_URL}/users/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            showPopup("Login successful");
        } else {
            showPopup(data.message || "Login failed", true);
        }
    } catch (err) {
        console.error(err);
        showPopup("Error logging in", true);
    }
}

// ADD FOOD (DONOR)
async function addFood(name, quantity, expiryDate, location) {
    try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/food/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, quantity, expiryDate, location })
        });
        const data = await res.json();
        showPopup(data.message || "Thanks for donating!");
        loadAvailableFood(); // refresh food list for requests
    } catch (err) {
        console.error(err);
        showPopup("Error adding food", true);
    }
}

// GET AVAILABLE FOOD
async function loadAvailableFood() {
    try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/food/`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const foods = await res.json();

        // Populate food list in request page
        const foodSelect = document.getElementById("foodType");
        if (foodSelect) {
            foodSelect.innerHTML = "";
            foods.forEach(food => {
                const option = document.createElement("option");
                option.value = food.name;
                option.textContent = `${food.name} - Qty: ${food.quantity} - Location: ${food.location}`;
                foodSelect.appendChild(option);
            });
        }
    } catch (err) {
        console.error(err);
        showPopup("Error fetching available food", true);
    }
}

// REQUEST FOOD (NGO)
async function requestFood(foodName, quantity, requesterName, org, contact, location) {
    try {
        const token = getToken();
        const res = await fetch(`${BASE_URL}/requests/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ foodName, quantity, requesterName, org, contact, location })
        });
        const data = await res.json();
        showPopup(data.message || "Request submitted successfully!");
    } catch (err) {
        console.error(err);
        showPopup("Error making request", true);
    }
}

// ============================
// FORM EVENT LISTENERS
// ============================

// Add Food Form
const addFoodForm = document.getElementById("addFoodForm");
if (addFoodForm) {
    addFoodForm.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("foodName").value;
        const quantity = document.getElementById("foodQty").value;
        const expiryDate = document.getElementById("foodExpiry").value;
        const location = document.getElementById("foodLocation").value;
        addFood(name, quantity, expiryDate, location);
        addFoodForm.reset();
    });
}

// Request Food Form
const requestForm = document.getElementById("requestForm");
if (requestForm) {
    requestForm.addEventListener("submit", e => {
        e.preventDefault();
        const requesterName = document.getElementById("name").value;
        const org = document.getElementById("org").value;
        const contact = document.getElementById("contact").value;
        const location = document.getElementById("location").value;
        const foodName = document.getElementById("foodType").value;
        const quantity = document.getElementById("quantity").value;
        requestFood(foodName, quantity, requesterName, org, contact, location);
        requestForm.reset();
    });
}

// Load food list on page load
window.addEventListener("DOMContentLoaded", () => {
    loadAvailableFood();
});
