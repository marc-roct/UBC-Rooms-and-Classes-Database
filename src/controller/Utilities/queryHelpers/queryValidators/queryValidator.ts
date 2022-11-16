import {InsightError} from "../../../IInsightFacade";
import {optionValidator} from "./optionValidator";
import {whereValidator} from "./whereValidator";
import {transformationsValidator, applyRuleValidator} from "./transformationValidator";

const queryValidator = (query: Record<string, any>): [string, number] => {
	let databaseId: string;
	let whereTracker = 0;
	let optionTracker = 0;
	let transformationsTracker = 0;
	// get the keys from the query object
	let keys = Object.keys(query);
	keys.forEach((key) => {
		if (key === "WHERE") {
			whereTracker += 1;
		} else if (key === "OPTIONS") {
			optionTracker += 1;
		} else if (key === "TRANSFORMATIONS") {
			transformationsTracker += 1;
		}
	});
	if (whereTracker === 0) {
		throw new InsightError("Missing WHERE");
	};
	if(optionTracker === 0) {
		throw new InsightError("Missing OPTIONS");
	};
	if (whereTracker > 1 || optionTracker > 1) {
		throw new InsightError("Invalid Query");
	};

	// TODO: this validation may be required as it's not on the spec
	let whereBody = Object.keys(query["WHERE"]);
	if(whereBody.length > 1) {
		throw new InsightError("WHERE should only have 1 key, has 2");
	};
	let keyFields: string[] = [];
	let columns = optionValidator(query["OPTIONS"], transformationsTracker);
	keyFields = keyFields.concat(whereValidator(query["WHERE"]));
	keyFields = keyFields.concat(columns);
	if(transformationsTracker !== 0) {
		transformationsValidator(query["TRANSFORMATIONS"], columns);
		keyFields = keyFields.concat(applyRuleValidator(query["TRANSFORMATIONS"]["APPLY"]));
	}
	databaseId = checkDatasetReference(keyFields);
	return [databaseId, transformationsTracker];
};


// TODO: function updated - require more testing
const checkDatasetReference = (keyFields: string[]): string => {
	const dataSetId = new Set();
	let id: string = "id not found";
	keyFields.forEach((field: string) => {
		if(field.includes("_")) {
			let keyValues = field.split("_");
			id = keyValues[0];
			dataSetId.add(keyValues[0]);
		}
	});
	if(dataSetId.size > 1) {
		throw new InsightError("Cannot query more than one dataset");
	};
	return id;
};


export {queryValidator};
