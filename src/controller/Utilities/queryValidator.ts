import {InsightError} from "../IInsightFacade";

const queryValidator = (query: Record<string, any>): string => {
	let databaseId: string;
	let bodyTracker = 0;
	let optionTracker = 0;
	// get the keys from the query object
	let keys = Object.keys(query);
	keys.forEach((key) => {
		if (key === "WHERE") {
			bodyTracker += 1;
		} else if (key === "OPTIONS") {
			optionTracker += 1;
		};
	});
	if (bodyTracker === 0) {
		throw new InsightError("Missing WHERE");
	};
	if(optionTracker === 0) {
		throw new InsightError("Missing OPTIONS");
	};
	if (bodyTracker > 1 || optionTracker > 1) {
		throw new InsightError("Invalid Query");
	};

	// TODO: this validation may be required as it's not on the spec
	let whereBody = Object.keys(query["WHERE"]);
	if(whereBody.length > 1) {
		throw new InsightError("WHERE should only have 1 key, has 2");
	};
	let keyFields: string[] = [];
	keyFields = keyFields.concat(whereValidator(query["WHERE"]));
	keyFields = keyFields.concat(optionValidator(query["OPTIONS"]));
	databaseId = checkDatasetReference(keyFields);
	return databaseId;
};

const whereValidator = (data: Record<string, any>): string[] => {
	let keyFields: string[] = [];
	if(typeof data === "object" && !Array.isArray(data)) {
		// if the input data is an object: push the key to the dataCollector
		// and call queryParser to check the values inside the object
		for(let key in data) {
			if(key === "OR" || key === "AND") {
				logicValidator(data[key], key);
				keyFields = keyFields.concat(whereValidator(data[key]));
			} else if(key === "LT" || key === "GT" || key === "EQ") {
				mComparisonValidator(data[key], key);
				// extract keys from the query
				keyFields = keyFields.concat(Object.keys(data[key]));
			} else if (key === "IS") {
				sComparisonValidator(data[key], key);
				keyFields = keyFields.concat(Object.keys(data[key]));
			} else if (key === "NOT") {
				negationValidator(data[key], key);
				// extract keys from the query
				keyFields = keyFields.concat(whereValidator(data[key]));
			} else {
				throw new InsightError("Invalid query string");
			};
		}
	} else if (Array.isArray(data)) {
		// if the input data is an array: loop through each item and call queryParser()
		// only update the result when an error occurs
		for(let index in data) {
			keyFields = keyFields.concat(whereValidator(data[index]));
		}
	};
	return keyFields;
};

const optionValidator = (options: Record<string, any>): string[] => {
	let keyFields: string[] = [];
	let keys = Object.keys(options);
	if (keys.length > 2) {
		throw new InsightError("Invalid Query - duplicate COLUMNS OR ORDER");
	}
	let columns;
	if(keys[0] !== "COLUMNS") {
		throw new InsightError("OPTIONS missing COLUMNS");
	} else {
		columns = options["COLUMNS"];
		if(columns.length === 0) {
			throw new InsightError("COLUMNS must be a non-empty array");
		} else {
			columns.forEach((column: string) => {
				if(!mFieldValidator(column) && !sFieldValidator(column)) {
					throw new InsightError("Invalid key " + column + " in COLUMNS");
				} else {
					keyFields.push(column);
				};
			});
		};
	}

	if(keys.length === 2) {
		if(keys[1] !== "ORDER") {
			throw new InsightError("Invalid keys in OPTIONS");
		} else {
			let order = options["ORDER"];
			if(typeof order !== "string") {
				throw new InsightError("Invalid ORDER type");
			}else if(!columns.includes(order)) {
				throw new InsightError("ORDER key must be in COLUMNS");
			};
		}
	};
	return keyFields;
};

const checkDatasetReference = (keyFields: string[]): string => {
	const dataSetId = new Set();
	let id: string = "id not found";
	keyFields.forEach((field: string) => {
		let keyValues = field.split("_");
		id = keyValues[0];
		dataSetId.add(keyValues[0]);
	});
	if(dataSetId.size > 1) {
		throw new InsightError("Cannot query more than one dataset");
	};
	return id;
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

const mFieldValidator = (field: string): boolean => {
	// TODO: add more fields for room query
	const listOfValidMFields = ["avg","pass", "fail", "audit", "year", "lat", "lon", "seats"];
	if(field.includes("_")) {
		let keyValues = field.split("_");
		// check if there is no underscore and the key is valid
		if(listOfValidMFields.includes(keyValues[1]) && keyValues.length === 2) {
			return true;
		}
	}
	return false;
};

const sFieldValidator = (field: string): boolean => {
	// TODO: add more fields for room query
	const listOfValidSFields = ["dept",  "id", "instructor",  "title", "uuid",
		"fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];
	if(field.includes("_")) {
		let keyValues = field.split("_");
		// check if there is no underscore and the key is valid
		if(listOfValidSFields.includes(keyValues[1]) && keyValues.length === 2) {
			return true;
		};
	};
	return false;
};

const isJSON = (query: any): query is Record<string, unknown> => {
	return query !== null && query !== undefined && typeof query === "object" && !Array.isArray(query);
};

export {isJSON, queryValidator};
