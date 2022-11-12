import {Dataset} from "../../../InsightFacade";
import {InsightResult} from "../../../IInsightFacade";

const optionFilter = (query: any, dataSets: Dataset[] | InsightResult[]): InsightResult[] => {
	let keys = Object.keys(query);
	let columnKeys: string[] = query["COLUMNS"];

	let filteredDatasets: InsightResult[] = [];

	for (let dataset of dataSets as Dataset[]) {
		type ObjectKey = keyof typeof dataset;
		let filteredDataset: InsightResult = {};

		for (let key of columnKeys) {
			// console.log("###############");
			// console.log(key);
			let keyValue = key;
			if(keyValue.includes("_")){
				keyValue = key.split("_")[1];
			}
			// console.log(dataset[keyValues[1] as ObjectKey]);
			filteredDataset[key] = dataset[keyValue as ObjectKey];
		}

		filteredDatasets.push(filteredDataset);
	}

	// TODO: move the code below to orderFilter
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

// TODO: build a new function for ORDER; ORDER is the last logic to process in a query
const orderFilter = (query: any, insightResults: InsightResult[]): InsightResult[] => {
	return [];
};

export {optionFilter};
