import {InsightError} from "../../../IInsightFacade";
import {mFieldValidator, sFieldValidator} from "./fieldValidator";
import {isJSON} from "../../jsonHelper";

const transformationsValidator = (transformations: Record<string, any>, applyKeyInColumns: string[]): void => {
	let applyKeyObjects = transformations["APPLY"];
	let applyKeys: string [] = [];
	applyKeyObjects.forEach((keyObject: object) => {
		let key = Object.keys(keyObject);
		applyKeys.push(key[0]);
	});
	let groupKeys = transformations["GROUP"];
	if(groupKeys.length === 0) {
		throw new InsightError("GROUP must be a non-empty array");
	}
	let allTransformationKeys = groupKeys.concat(applyKeys);
	applyKeyInColumns.forEach((key)=> {
		if(!allTransformationKeys.includes(key)) {
			throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
		}
	});
	applyKeys.forEach((key)=> {
		if(!applyKeyInColumns.includes(key)) {
			throw new InsightError("Invalid key " + key + " in COLUMNS");
		}
	});
};

const applyRuleValidator = (applyRules: object[]): string[] => {
	const ruleTokens = ["MAX", "MIN", "AVG", "SUM"];
	let rules: object[] = [];
	let applyFields: string[] = [];
	applyRules.forEach((rule) => {
		rules.push(Object.values(rule)[0]);
	});
	for (const rule of rules) {
		if (!isJSON(rule)) {
			throw new InsightError("APPLY RULE must be object");
		};
		let token = Object.keys(rule)[0];
		let key: string = rule[token] as string;
		if(ruleTokens.includes(token)) {
			mFieldValidator(key);
		} else if (token === "COUNT") {
			mFieldValidator(key);
			sFieldValidator(key);
		} else {
			throw new InsightError("Invalid transformation operator");
		}
		applyFields.push(key);
	}
	return applyFields;
};

export {transformationsValidator, applyRuleValidator};
