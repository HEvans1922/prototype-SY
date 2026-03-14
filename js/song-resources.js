 // Sidebar toggles
function toggleDropdownSong() {
		var dropdown = document.getElementById('dropdownSong');
			dropdown.classList.toggle('active');
};


function toggleDropdownResources() {
		var dropdown = document.getElementById('dropdownResources');
			dropdown.classList.toggle('active');
};

function toggleDropdownCurriculum() {
		var dropdown = document.getElementById('dropdownCurriculum');
			dropdown.classList.toggle('active');
};


function toggleDropdownY0T1() {
		var dropdown = document.getElementById('dropdownY0T1');
			dropdown.classList.toggle('active');
};

function openNav() {
    document.getElementById("mySidebar").style.width = "250px";
};

function closeNav() {
    document.getElementById("mySidebar").style.width = "0";
};


// Dropdowns
function aboutDropdown() {
	var dropdown = document.getElementById("myDropdown");
	var chevron = document.getElementById("chevron");
	var button = document.querySelector(".about_dropdown_button");

	// Toggle the active class for the dropdown and button
	dropdown.classList.toggle("active");
	button.classList.toggle("active");

	// Toggle the rotate class for the chevron
	chevron.classList.toggle("rotate");
}


function resourceDropdown() {
    var dropdown = document.getElementById("myDropdown");
    var chevron = document.getElementById("chevron");
    var button = document.querySelector(".resource_dropdown_button");
    
    // Toggle the active class for the dropdown and button
    dropdown.classList.toggle("active");
    button.classList.toggle("active");
    
    // Toggle the rotate class for the chevron
    chevron.classList.toggle("rotate");
}


// Function to handle modal logic
function setupModal(buttonId, modalId) {
	const btn = document.getElementById(buttonId);
	const modal = document.getElementById(modalId);

	if (modal) {
		const closeButton = modal.querySelector('.modalClose');

		// Open modal when button is clicked
		btn.onclick = function () {
			modal.style.display = 'block';
		};

		// Close modal when close button is clicked
		closeButton.onclick = function () {
			modal.style.display = 'none';
		};
	}
	
  

  }
  
  // Set up multiple modals
  
  setupModal('LyricsBtn', 'LyricsModal');
  setupModal('ScoreBtn', 'ScoreModal');
  setupModal('InfoBtn', 'InfoModal');
