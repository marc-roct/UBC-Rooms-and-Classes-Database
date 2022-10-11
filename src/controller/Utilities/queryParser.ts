const whereParser = (query: Record<string, any>, dataSet: any): string[] => {
	// TODO: update the datatype to the datatype that addDataset return
	let dataCollector: string[] = [];
	if(typeof query === "object" && !Array.isArray(query)) {
		// if the input data is an object: push the key to the dataCollector
		// and call queryParser to check the values inside the object
		for(let key in query) {
			switch(key) {
				case "OR":
					// STUB
					dataCollector = orLogic(query, dataSet);
					break;
				case "AND":
					// STUB
					break;
				case "LT":
					// STUB
					break;
				case "GT":
					// STUB
					break;
				case "EQ":
					// STUB
					break;
				case "IS":
					// STUB
					break;
				case "NOT":
					// STUB
					break;
				default:
					return [];
			}
		}
	} else if (Array.isArray(query)) {
		// if the input data is an array: loop through each item and call queryParser()
		for(let index in query) {
			// TODO: use Set to combine data
			dataCollector = dataCollector.concat(whereParser(query[index], dataSet));
		}
	};
	return dataCollector;
};

// TODO: use Set() to collect data to avoid duplicate records
// TODO: use filter to loop through the dataset

const orLogic = (dataSet: any, query: any): string[] => {
	// STUB
	return [];
};

const addLogic = (dataSet: any, query: any): string[] => {
	// STUB
	return [];
};

const isLogic = (dataSet: any, query: any): string[] => {
	// STUB
	return [];
};

const lessThanLogic = (dataSet: any, query: any): string[] => {
	// STUB
	return [];
};

const greaterThanLogic = (dataSet: any, query: any): string[] => {
	// STUB
	return [];
};

const equalLogic = (dataSet: any, query: any): string[] => {
	// STUB
	return [];
};

const notLogic = (dataSet: any, query: any): string[] => {
	// STUB
	return [];
};

const optionFilter = (query: Record<string, any>, dataSet: any): string[] => {
	// STUB
	return [];
};

export {whereParser};
