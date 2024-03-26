// Author: Matthew Groh
// Last Updated: 1/26/2023
//
// individual_page.js
//
// This script gets the corresponding car from the database and loads
// its info on the page

function fillPage(data){
	// Replace all sample data with data from SQL query
	document.getElementById("header").innerHTML = data.number + " - " + data.driver;
	document.getElementById("driver").innerHTML = data.driver;
	document.getElementById("number").innerHTML = data.number;
	document.getElementById("series").innerHTML = data.series;
	if(data.other == ""){
		document.getElementById("sponsor").innerHTML = data.sponsor;
	} else {
		document.getElementById("sponsor").innerHTML = data.sponsor + " - " + data.other;
	}
	document.getElementById("team").innerHTML = data.team;
	document.getElementById("manufacturer").innerHTML = data.manufacturer;
	document.getElementById("year").innerHTML = data.year;

	// Check if each image exists and display accordingly
	checkImage("image0", data.image0);
	checkImage("image1", data.image1);
	checkImage("imageCar", data.imageCar);
	checkImage("imageDriver", data.imageDriver);
}

function checkImage(type, image){
	var imagePath = "images/" + image;
	// Check if image exists. If so, display it
	// If not, throw error
	fetch(imagePath) 
		.then(response => { 
			if (!response.ok) {
				throw new Error("Image not found");
			} else {
				document.getElementById(type).src = "images/" + image;
				document.getElementById(type + "Link").href = "images/" + image; 
			} 
		}) 
		.catch(error => { 
			console.log(error); 
		});
}

window.addEventListener("load", function() {
	var carArray;

	// If a search was made, use that subset
	// If not, use whole array
	if(sessionStorage.getItem("filterData") != null){
		carArray = JSON.parse(sessionStorage.getItem("filterData"));
	} else {
		carArray = JSON.parse(sessionStorage.getItem("tableData"));
	}

	// Get specific entry that matches id
	var carData = carArray.find(o => o.id == location.search.substring(1));
	fillPage(carData);

	// Set correct page number for when using the back button after
	// using prev and next buttons
	var numInList = carArray.indexOf(carData);
	sessionStorage.setItem("pageNum", (Math.ceil((numInList + 1) / 50) - 1));

	// Save current car ID for when reloading main page
	sessionStorage.setItem("savedID", location.search.substring(1));

	var prevButton = document.getElementById("prevButton");
	var nextButton = document.getElementById("nextButton");

	// If at first or last entry, hide respective button
	var currentIndex = carArray.indexOf(carData);
	if(currentIndex + 1 >= carArray.length){
		nextButton.style.visibility = "hidden";
	} else {
		nextButton.href = "individual_page.html?" + carArray[currentIndex + 1].id;
	}

	if(currentIndex - 1 < 0){
		prevButton.style.visibility = "hidden";
	} else {
		prevButton.href = "individual_page.html?" + carArray[currentIndex - 1].id;
	}
});