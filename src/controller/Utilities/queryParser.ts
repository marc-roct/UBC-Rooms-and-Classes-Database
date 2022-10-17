import {Dataset} from "../InsightFacade";

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
					// Todo: get all objects and pass them to whereParser
					// OR can contain more than 1 items in the list
					dataCollector = orLogic(query, dataSet);
					break;
				case "AND":
					// STUB
					// Todo: get the target items based on all the criteria
					// join different sets
					// e.g. greater and equal
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
					// the input should be
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

/*
	This function output something like this:
	[

   { "sections_dept": "math", "sections_avg": 97.09 },

   { "sections_dept": "math", "sections_avg": 97.09 },

   { "sections_dept": "epse", "sections_avg": 97.09 },

   { "sections_dept": "epse", "sections_avg": 97.09 }, ...]
 */
const optionFilter = (dataSets: Dataset[], query: Record<string, any>): string[] => {
	let columnKeys: string[] = query["COLUMNS"];

	let filteredDatasets: any[] = [];

	for (let dataset of dataSets as Dataset[]) {
		type ObjectKey = keyof typeof dataset;
		let filteredDataset: any = {};

		for (let key of columnKeys) {
			let keyValues = key.split("_");
			// console.log(dataset[keyValues[1] as ObjectKey]);
			filteredDataset[key] = dataset[keyValues[1] as ObjectKey];
		}

		filteredDatasets.push(filteredDataset);
	}

	let keyToSort = query["ORDER"];
	return filteredDatasets.sort((dataset1, dataset2) => {
		if (dataset1[keyToSort] > dataset2[keyToSort]) {
			return 1;
		}

		if (dataset1[keyToSort] < dataset2[keyToSort]) {
			return -1;
		}

		return 0;
	});
};

export {whereParser, optionFilter};
