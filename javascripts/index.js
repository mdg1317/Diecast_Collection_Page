// Author: Matthew Groh
// Last Updated: 2/10/2023
//
// index.js
//
// This script loads the full table from the SQL database, displays the main
// page, and handles the filter functionality

const getTableData = async () => {
	//var tableData = [];
	//var filterData = null;
	// If data is already in sessionStorage, load it into tableData
	// If not, perform SQL query and load that into tableData AND sessionStorage
	// After either is done, call finishLoading() to continue
	if(sessionStorage.getItem("tableData") != null){
		//tableData = JSON.parse(sessionStorage.getItem("tableData"));
		// Set filterData if it exists
		//if(sessionStorage.getItem("filterData") != null){
			//filterData = JSON.parse(sessionStorage.getItem("filterData"));
		//}
		finishLoading();
	} else {
		// Send a POST request invoking "/tableData" route found in app.js
		/*$.post({
			traditional: true,
			url: "index.php",
			success: function(data, ) {
				sessionStorage.setItem("tableData", JSON.stringify(JSON.parse(data)));
				//tableData = JSON.parse(sessionStorage.getItem("tableData"));
				finishLoading();
			}
		}).fail(function(jqxhr, settings, ex) {
			console.log("Could not access table");
		});*/
		$.get("carInfo.json", function(data) {
			//sessionStorage.setItem("tableData", JSON.stringify(JSON.parse(data)));
			sessionStorage.setItem("tableData", JSON.stringify(data));
			//tableData = JSON.parse(sessionStorage.getItem("tableData"));
			finishLoading();
		}).fail(function() {
			console.log("Could not access table");
		});
	}
};

function generateMain(data, pageNum){
  console.log(data);
	var currentRow, newDiv, newLink, newImg, newP;
	var resultsCounter = document.getElementById("resultsCounter");

	// Clear the page of any previous dynamic HTML
	clearPage();

	var numCars = data.length;
	var carsPerPage = 50;

	// Set number of columns to how many can fit on current window size, or 1 if super small
	// Get number of rows by dividing number of cars by number of columns
	// Then add appropriate number of extra rows for overflow
	var numCols = Math.max(1, Math.floor(window.innerWidth / 180));
	var numRows = Math.round(carsPerPage / numCols);
	var extraRows = Math.ceil((carsPerPage - (numRows * numCols)) / numCols);
	numRows += extraRows;

	var endOfPage = false;

	for(var i = 0; i < numRows; i++){
		// If end of table is reached, stop making rows
		if(i * numCols > numCars){
			break;
		}

		// Create new "div" element for a new row
		currentRow = document.createElement("div");
		currentRow.setAttribute("id", "row" + i);
		currentRow.setAttribute("class", "row");

		// Calculate starting and ending indices based on 
		// number of cars per page and current page
		var startingID = i * numCols + (pageNum * carsPerPage);
		var endingID = (i + 1) * numCols + (pageNum * carsPerPage);

		// Populate row with correct number of columns
		for(var j = startingID; j < endingID; j++){
			// If reached end of page, set endOfPage flag
			// This will still create columns for formatting purposes but
			// will not populate them
			if(j != startingID && j % carsPerPage == 0){
				endOfPage = true;
			}

			// Create new column
			newDiv = document.createElement("div");
			newDiv.setAttribute("class", "column");

			// Only add links, images, and text if end of
			// data or end of page has not been reached
			if(!endOfPage && j < numCars){
				newLink = document.createElement("a");
				newImg = document.createElement("img");
				newP = document.createElement("p");

				newLink.href = "individual_page.html?" + data[j].id;
				newImg.setAttribute("id", "image" + data[j].id);
				newP.setAttribute("id", "result" + data[j].id);

				newLink.appendChild(newImg);
				newLink.appendChild(newP);
				newDiv.appendChild(newLink);
			}
			currentRow.appendChild(newDiv);
		}

		// Append row to index.html such that page selection always
		// remains on bottom of page
		if(i == 0){
			resultsCounter.insertAdjacentElement("afterend", currentRow);
		} else {
			var prevRow = document.getElementById("row" + (i - 1))
			prevRow.insertAdjacentElement("afterend", currentRow);
		}
	}

	// Update text to display info about results on current page
	var startingNum = Math.min(numCars, ((carsPerPage * parseInt(pageNum)) + 1));
	var endingNum = Math.min(numCars, carsPerPage * (parseInt(pageNum) + 1));
	resultsCounter.innerHTML = "Displaying " + startingNum + " - "
		+ endingNum + " of " + numCars + " results";

	// Add table data into newly created rows
	var index = pageNum * carsPerPage;
	var counter = 0;
	//var carIDs = [];
	for(var k = index; k < numCars; k++){
		// Break loop if max number of cars on page is reached
		if(counter == carsPerPage){
			break;
		}
		document.getElementById("result" + data[k].id).innerHTML = data[k].number + " - " + data[k].driver;
		document.getElementById("image" + data[k].id).src = "thumbnails/" + data[k].image0;

		// Add car ID to array for image checking
		//carIDs.push(data[k].id);

		counter++;
	}

	// Check if image0 exists for all cars on page
	//checkImages(data, carIDs);

	// Clear previously set attributes for page buttons
	clearPageSettings();

	// If on first or last page, hide respective buttons
	var numPages = Math.floor(numCars / carsPerPage);
	if(pageNum == 0){
		pagePrev.style.visibility = "hidden";
		pageFirst.style.visibility = "hidden";
	}
	if(pageNum == numPages){
		pageNext.style.visibility = "hidden";
		pageLast.style.visibility = "hidden";
	}

	// Handle page button text/visibility depending on amount
	// If < 5, handle in special function formatPageButtons()
	switch(numPages){
		case 0:
			formatPageButtons(0, pageNum);
			break;
		case 1:
			formatPageButtons(1, pageNum);
			break;
		case 2:
			formatPageButtons(2, pageNum);
			break;
		case 3:
			formatPageButtons(3, pageNum);
			break;
		default:
			// If on page 1 or 2, set page nums to 1-5 and set active one accordingly
			// If on last or second to last page, set page nums to last 5 and set
			// active one accordingly
			// If not, set active page to center button and change text accordingly
			if (pageNum < 2){
				page0.innerHTML = 1;
				page1.innerHTML = 2;
				page2.innerHTML = 3;
				page3.innerHTML = 4;
				page4.innerHTML = 5;

				document.getElementById("page" + pageNum).setAttribute("class", "active");
			} else if(pageNum > (numPages - 2)){
				page0.innerHTML = numPages - 3;
				page1.innerHTML = numPages - 2;
				page2.innerHTML = numPages - 1;
				page3.innerHTML = numPages;
				page4.innerHTML = numPages + 1;

				if(pageNum == numPages){
					page4.setAttribute("class", "active");
				} else {
					page3.setAttribute("class", "active");
				}
			} else {
				page0.innerHTML = parseInt(pageNum) - 1;
				page1.innerHTML = parseInt(pageNum);
				page2.innerHTML = parseInt(pageNum) + 1;
				page3.innerHTML = parseInt(pageNum) + 2;
				page4.innerHTML = parseInt(pageNum) + 3;

				page2.setAttribute("class", "active");
			}
			break;
	}

	// Correct the starting sort select value
	sortSelect.value = sessionStorage.getItem("sortType");

	// If returning from individual page, center last viewed car on the page
	if(sessionStorage.getItem("savedID") != null){
		document.getElementById("image" + sessionStorage.getItem("savedID")).scrollIntoView({
			behavior: "auto",
			block: "center",
			inline: "center"
		});
		sessionStorage.removeItem("savedID");
	}
}

function formatPageButtons(key, pageNum){
	// If the page button is valid, set its text accordingly
	// If not, hide it
	for(var i = 0; i < 5; i++){
		if(i <= key){
			document.getElementById("page" + i).innerHTML = i + 1;
		} else {
			document.getElementById("page" + i).style.display = "none";
		}
	}

	// Set the active button
	document.getElementById("page" + pageNum).setAttribute("class", "active");
}

function clearPageSettings(){
	// Reset all page buttons
	for(const page of pageSelect.children){
		page.setAttribute("class", "");
		page.style.display = "";
		page.style.visibility = "visible";
	}
}

/*const checkImages = async (data, carIDs) => {
	// Iterate through list of cars and check if image0 exists
	// for all of them. If so, display it. If not, display default image
	const promises = await carIDs.map(async item => {
		var car = data.find(o => o.id == item);
		fetch("thumbnails/" + car.image0) 
			.then(response => { 
				if (!response.ok) {
					document.getElementById("image" + car.id).src = "images/NoImageAvailable.jpg";
					throw new Error("Image not found");
				} else {
					document.getElementById("image" + car.id).src = "thumbnails/" + car.image0;
				} 
			}) 
			.catch(error => { 
				console.log(error); 
			});
	})
}*/

function clearPage() {
	// NOT GREAT
	// IMPROVE LATER

	// Delete all previous dynamic HTML
	for(var j = 49; j > -1; j--){
		var thisRow = document.getElementById("row" + j);
		if(thisRow){
			thisRow.remove();
		}
	}
}

function sortTable(data, isFilter, sort){
	// Lists storing the proper order for certain fields
	// NOT A VERY EFFICIENT WAY OF DOING THE NUMBERS
	// TRY TO IMPROVE LATER
	var numberOrder = ["00", "0", "01", "1", "02", "2", "03", "3", "04", "4",
		"05", "5", "06", "6", "07", "7", "08", "8", "09", "9", "10",
		"11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
		"21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
		"31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
		"41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
		"51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
		"61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
		"71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
		"81", "82", "83", "84", "85", "86", "87", "88", "89", "90",
		"91", "92", "93", "94", "95", "96", "97", "98", "99"];
	var seriesOrder = ["Cup", "GNS", "Truck", "ARCA", "None"];
	var manufacturerOrder = ["Buick", "Chevrolet", "Dodge", "Ford",
		"Oldsmobile", "Plymouth", "Pontiac", "Toyota", "None"];

	// Sort in order of Number -> Series -> Year first, unless
	// specific sort categories are chosen
	if(sort !== "8" && sort !== "3" && sort !== "7"){
		data.sort(function(a, b){
			return a.year - b.year;
		});
		data.sort(function(a, b){
			return seriesOrder.indexOf(a.series) - seriesOrder.indexOf(b.series);
		});
		data.sort(function(a, b){
			return numberOrder.indexOf(a.number) - numberOrder.indexOf(b.number);
		});	
	}

	// Perform the last sort depending on chosen option
	switch(sort){
		case "0": 		// Number
			break;
		case "1":		// First Name
			data.sort(function(a, b){
				var x = a.firstName;
				var y = b.firstName;
				return x == y ? 0 : x > y ? 1 : -1;
			});
			break;
		case "2":		// Last Name
			data.sort(function(a, b){
				var x = a.lastName;
				var y = b.lastName;
				return x == y ? 0 : x > y ? 1 : -1;
			});
			break;
		case "3": 		// Series
			data.sort(function(a, b){
				return a.year - b.year;
			});
			data.sort(function(a, b){
				return numberOrder.indexOf(a.number) - numberOrder.indexOf(b.number);
			});
			data.sort(function(a, b){
				return seriesOrder.indexOf(a.series) - seriesOrder.indexOf(b.series);
			});
			break;
		case "4":		// Sponsor
			data.sort(function(a, b){
				var x = a.sponsor.replace('#','').toLowerCase();
				var y = b.sponsor.replace('#','').toLowerCase();
				return x == y ? 0 : x > y ? 1 : -1;
			});
			break;
		case "5":		// Team
			data.sort(function(a, b){
				var x = a.team.toLowerCase();
				var y = b.team.toLowerCase();
				return x == y ? 0 : x > y ? 1 : -1;
			});
			break;
		case "6":		// Manufacturer
			data.sort(function(a, b){
				return manufacturerOrder.indexOf(a.manufacturer)
					- manufacturerOrder.indexOf(b.manufacturer);
			});
			break;
		case "7": 		// Year
			// Sort in order of Year -> Number -> Series
			data.sort(function(a, b){
				return seriesOrder.indexOf(a.series) - seriesOrder.indexOf(b.series);
			});
			data.sort(function(a, b){
				return numberOrder.indexOf(a.number) - numberOrder.indexOf(b.number);
			});
			data.sort(function(a, b){
				return a.year - b.year;
			});
			break;
		case "8":		// ID 
			data.sort(function(a, b){
				return a.id - b.id;
			});
			break;
		default:
			break;
	}
	
	// If using filterData, replace in sessionStorage with sorted data
	// If not, replace data
	if(isFilter){
		sessionStorage.setItem("filterData", JSON.stringify(data));
	} else {
		sessionStorage.setItem("tableData", JSON.stringify(data));
	}

	// Rebuild page
	generateMain(data, sessionStorage.getItem("pageNum"));
}

function createFilterData() {
	var filterData = [];
	var data = JSON.parse(sessionStorage.getItem("tableData"));
	var pageSelect = document.getElementById("pageSelect");

	// Delete previous filters if they exist
	if(sessionStorage.getItem("filterData") != null){
		sessionStorage.removeItem("filterData");
	}

	// Get all values from filter fields
	var driverValue = filterDriver.value;
	var numberValue = filterNumber.value;
	var seriesValue = filterSeries.value;
	var sponsorValue = filterSponsor.value;
	var teamValue = filterTeam.value;
	var manufacturerValue = filterManufacturer.value;
	var yearValue = filterYear.value;
	var otherValue = filterOther.value;

	// Store filters in sessionStorage so they will
	// persist when reloading pages without changing them
	sessionStorage.setItem("filterDriver", driverValue);
	sessionStorage.setItem("filterNumber", numberValue);
	sessionStorage.setItem("filterSeries", seriesValue);
	sessionStorage.setItem("filterSponsor", sponsorValue);
	sessionStorage.setItem("filterTeam", teamValue);
	sessionStorage.setItem("filterManufacturer", manufacturerValue);
	sessionStorage.setItem("filterYear", yearValue);
	sessionStorage.setItem("filterOther", otherValue);

	// Remove punctuation and properly format inputted terms
	driverValue = driverValue.replace(/\./g, '').replace(/\//g, ' ').toLowerCase().trim();
	numberValue = numberValue.trim();
	seriesValue = seriesValue.toLowerCase().trim();
	sponsorValue = sponsorValue.replace(/[\.\'#\:\?\$,]/g, '').replace(/[-\/]/g, ' ').replace(/\s{2,}/g, ' ').toLowerCase().trim();
	teamValue = teamValue.replace(/[/-\/]/g, ' ').replace(/[\.,]/g, '').toLowerCase().trim();
	manufacturerValue = manufacturerValue.toLowerCase().trim();
	yearValue = yearValue.trim();
	otherValue = otherValue.replace(/[\.\'#\:\?\$,]/g, '').replace(/[-\/]/g, ' ').replace(/\s{2,}/g, ' ').toLowerCase().trim();

	// If all fields are empty, clear filterData and regenerate page
	if(driverValue.length == 0 && numberValue.length == 0 &&
		seriesValue.length == 0 && sponsorValue.length == 0 &&
		teamValue.length == 0 && manufacturerValue.length == 0 &&
		yearValue.length == 0 && otherValue == 0){
		sessionStorage.removeItem("filterData");
		generateMain(data, 0);
		return;
	}

	// If any entries in data match ALL inputs, add it to filterData
	for(var i = 0; i < data.length; i++){
		// Get and format table data to match inputted terms
		var currentDriver = data[i].driver.replace(/\./g, '').replace(/\//g, ' ').toLowerCase();
		var currentNumber = data[i].number;
		var currentSeries = data[i].series.toLowerCase();
		var currentSponsor = data[i].sponsor.replace(/[\.\'#\:\?\$,]/g, '').replace(/[-\/]/g, ' ').replace(/\s{2,}/g, ' ').toLowerCase();
		var currentTeam = data[i].team.replace(/[/-\/]/g, ' ').replace(/[\.,]/g, '').toLowerCase();
		var currentManufacturer = data[i].manufacturer.toLowerCase();
		var currentYear = data[i].year;
		var currentOther = data[i].other.replace(/[\.\'#\:\?\$,]/g, '').replace(/[-\/]/g, ' ').replace(/\s{2,}/g, ' ').toLowerCase();

		if(currentDriver.includes(driverValue) && currentNumber.includes(numberValue)
			&& currentSeries.includes(seriesValue) && currentSponsor.includes(sponsorValue)
			&& currentTeam.includes(teamValue) && currentManufacturer.includes(manufacturerValue)
			&& currentYear.includes(yearValue) && currentOther.includes(otherValue)){
			filterData.push(data[i]);
		}
	}

	// Add filterData to sessionStorage and regenerate page
	sessionStorage.setItem("filterData", JSON.stringify(filterData));
	
	// Reset page number
	sessionStorage.setItem("pageNum", 0);

	// Regenerate page
	generateMain(filterData, sessionStorage.getItem("pageNum"));
}

function finishLoading() {
	if(sessionStorage.getItem("pageNum") == null){
		sessionStorage.setItem("pageNum", 0);
	}
	if(sessionStorage.getItem("sortType") == null){
		sessionStorage.setItem("sortType", 0);
      	sortTable(JSON.parse(sessionStorage.getItem("tableData")), false, sortSelect.value);
	}

	// Generate dynamic HTML using filterData if it exists
	// If not, use full table data
	if(sessionStorage.getItem("filterData") != null){
		generateMain(JSON.parse(sessionStorage.getItem("filterData")), sessionStorage.getItem("pageNum"));
	} else {
		generateMain(JSON.parse(sessionStorage.getItem("tableData")), sessionStorage.getItem("pageNum"));
	}

	// Set filters to those found in sessionStorage
	filterDriver.value = sessionStorage.getItem("filterDriver");
	filterNumber.value = sessionStorage.getItem("filterNumber");
	filterSeries.value = sessionStorage.getItem("filterSeries");
	filterSponsor.value = sessionStorage.getItem("filterSponsor");
	filterTeam.value = sessionStorage.getItem("filterTeam");
	filterManufacturer.value = sessionStorage.getItem("filterManufacturer");
	filterYear.value = sessionStorage.getItem("filterYear");
	filterOther.value = sessionStorage.getItem("filterOther");

	// Filter results in real time as characters are typed
	filters.addEventListener("keyup", function(event) {
		createFilterData();
	});

	// Clear data only from respective filter and reload
	clearDriver.addEventListener("click", function() {
		clearFilterData("filterDriver");
	});
	clearNumber.addEventListener("click", function() {
		clearFilterData("filterNumber");
	});
	clearSeries.addEventListener("click", function() {
		clearFilterData("filterSeries");
	});
	clearSponsor.addEventListener("click", function() {
		clearFilterData("filterSponsor");
	});
	clearTeam.addEventListener("click", function() {
		clearFilterData("filterTeam");
	});
	clearManufacturer.addEventListener("click", function() {
		clearFilterData("filterManufacturer");
	});
	clearYear.addEventListener("click", function() {
		clearFilterData("filterYear");
	});
	clearOther.addEventListener("click", function() {
		clearFilterData("filterOther");
	});

	// Clear all filters from both the page and sessionStorage and reload
	clearAll.addEventListener("click", function() {
		filterDriver.value = "";
		filterNumber.value = "";
		filterSeries.value = "";
		filterSponsor.value = "";
		filterTeam.value = "";
		filterManufacturer.value = "";
		filterYear.value = "";
		filterOther.value = "";

		sessionStorage.setItem("filterDriver", "");
		sessionStorage.setItem("filterNumber", "");
		sessionStorage.setItem("filterSeries", "");
		sessionStorage.setItem("filterSponsor", "");
		sessionStorage.setItem("filterTeam", "");
		sessionStorage.setItem("filterManufacturer", "");
		sessionStorage.setItem("filterYear", "");
		sessionStorage.setItem("filterOther", "");

		createFilterData();
	});

	// Event listener for all normal page buttons
	for(const page of pageSelect.children){
		if(page.id != "pagePrev" && page.id != "pageNext" && page.id != "pageFirst" && page.id != "pageLast"){
			page.addEventListener("click", function() {
				// Set page
				sessionStorage.setItem("pageNum", (page.innerHTML) - 1);
				window.scrollTo(0, 0);

				// If user used one or more filters, reload the page corresponding to filterData
				// If not, reload corresponding to the full table
				if(sessionStorage.getItem("filterData") != null){
					generateMain(JSON.parse(sessionStorage.getItem("filterData")), sessionStorage.getItem("pageNum"));
				} else {
					generateMain(JSON.parse(sessionStorage.getItem("tableData")), sessionStorage.getItem("pageNum"));
				}
			});
		}
	}

	pageFirst.addEventListener("click", function() {
		// Set to first page
		sessionStorage.setItem("pageNum", 0);

		// If user used one or more filters, reload the page corresponding to filterData
		// If not, reload corresponding to the full table
		if(sessionStorage.getItem("filterData") != null){
			generateMain(JSON.parse(sessionStorage.getItem("filterData")), sessionStorage.getItem("pageNum"));
		} else {
			generateMain(JSON.parse(sessionStorage.getItem("tableData")), sessionStorage.getItem("pageNum"));
		}
	});

	pageLast.addEventListener("click", function() {
		// If user used one or more filters, find last page based on filterData and reload page
		// If not, find it based on tableData and reload
		var numPages;
		if(sessionStorage.getItem("filterData") != null){
			numPages = Math.floor(JSON.parse(sessionStorage.getItem("filterData")).length / 50);
			sessionStorage.setItem("pageNum", numPages);
			generateMain(JSON.parse(sessionStorage.getItem("filterData")), sessionStorage.getItem("pageNum"));
		} else {
			numPages = Math.floor(JSON.parse(sessionStorage.getItem("tableData")).length / 50);
			sessionStorage.setItem("pageNum", numPages);
			generateMain(JSON.parse(sessionStorage.getItem("tableData")), sessionStorage.getItem("pageNum"));
		}
	});

	pagePrev.addEventListener("click", function() {
		// Set pageNum to previous page if not already at first page
		if(sessionStorage.getItem("pageNum") > 0){
			sessionStorage.setItem("pageNum", sessionStorage.getItem("pageNum") - 1);
			window.scrollTo(0, 0);

			// If user used one or more filters, reload the page corresponding to filterData
			// If not, reload corresponding to the full table
			if(sessionStorage.getItem("filterData") != null){
				generateMain(JSON.parse(sessionStorage.getItem("filterData")), sessionStorage.getItem("pageNum"));
			} else {
				generateMain(JSON.parse(sessionStorage.getItem("tableData")), sessionStorage.getItem("pageNum"));
			}
		}
	});

	pageNext.addEventListener("click", function() {
		var tableData = JSON.parse(sessionStorage.getItem("tableData"));
		var filterData = JSON.parse(sessionStorage.getItem("filterData"));
		var lastPage;

		// Set pageNum to next page
		if(filterData != null){
			lastPage = Math.floor(filterData.length / 50);
			if(sessionStorage.getItem("pageNum") < lastPage){
				sessionStorage.setItem("pageNum", Number(sessionStorage.getItem("pageNum")) + 1);
				window.scrollTo(0, 0);
				generateMain(filterData, sessionStorage.getItem("pageNum"));
			}
		} else {
			lastPage = Math.floor(tableData.length / 50);
			if(sessionStorage.getItem("pageNum") < lastPage){
				sessionStorage.setItem("pageNum", Number(sessionStorage.getItem("pageNum")) + 1);
				window.scrollTo(0, 0);
				generateMain(tableData, sessionStorage.getItem("pageNum"));
			}
		}
	});

	sortSelect.addEventListener("change", function() {
		// Sort the table accordingly
		sessionStorage.setItem("sortType", sortSelect.value);
		sessionStorage.setItem("pageNum", 0);
		window.scrollTo(0, 0);
		
		if(sessionStorage.getItem("filterData") != null){
			sortTable(JSON.parse(sessionStorage.getItem("filterData")), true, sortSelect.value);
		} else {
			sortTable(JSON.parse(sessionStorage.getItem("tableData")), false, sortSelect.value);
		}
	});
}

/*function addPageSelect(tableData){
	// Reload page for corresponding selection
	for(const page of pageSelect.children){
		page.addEventListener("click", function() {
			sessionStorage.setItem("pageNum", (page.innerHTML - 1));
			//clearPage();
			
			window.scrollTo(0, 0);
			// If user used one or more filters, reload the page corresponding to filterData
			// If not, reload corresponding to the full table
			if(sessionStorage.getItem("filterData") != null){
				generateMain(JSON.parse(sessionStorage.getItem("filterData")), sessionStorage.getItem("pageNum"));
			} else {
				generateMain(tableData, sessionStorage.getItem("pageNum"));
			}
		});
	}
}*/

function clearFilterData(filter){
	document.getElementById(filter).value = "";
	sessionStorage.setItem(filter, "");
	createFilterData();
}

window.addEventListener("load", function() {
	getTableData();
});

window.addEventListener("resize", function() {
	// Regenerate page with appropriate table and new window size
	if(sessionStorage.getItem("filterData") != null){
		generateMain(JSON.parse(sessionStorage.getItem("filterData")), sessionStorage.getItem("pageNum"));
	} else {
		generateMain(JSON.parse(sessionStorage.getItem("tableData")), sessionStorage.getItem("pageNum"));
	}
});