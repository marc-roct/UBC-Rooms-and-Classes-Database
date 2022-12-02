
document.getElementById("add-dataset").addEventListener("click", handleAddDataset);

async function handleAddDataset() {
	const file = document.getElementById('file').files[0];
	// var getValue = document.getElementById('ddlViewBy').selectedOptions[0].value
	const id = document.getElementById('id').value;
	const kind = document.getElementById('kind').selectedOptions[0].value;
	const url = "http://localhost:4321/dataset/" + id + "/" + kind;
	const responseMessage = document.getElementById('response');
	fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/zip',
		},
		body: file,
	}).then(async function (response) {
		// console.log("printing response:");
		// console.log(response);
		let responseJson = await response.json();
		if (response.status !== 200) {
			throw new Error(responseJson.error);
		}
		return responseJson;
	}).then(function(data) {
		// console.log("printing data:");
		// console.log(data.result);
		responseMessage.innerText = "Dataset successfully added: " + id + ".";
		// response.hidden = false;
	}).catch(function(err){
		if(err instanceof  SyntaxError) {
			responseMessage.innerText = "Invalid submission. Please check your input.";
		} else {
			responseMessage.innerText = err.message;
		}
		console.log(err);
		// response.hidden = false;
	});
	// alert("Add Dataset Button Clicked!");
}

document.getElementById("file").addEventListener("click", clearResponseMessage);

function clearResponseMessage() {
	const responseMessage = document.getElementById('response');
	responseMessage.innerText = "";
}

document.getElementById("list-dataset").addEventListener("click", handleListDataset);

function handleListDataset() {
	let result = "data is not fetched";
	fetch('http://localhost:4321/datasets', { method: 'GET' })
		.then(function (response) {
			console.log("printing response:");
			console.log(response);
			return response.json();
		}).then(function (data) {
			result = data.result;
			console.log("printing data:");
			console.log(result);
			console.log(result.length);
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
