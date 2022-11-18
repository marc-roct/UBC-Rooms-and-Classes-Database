import {InsightDatasetKind, InsightError} from "../../../IInsightFacade";
import {optionValidator} from "./optionValidator";
import {whereValidator} from "./whereValidator";
import {applyRuleValidator, transformationsValidator} from "./transformationValidator";
import {isJSON} from "../../jsonHelper";

const queryValidator = (query: Record<string, any>): [string, number, string[]] => {
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
	checkClauseType(query, transformationsTracker);
	let whereBody = Object.keys(query["WHERE"]);
	if(whereBody.length > 1) {
		throw new InsightError("WHERE should only have 1 key, has 2");
	};
	let keyFields: string[] = [];
	let columns = optionValidator(query["OPTIONS"], transformationsTracker);
	keyFields = keyFields.concat(whereValidator(query["WHERE"]));
	keyFields = keyFields.concat(columns);
	if(transformationsTracker !== 0) {
		keyFields = keyFields.concat(transformationsValidator(query["TRANSFORMATIONS"], columns));
		keyFields = keyFields.concat(applyRuleValidator(query["TRANSFORMATIONS"]["APPLY"]));
	}
	databaseId = checkDatasetReference(keyFields);
	return [databaseId, transformationsTracker, keyFields];
};

const checkClauseType = (query: Record<string, any>, transformationsTracker: number): void => {
	if(!isJSON(query["WHERE"])) {
		throw new InsightError("WHERE must be object");
	};
	if(!isJSON(query["OPTIONS"])) {
		throw new InsightError("OPTIONS must be object");
	}
	if(transformationsTracker !== 0) {
		if(!isJSON(query["TRANSFORMATIONS"])) {
			throw new InsightError("TRANSFORMATIONS not well typed");
		}
	}
};

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

const checkFieldsAgainstDatasetKind = (fields: string[], datasetKind: InsightDatasetKind): void => {
	const validSectionFields = ["avg","pass", "fail", "audit", "year", "dept",  "id", "instructor",  "title", "uuid"];
	const validRoomFields = ["lat", "lon", "seats", "fullname", "shortname", "number", "name", "address", "type",
		"furniture", "href"];
	fields.forEach((field) => {
		if(field.includes("_")) {
			let keyValues = field.split("_");
			if(datasetKind === InsightDatasetKind.Sections) {
				if(!validSectionFields.includes(keyValues[1])) {
					throw new InsightError("Invalid key in the query for section datasets");
				};
			} else if (datasetKind === InsightDatasetKind.Rooms) {
				if(!validRoomFields.includes(keyValues[1])) {
					throw new InsightError("Invalid key in the query for room datasets");
				};
			} else {
				throw new InsightError("Invalid key in the query for the given dataset kind");
			};
		};
	});
};


export {queryValidator, checkFieldsAgainstDatasetKind};
