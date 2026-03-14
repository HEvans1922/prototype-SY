const sidebar = document.querySelector(".sidebar");
const sidebarBtn = document.querySelector(".sidebar_toggle");
const overlay = document.querySelector(".mob-overlay");
const sidebarLists = document.querySelectorAll(".sidebar_list");

const mobileBreakpoint = 1200;
const savedState = localStorage.getItem("sidebarState");

function isSmallScreen() {
    return window.innerWidth < mobileBreakpoint;
}

function openSidebar() {
    sidebar.classList.remove("close");
    sidebar.classList.add("open");
    sidebarBtn.classList.add("fa-xmark");
    sidebarBtn.classList.remove("fa-bars");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    sidebar.classList.add("close");
    sidebarBtn.classList.add("fa-bars");
    sidebarBtn.classList.remove("fa-xmark");
}

function sidebarToggle() {
    sidebar.classList.toggle("close");
    sidebar.classList.toggle("open");
    updateSidebarState();
}

function updateClassOnResize() {
    if ($(window).width() <= 1200) {
        closeSidebar();
    } 
    else {
        if (sidebarState === "open") {
            openSidebar();
        } 
        updateSidebarState
    }
}

// Code for the dropdown lists within the sidebar
sidebarLists.forEach((list) => {
    const dropdown = list.querySelector(".sidebar_dropdown");
    const arrow = list.querySelector(".sidebar_dropdown_arrow");

    if (dropdown) {
        dropdown.addEventListener("click", () => {
            list.classList.toggle("active");
            arrow.classList.toggle("fa-chevron-down");
            arrow.classList.toggle("fa-chevron-up");            
        });
    }
});



// // Run on page load
// $(document).ready(function() {
//     updateClassOnResize();
// });

// Function to update sidebar state in localStorage
function updateSidebarState() {
    if (sidebar.classList.contains("close")) {
        localStorage.setItem("sidebarState", "closed");
        sidebarBtn.classList.add("fa-bars");
        sidebarBtn.classList.remove("fa-xmark");
    } else {
        localStorage.setItem("sidebarState", "open");
        sidebarBtn.classList.add("fa-xmark");
        sidebarBtn.classList.remove("fa-bars");
    }
}

// Check localStorage on page load and apply the sidebar state
document.addEventListener("DOMContentLoaded", () => {
    if (isSmallScreen()) {
        // Always start closed on small screens
        closeSidebar();
    } else {
        if (savedState === "closed") {
            closeSidebar();
        } else {        
            openSidebar();
        }
    }
});

// Toggle sidebar and update localStorage when clicked
sidebarBtn.addEventListener("click", () => {
    sidebarToggle();
});

overlay.addEventListener("click", () => {
    closeSidebar();
});

// Run on window resize
window.addEventListener('resize',updateClassOnResize)