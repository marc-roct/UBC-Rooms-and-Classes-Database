document.getElementById("add-dataset").addEventListener("click", handleAddDataset);

function handleAddDataset() {
	const data = document.getElementById('file').value;
	console.log(data);
	// var getValue = document.getElementById('ddlViewBy').selectedOptions[0].value
	const id = document.getElementById('id').value;
	const kind = document.getElementById('kind').selectedOptions[0].value;
	console.log("printing values: ");
	console.log(id);
	console.log(kind);
	console.log("#####");
	let url = "http://localhost:4321/dataset/" + id + "/" + kind;
	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
	}).then(function (response) {
		console.log("printing response:");
		console.log(response);
		return response.json();
	}).then(function(data) {
		console.log("printing data:");
		console.log(data);
	}).catch(function(err){
		console.log('Error: ', err);
	});
	// alert("Add Dataset Button Clicked!");

}

document.getElementById("list-dataset").addEventListener("click", handleListDataset);

function handleListDataset() {
	let result = "data is not fetched";
	fetch('http://localhost:4321/datasets', { method: 'GET' })
		.then(function (response) {
			// console.log("printing response:");
			// console.log(response);
			return response.json();
		}).then(function (data) {
			result = data.result;
			// console.log("printing data:");
			// console.log(result);
			// console.log(result.length);
			createTable(result);
	}).catch(function(err) {
		console.log(err);
	})
	// alert("List dataset Button Clicked!" + result);
}

function createTable(data) {
	const table = document.getElementById("dataset-list");
	if(data.length < 1) {
		let newTable = document.createElement("table");
		newTable.setAttribute("id", "dataset-list");
		let noDataset = document.createElement("tr");
		let heading = document.createElement("th");
		heading.innerText = "no dataset has been added";
		noDataset.appendChild(heading);
		newTable.appendChild(noDataset);
		table.parentNode.replaceChild(newTable, table);
	} else {
		let newTable = document.createElement("table");
		newTable.setAttribute("id", "dataset-list");
		let dataList = document.createElement("tr");
		let idHeading = document.createElement("th");
		idHeading.innerText = "Dataset ID";
		let typeHeading = document.createElement("th");
		typeHeading.innerText = "Type";
		let sizeHeading = document.createElement("th");
		sizeHeading.innerText = "Size of the Dataset";

		dataList.appendChild(idHeading);
		dataList.appendChild(typeHeading);
		dataList.appendChild(sizeHeading);

		newTable.appendChild(dataList);

		data.forEach((dateset)=> {
			let row = document.createElement("tr");
			let values = Object.values(dateset);
			for(const value of values) {
				let cell = document.createElement("td");
				cell.innerText = value.toString();
				row.appendChild(cell);
			}
			newTable.appendChild(row);
		});
		table.parentNode.replaceChild(newTable, table);
	}

}
