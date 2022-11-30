document.getElementById("add-dataset").addEventListener("click", handleAddDataset);

function handleAddDataset() {
	let data = {mock: "testing"};
	fetch('http://localhost:4321/echo/hello', {
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
	fetch('http://localhost:4321/echo/hello')
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


