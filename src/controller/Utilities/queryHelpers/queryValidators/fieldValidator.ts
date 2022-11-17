const mFieldValidator = (field: string): boolean => {
	const listOfValidMFields = ["avg","pass", "fail", "audit", "year", "lat", "lon", "seats"];
	console.log("checking the input field:");
	console.log(field);
	if(field.includes("_")) {
		let keyValues = field.split("_");
		// check if there is no underscore and the key is valid
		if(listOfValidMFields.includes(keyValues[1]) && keyValues.length === 2) {
			return true;
		}
	}
	return false;
};

const sFieldValidator = (field: string): boolean => {
	const listOfValidSFields = ["dept",  "id", "instructor",  "title", "uuid",
		"fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
	if(field.includes("_")) {
		let keyValues = field.split("_");
		// check if there is no underscore and the key is valid
		if(listOfValidSFields.includes(keyValues[1]) && keyValues.length === 2) {
			return true;
		};
	};
	return false;
};

export {mFieldValidator, sFieldValidator};
