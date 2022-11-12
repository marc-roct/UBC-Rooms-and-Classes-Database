import {InsightError} from "../../../IInsightFacade";
import {mFieldValidator, sFieldValidator} from "./fieldValidator";
import {isJSON} from "../../jsonHelper";

const whereValidator = (whereClause: Record<string, any>): string[] => {
	let keyFields: string[] = [];
	if(typeof whereClause === "object" && !Array.isArray(whereClause)) {
		// if the input data is an object: push the key to the dataCollector
		// and call queryParser to check the values inside the object
		for(let key in whereClause) {
			if(key === "OR" || key === "AND") {
				logicValidator(whereClause[key], key);
				keyFields = keyFields.concat(whereValidator(whereClause[key]));
			} else if(key === "LT" || key === "GT" || key === "EQ") {
				mComparisonValidator(whereClause[key], key);
				// extract keys from the query
				keyFields = keyFields.concat(Object.keys(whereClause[key]));
			} else if (key === "IS") {
				sComparisonValidator(whereClause[key], key);
				keyFields = keyFields.concat(Object.keys(whereClause[key]));
			} else if (key === "NOT") {
				negationValidator(whereClause[key], key);
				// extract keys from the query
				keyFields = keyFields.concat(whereValidator(whereClause[key]));
			} else {
				throw new InsightError("Invalid query string");
			};
		}
	} else if (Array.isArray(whereClause)) {
		// if the input data is an array: loop through each item and call queryParser()
		// only update the result when an error occurs
		for(let index in whereClause) {
			keyFields = keyFields.concat(whereValidator(whereClause[index]));
		}
	};
	return keyFields;
};

const logicValidator = (data: any, logic: string): void =>  {
	if(!Array.isArray(data)) {
		throw new InsightError("Invalid query string");
	} else if (data.length === 0) {
		throw new InsightError(logic + " must be non-empty array");
	} else {
		data.forEach((item) => {
			let keys = Object.keys(item);
			if (keys.length === 0) {
				throw new InsightError(logic + " should only have 1 key, has 0");
			}
		});
	};
};

const mComparisonValidator = (data: any, mComparator: string): void => {
	if (!isJSON(data)) {
		throw new InsightError(mComparator + " must be object");
	};

	let key = Object.keys(data);
	if (key.length === 0) {
		throw new InsightError(mComparator + " should only have 1 key, has 0");
	} else if (key.length > 1) {
		throw new InsightError(mComparator + " should only have 1 key, has 2");
	};
	if(!mFieldValidator(key[0])) {
		throw new InsightError("Invalid key " + key[0] + " in " + mComparator);
	} else if(typeof data[key[0]] !== "number") {
		throw new InsightError("Invalid value type " + mComparator + " should be number");
	};
};

const sComparisonValidator = (data: any, sComparator: string): void => {
	if (!isJSON(data)) {
		throw new InsightError(sComparator + " must be object");
	};

	let key = Object.keys(data);
	if(key.length === 0) {
		throw new InsightError(sComparator + "should only have 1 key, has 0");
	} else if (key.length > 1) {
		throw new InsightError(sComparator + "should only have 1 key, has 2");
	};
	if(!sFieldValidator(key[0])) {
		throw new InsightError("Invalid key " + key[0] + " in " + sComparator);
	} else if(typeof data[key[0]] !== "string") {
		throw new InsightError("Invalid value type " + sComparator + " should be string");
	};
	let value = data[key[0]] as string;
	let reg = new RegExp("^[*]?([^*]*)[*]?$");
	if(!reg.test(value)) {
		throw new InsightError("Asterisks (*) can only be the first or last characters of input strings");
	};
};

const negationValidator = (data: any, negation: string): void => {
	const listOfFilterKeys = ["IS", "NOT", "AND", "OR", "LT", "GT", "EQ"];
	if (!isJSON(data)) {
		throw new InsightError(negation + " must be object");
	};

	let key = Object.keys(data);
	if (key.length > 1) {
		throw new InsightError(negation + "should only have 1 key, has 2");
	};
	if(!listOfFilterKeys.includes(key[0])) {
		throw new InsightError("Invalid filter key: " + key[0]);
	};
};

export {whereValidator};
