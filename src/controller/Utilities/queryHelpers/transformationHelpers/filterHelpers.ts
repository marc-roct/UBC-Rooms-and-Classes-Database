import {Dataset} from "../../../InsightFacade";
import {InsightError, InsightResult} from "../../../IInsightFacade";
import {isJSON} from "../../jsonHelper";

const optionFilter = (query: any, dataSets: Dataset[] | InsightResult[]): InsightResult[] => {
	let keys = Object.keys(query);
	let columnKeys: string[] = query["COLUMNS"];

	let filteredDatasets: InsightResult[] = [];

	for (let dataset of dataSets as Dataset[]) {
		type ObjectKey = keyof typeof dataset;
		let filteredDataset: InsightResult = {};

		for (let key of columnKeys) {
			let keyValue = key;
			if(keyValue.includes("_")){
				keyValue = key.split("_")[1];
			}
			filteredDataset[key] = dataset[keyValue as ObjectKey];
		}

		filteredDatasets.push(filteredDataset);
	}

	// TODO: move the code below to orderFilter
	if (keys.length === 2) {
		let keyToSort = query["ORDER"];
		if(typeof keyToSort === "string") {
			filteredDatasets = sortSingleKey(keyToSort, filteredDatasets);
		} else if (typeof keyToSort === "object"){
			filteredDatasets = sortMultipleKeys(keyToSort, filteredDatasets);
		};
	};
	return filteredDatasets;
};

const sortSingleKey = (keyToSort: string, filteredDatasets: InsightResult[]): InsightResult[] => {
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

const sortMultipleKeys = (keyToSort: object, filteredDatasets: InsightResult[]): InsightResult[] => {
	let result: InsightResult[] = [];
	if(!isJSON(keyToSort)) {
		throw new InsightError("Invalid ORDER type");
	}
	let direction = keyToSort["dir"];
	let keys = keyToSort["keys"] as string[];
	if(direction === "UP") {
		result = filteredDatasets.sort((dataset1, dataset2) => {
			for(const key of keys) {
				if (dataset1[key] > dataset2[key]) {
					return 1;
				}

				if (dataset1[key] < dataset2[key]) {
					return -1;
				}
			};
			return 0;
		});
	} else {
		result = filteredDatasets.sort((dataset1, dataset2) => {
			for(const key of keys) {
				if (dataset1[key] > dataset2[key]) {
					return -1;
				}

				if (dataset1[key] < dataset2[key]) {
					return 1;
				}
			};
			return 0;
		});
	}
	return result;
};

export {optionFilter};
