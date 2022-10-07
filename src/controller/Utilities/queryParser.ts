const queryParser = (data: any): string[] => {
	let dataCollector: string[] = [];
	if(typeof data === "object" && !Array.isArray(data)) {
		// if the input data is an object: push the key to the dataCollector
		// and call queryParser to check the values inside the object
		for(let key in data) {
			dataCollector.push(key);
			dataCollector = dataCollector.concat(queryParser(data[key]));
		}
	} else if (Array.isArray(data)) {
		// if the input data is an array: loop through each item and call queryParser()
		for(let index in data) {
			dataCollector = dataCollector.concat(queryParser(data[index]));
		}
	} else {
		// base case: push the data to the dataCollector when it's neither an object or an array
		dataCollector.push(data);
		return dataCollector;
	}
	return dataCollector;
};

// const querySyntacticValidator = (data: array): Promise<boolean> => {
//
// };

const ebnfValidator = (data: number | string): boolean => {
	const listOfValidOperations = ["IS", "NOT", "AND", "OR", "LT", "GT", "EQ"];
	const listOfValidMFields = ["avg","pass", "fail", "audit", "year"];
	const listOfValidSFields = ["dept",  "id", "instructor",  "title", "uuid"];
	// Note: currently we don't validate numbers yet
	if (typeof data === "string") {
		// check if the key is valid
		if(data.includes("_")) {
			let fieldKey = data.substring(data.indexOf("_") + 1);
			if(!listOfValidMFields.includes(fieldKey) && !listOfValidSFields.includes(fieldKey)) {
				return false;
			}
		} else if (data === data.toUpperCase()) {
			if(!listOfValidOperations.includes(data)) {
				return false;
			};
		};
	};
	return true;
};

const isJSON = (query: any): query is Record<string, unknown> => {
	return query !== null && query !== undefined && typeof query === "object" && !Array.isArray(query);
};

export {queryParser, isJSON, ebnfValidator};
