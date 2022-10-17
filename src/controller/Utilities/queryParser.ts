import {Dataset, Database} from "../InsightFacade";
import {InsightError} from "../IInsightFacade";

const whereParser = (query: any, dataSet: Dataset[]): Dataset[] => {
	// TODO: update the datatype to the datatype that addDataset return
	let dataCollector: Dataset[] = [];
	if(typeof query === "object" && !Array.isArray(query)) {
		// if the input data is an object: push the key to the dataCollector
		// and call queryParser to check the values inside the object
		for(let key in query) {
			switch(key) {
				case "OR": {
					// STUB
					// Todo: get all objects and pass them to whereParser
					// OR can contain more than 1 items in the list
					// dataCollector = orLogic(query, dataSet);
					let tempCollector = [];
					for (let index in query[key]) {
						tempCollector.push(whereParser(query[key][index], dataSet));
					};
				};
					break;
				case "AND": {
					// STUB
					// Todo: get the target items based on all the criteria
					// join different sets
					// e.g. greater and equal
					// iterate through the array, and join each set
					let tempCollector = [];
					for (let index in query[key]) {
						tempCollector.push(whereParser(query[key][index], dataSet));
					}
					dataCollector = addLogic(tempCollector);
				};
					break;
				case "LT":
					dataCollector = dataCollector.concat(lessThanLogic(query["LT"], dataSet));
					break;
				case "GT":
					dataCollector = dataCollector.concat(greaterThanLogic(query["GT"], dataSet));
					break;
				case "EQ":
					dataCollector = dataCollector.concat(equalToLogic(query["EQ"], dataSet));
					break;
				case "IS":
					dataCollector = dataCollector.concat(isLogic(query["IS"], dataSet));
					break;
				case "NOT":
					// STUB
					break;
				default:
					return dataCollector;
			}
		}
	};
	// else if (Array.isArray(query)) {
	// 	// if the input data is an array: loop through each item and call queryParser()
	// 	for(let index in query) {
	// 		// TODO: use Set to combine data
	// 		// dataCollector = dataCollector.concat(whereParser(query[index], dataSet));
	// 	}
	// };
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

const fieldParser = (field: string): string => {
	let result: string;
	let keyValues = field.split("_");
	result = keyValues[1];
	return result;
};

// TODO: use Set() to collect data to avoid duplicate records
// TODO: use filter to loop through the dataset

const orLogic = (tempCollector: Dataset[]): Dataset[] => {
	// use set to remove duplicate records
	let union = new Set();
	let result: Dataset[] = [];
	tempCollector.forEach((dataset) => {
		union.add(dataset);
	});
	// TODO: figure out how to convert the set to an array
	// result = Array.from(union);
	return result;
};

const addLogic = (tempCollector: Dataset[][]): Dataset[] => {
	let intersection: Dataset[] = [];
	for (let index = 1; index < tempCollector.length; index++) {
		// compare the results produced by Comparator Helpers
		// if they are the same, then they are intercepted.
		tempCollector[index - 1].forEach((course) => {
			if(tempCollector[index].includes(course)) {
				intersection.push(course);
			};
		});
	}
	return intersection;
};

const isLogic = (query: any, dataSet: Dataset[]): Dataset[] => {
	let subset: Dataset[] = [];
	let key = Object.keys(query);
	let field = fieldParser(key[0]);
	let value: string = query[key[0]];
	dataSet.forEach((course) => {
		if(course[field] === value) {
			subset.push(course);
		}
	});
	return subset;
};

const lessThanLogic = (query: Record<string, any>, dataSet: Dataset[]): Dataset[] => {
	let subset: Dataset[] = [];
	let key = Object.keys(query);
	let field = fieldParser(key[0]);
	let value = query[key[0]];
	dataSet.forEach((course) => {
		if(course[field] < value) {
			subset.push(course);
		}
	});
	return subset;
};

const greaterThanLogic = (query: Record<string, any>, dataSet: Dataset[]): Dataset[] => {
	let subset: Dataset[] = [];
	let key = Object.keys(query);
	let field = fieldParser(key[0]);
	let value = query[key[0]];
	dataSet.forEach((course) => {
		if(course[field] > value) {
			subset.push(course);
		}
	});
	return subset;
};

const equalToLogic = (query: Record<string, any>, dataSet: Dataset[]): Dataset[] => {
	let subset: Dataset[] = [];
	let key = Object.keys(query);
	let field = fieldParser(key[0]);
	let value: number = query[key[0]];
	dataSet.forEach((course) => {
		if(course[field] === value) {
			subset.push(course);
		}
	});
	return subset;
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
