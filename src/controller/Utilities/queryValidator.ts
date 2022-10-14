import {InsightError} from "../IInsightFacade";

const whereValidator = (data: Record<string, any>): void => {
	// let result = "resolved";
	if(typeof data === "object" && !Array.isArray(data)) {
		// if the input data is an object: push the key to the dataCollector
		// and call queryParser to check the values inside the object
		for(let key in data) {
			if(key === "OR" || key === "AND") {
				logicValidator(data[key], key);
				whereValidator(data[key]);
				// result = logicValidator(data[key], key);
				// if(result !== "resolved") {
				// 	return result;
				// };
				// result = whereValidator(data[key]);
				// return result;
			} else if(key === "LT" || key === "GT" || key === "EQ") {
				mComparisonValidator(data[key], key);
				// result = mComparisonValidator(data[key], key);
				// if(result !== "resolved") {
				// 	return result;
				// };
			} else if (key === "IS") {
				sComparisonValidator(data[key], key);
				// result = sComparisonValidator(data[key], key);
				// if(result !== "resolved") {
				// 	return result;
				// }
			} else if (key === "NOT") {
				negationValidator(data[key], key);
				whereValidator(data[key]);
				// result = negationValidator(data[key], key);
				// if(result !== "resolved") {
				// 	return result;
				// };
				// result = whereValidator(data[key]);
				// return result;
			} else {
				// console.log(data);
				// result = "Invalid Query";
				throw new InsightError("Invalid query string");
			};
		}
	} else if (Array.isArray(data)) {
		// if the input data is an array: loop through each item and call queryParser()
		// only update the result when an error occurs
		for(let index in data) {
			whereValidator(data[index]);
			// let itemResult = whereValidator(data[index]);
			// if (itemResult !== "resolved") {
			// 	result = itemResult;
			// }
		}
	};
	// return result;
};

const queryValidator = (query: Record<string, any>): void => {
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
		// return "Missing WHERE";
	};
	if(optionTracker === 0) {
		throw new InsightError("Missing OPTIONS");
		// return "Missing OPTIONS";
	};
	if (bodyTracker > 1 || optionTracker > 1) {
		throw new InsightError("Invalid Query");
		// return "Invalid Query";
	};

	let whereBody = Object.keys(query["WHERE"]);
	if(whereBody.length > 1) {
		// TODO: if it's something wrong [throw new Error("TEXT HERE")]
		throw new InsightError("WHERE should only have 1 key, has 2");
		// return "WHERE should only have 1 key, has 2";
	};
	// // TODO: if ok, not need to return anything
	// return "resolved";
};

const optionValidator = (options: any): void => {
	let keys = Object.keys(options);
	// OPTIONS can contain only 1 column and at most 1 order
	if (keys.length > 2) {
		throw new InsightError("Invalid Query - duplicate COLUMNS OR ORDER");
		// return "Invalid Query - duplicate COLUMNS OR ORDER";
	}
	// COLUMNS and ORDERS can be in different order
	keys.forEach((key) => {
		if(key !== "COLUMNS" && key !== "ORDER") {
			throw new InsightError("Invalid Query");
			// return false;
		};
		let columns = options["COLUMNS"];
		if (key === "COLUMNS") {
			if(columns.length === 0) {
				throw new InsightError("COLUMNS must be a non-empty array");
				// return "COLUMNS must be a non-empty array";
			} else {
				columns.forEach((column: string) => {
					if(!mFieldValidator(column) && !sFieldValidator(column)) {
						throw new InsightError("Invalid key " + column + " in COLUMNS");
						// return "Invalid key " + column + " in COLUMNS";
					};
				});
			};
		};
		if (key === "ORDER") {
			let order = options[key];
			if(typeof order !== "string") {
				throw new InsightError("Invalid ORDER type");
				// return "Invalid ORDER type";
			}else if(!columns.includes(order)) {
				throw new InsightError("ORDER key must be in COLUMNS");
				// return "ORDER key must be in COLUMNS";
			};
		};
	});
	// return "resolved";
};


const logicValidator = (data: any, logic: string): void =>  {
	if(!Array.isArray(data)) {
		throw new InsightError("Invalid query string");
		// return "Invalid query string";
	} else if (data.length === 0) {
		throw new InsightError(" must be non-empty array");
		// return logic + " must be non-empty array";
	}
	// return "resolved";
};

const mComparisonValidator = (data: any, mComparator: string): void => {
	if (!isJSON(data)) {
		throw new InsightError(mComparator + " must be object");
		// return mComparator + " must be object";
	}

	let key = Object.keys(data);
	if (key.length > 1) {
		throw new InsightError(mComparator + " should only have 1 key, has 2");
		// return mComparator + " should only have 1 key, has 2";
	}
	if(!mFieldValidator(key[0])) {
		throw new InsightError("Invalid key " + key[0] + " in " + mComparator);
		// return "Invalid key " + key[0] + " in " + mComparator;
	} else if(typeof data[key[0]] !== "number") {
		throw new InsightError("Invalid value type " + mComparator + " should be number");
		// return "Invalid value type " + mComparator + " should be number";
	}

	// return "resolved";
};

const sComparisonValidator = (data: any, sComparator: string): void => {
	if (!isJSON(data)) {
		throw new InsightError(sComparator + " must be object");
		// return sComparator + " must be object";
	}

	let key = Object.keys(data);
	if (key.length > 1) {
		throw new InsightError(sComparator + "should only have 1 key, has 2");
		// return sComparator + "should only have 1 key, has 2";
	}
	if(!sFieldValidator(key[0])) {
		throw new InsightError("Invalid key " + key[0] + " in " + sComparator);
		// return "Invalid key " + key[0] + " in " + sComparator;
	} else if(typeof data[key[0]] !== "string") {
		throw new InsightError("Invalid value type " + sComparator + " should be string");
		// return "Invalid value type " + sComparator + " should be string";
	}

	// return "resolved";
};

const negationValidator = (data: any, negation: string): void => {
	const listOfFilterKeys = ["IS", "NOT", "AND", "OR", "LT", "GT", "EQ"];
	if (!isJSON(data)) {
		throw new InsightError(negation + " must be object");
		// return negation + " must be object";
	}

	let key = Object.keys(data);
	if (key.length > 1) {
		throw new InsightError(negation + "should only have 1 key, has 2");
		// return negation + "should only have 1 key, has 2";
	}
	if(!listOfFilterKeys.includes(key[0])) {
		throw new InsightError("Invalid filter key: " + key[0]);
		// return "Invalid filter key: " + key[0];
	}
	// return "resolved";
};

// TODO: return error if it refers to more than 1 dataset
const mFieldValidator = (field: string): boolean => {
	const listOfValidMFields = ["avg","pass", "fail", "audit", "year"];
	if(field.includes("_")) {
		let fieldKeys = field.split("_");
		// check if there is no underscore and the key is valid
		if(listOfValidMFields.includes(fieldKeys[1]) && fieldKeys.length === 2) {
			return true;
		}
	}
	return false;
};

// TODO: return error if it refers to more than 1 dataset
const sFieldValidator = (field: string): boolean => {
	const listOfValidSFields = ["dept",  "id", "instructor",  "title", "uuid"];
	if(field.includes("_")) {
		let fieldKeys = field.split("_");
		// check if there is no underscore and the key is valid
		if(listOfValidSFields.includes(fieldKeys[1]) && fieldKeys.length === 2) {
			return true;
		}
	}
	return false;
};


// TODO: to remove this function
// const ebnfValidator = (data: number | string): boolean => {
// 	const listOfValidLogics = ["IS", "NOT", "AND", "OR"];
// 	const listOfValidMComparator = ["LT", "GT", "EQ"];
// 	const listOfValidMFields = ["avg","pass", "fail", "audit", "year"];
// 	const listOfValidSFields = ["dept",  "id", "instructor",  "title", "uuid"];
// 	// Note: currently we don't validate numbers yet
// 	if (typeof data === "string") {
// 		// check if the key is valid
// 		if(data.includes("_")) {
// 			let fieldKey = data.substring(data.indexOf("_") + 1);
// 			if(!listOfValidMFields.includes(fieldKey) && !listOfValidSFields.includes(fieldKey)) {
// 				return false;
// 			}
// 			// data = "sections__id";
// 			// let keys = data.split("_");
// 			// console.log("######## PRINTING SPLITS" + keys + " " + keys.length);
// 		} else if (data === data.toUpperCase()) {
// 			if(!listOfValidLogics.includes(data) && !listOfValidMComparator.includes(data)) {
// 				return false;
// 			};
// 		};
// 	};
// 	return true;
// };

const isJSON = (query: any): query is Record<string, unknown> => {
	return query !== null && query !== undefined && typeof query === "object" && !Array.isArray(query);
};

export {whereValidator, isJSON, queryValidator, optionValidator};
