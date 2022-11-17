import {InsightError} from "../../../IInsightFacade";
import {mFieldValidator, sFieldValidator} from "./fieldValidator";

const optionValidator = (optionClause: Record<string, any>, transformationsTracker: number): string[] => {
	let keyFields: string[] = [];
	let keys = Object.keys(optionClause);
	if (keys.length > 2) {
		throw new InsightError("Invalid Query - duplicate COLUMNS OR ORDER");
	}
	let columns;
	if(keys[0] !== "COLUMNS") {
		throw new InsightError("OPTIONS missing COLUMNS");
	} else {
		columns = optionClause["COLUMNS"];
		if(columns.length === 0) {
			throw new InsightError("COLUMNS must be a non-empty array");
		} else {
			columns.forEach((column: string) => {
				if(!mFieldValidator(column) && !sFieldValidator(column) && transformationsTracker === 0) {
					throw new InsightError("Invalid key " + column + " in COLUMNS");
				} else {
					keyFields.push(column);
				};
			});
		};
	}

	// TODO: function updated - require more testing; factored out logic that process "ORDER"
	if(keys.length === 2) {
		if(keys[1] !== "ORDER") {
			throw new InsightError("Invalid keys in OPTIONS");
		} else {
			let orderClause = optionClause["ORDER"];
			orderValidator(orderClause, columns);
		}
	};
	return keyFields;
};

// TODO: function updated - require more testing
const orderValidator = (orderClause: any, columns: string[]) => {
	if(typeof orderClause === "string") {
		if(!columns.includes(orderClause)) {
			throw new InsightError("ORDER key must be in COLUMNS");
		}
	} else if (typeof orderClause === "object") {
		let validOrderKeys = ["dir", "keys"];
		let orderKeys = Object.keys(orderClause);
		if(orderKeys.length === 0) {
			throw new InsightError("ORDER missing 'dir' key");
		}
		orderKeys.forEach((key) => {
			if(!validOrderKeys.includes(key)) {
				throw new InsightError("Invalid key " + key + " in ORDER; missing 'dir' or 'keys'");
			}
		});
		let validDirection = ["UP", "DOWN"];
		let direction = orderClause["dir"];
		if (!validDirection.includes(direction)) {
			throw new InsightError(("Invalid Direction in ORDER"));
		}
		let keyValues = orderClause["keys"];
		if(keyValues.length === 0) {
			throw new InsightError("keys in ORDER cannot be empty");
		} else {
			for (const value of keyValues) {
				if(!columns.includes(value)) {
					throw new InsightError("ORDER key must be in COLUMNS");
				}
			}
		}
	} else {
		throw new InsightError("Invalid ORDER type");
	}
};

export {optionValidator};
