import {Dataset, Database} from "../InsightFacade";
import {InsightError} from "../IInsightFacade";

const whereParser = (query: Record<string, any>, dataSet: Dataset[]): string[] => {
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

const getDataset = (databases: Database[], id: string): Dataset[] => {
	let dataSet: Dataset[] = [];
	databases.forEach((database) => {
		if (id === database["id"]) {
			dataSet = database["data"];
		} else {
			throw new InsightError("Referenced dataset " + id + " not added yet");
		}
	});
	return dataSet;
};

// TODO: use Set() to collect data to avoid duplicate records
// TODO: use filter to loop through the dataset

const orLogic = (query: any, dataSet: Dataset[]): string[] => {
	// STUB
	return [];
};

const addLogic = (query: any, dataSet: Dataset[]): string[] => {
	// STUB
	return [];
};

const isLogic = (query: any, dataSet: Dataset[]): string[] => {
	// STUB
	return [];
};

const lessThanLogic = (query: any, dataSet: Dataset[]): string[] => {
	// STUB
	return [];
};

const greaterThanLogic = (query: any, dataSet: Dataset[]): string[] => {
	// STUB
	return [];
};

const equalLogic = (query: any, dataSet: Dataset[]): string[] => {
	// STUB
	return [];
};

const notLogic = (query: any, dataSet: Dataset[]): string[] => {
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
const optionFilter = (query: Record<string, any>, dataSet: any): string[] => {
	// STUB
	return [];
};

export {whereParser, getDataset};
