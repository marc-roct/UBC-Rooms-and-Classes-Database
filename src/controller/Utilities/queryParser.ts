import {Dataset, Database} from "../InsightFacade";
import {InsightError, InsightResult} from "../IInsightFacade";

const whereParser = (query: any, dataSet: Dataset[]): Dataset[] => {
	let dataCollector: Dataset[] = [];
	let keys = Object.keys(query);
	if(typeof query === "object" && !Array.isArray(query) && keys.length !== 0) {
		for(let key in query) {
			switch(key) {
				case "OR": {
					// OR can contain more than 1 items in the list
					// the set should be a union
					for (let index in query[key]) {
						dataCollector = dataCollector.concat(whereParser(query[key][index], dataSet));
					};
					dataCollector = orLogic(dataCollector);
				};
					break;
				case "AND": {
					// AND can contain more than 2 items in the list
					// the set should be an intersection
					let tempCollector = [];
					for (let index in query[key]) {
						tempCollector.push(whereParser(query[key][index], dataSet));
					}
					dataCollector = andLogic(tempCollector);
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
				case "NOT": {
					let tempCollector = whereParser(query[key], dataSet);
					dataCollector = notLogic(dataSet, tempCollector);
				};
					break;
				default:
					return dataCollector;
			}
		}
	} else {
		// WHERE is empty, thus Object.keys(query).length === 0
		dataCollector = dataSet;
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

const fieldParser = (field: string): string => {
	let result: string;
	let keyValues = field.split("_");
	result = keyValues[1];
	return result;
};

const orLogic = (tempCollector: Dataset[]): Dataset[] => {
	// use set to remove duplicate records
	let union = new Set(tempCollector);
	let result: Dataset[] = Array.from(union);
	return result;
};

const andLogic = (tempCollector: Dataset[][]): Dataset[] => {
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

const notLogic = (dataSet: Dataset[], tempCollector: Dataset[]): Dataset[] => {
	// convert input dataset arrays to sets
	let difference = new Set(dataSet);
	let removable = new Set(tempCollector);
	for (const item of removable) {
		difference.delete(item);
	};
	let result: Dataset[] = Array.from(difference);
	return result;
};

const optionFilter = (query: any, dataSets: Dataset[]): InsightResult[] => {
	let keys = Object.keys(query);
	let columnKeys: string[] = query["COLUMNS"];

	let filteredDatasets: InsightResult[] = [];

	for (let dataset of dataSets as Dataset[]) {
		type ObjectKey = keyof typeof dataset;
		let filteredDataset: InsightResult = {};

		for (let key of columnKeys) {
			let keyValues = key.split("_");
			// console.log(dataset[keyValues[1] as ObjectKey]);
			filteredDataset[key] = dataset[keyValues[1] as ObjectKey];
		}

		filteredDatasets.push(filteredDataset);
	}

	if (keys.length === 2) {
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
	return filteredDatasets;
};

export {whereParser, getDataset, optionFilter};
