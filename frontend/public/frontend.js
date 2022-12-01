
document.getElementById("add-dataset").addEventListener("click", handleAddDataset);

async function handleAddDataset() {
	const file = document.getElementById('file').files[0];
	// var getValue = document.getElementById('ddlViewBy').selectedOptions[0].value
	const id = document.getElementById('id').value;
	const kind = document.getElementById('kind').selectedOptions[0].value;
	const url = "http://localhost:4321/dataset/" + id + "/" + kind;

	fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/zip',
		},
		body: file,
	}).then(async function (response) {
		// console.log("printing response:");
		console.log(response);
		let responseJson = await response.json();
		if (response.status !== 200) {
			throw new Error(responseJson.error);
		}
		return responseJson;
	}).then(function(data) {
		// console.log("printing data:");
		// console.log(data.result[0]);
		const response = document.getElementById('response');
		response.innerText = "Dataset successfully added";
		response.hidden = false;
	}).catch(function(err){
		const response = document.getElementById('response');
		response.innerText = err;
		response.hidden = false;
	});
	// alert("Add Dataset Button Clicked!");

}


document.getElementById("list-dataset").addEventListener("click", handleListDataset);

function handleListDataset() {
	let result = "data is not fetched";
	fetch('http://localhost:4321/datasets')
		.then(function (response) {
			console.log("printing response:");
			console.log(response);
			return response.json();
		}).then(function (data) {
			result = data;
			console.log("printing data:");
			console.log(result);
	}).catch(function(err) {
		console.log(err);
	})
	// alert("List dataset Button Clicked!" + result);
}


