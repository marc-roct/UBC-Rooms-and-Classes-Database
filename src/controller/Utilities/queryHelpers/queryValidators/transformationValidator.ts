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
	applyKeys.forEach((key)=> {
		if(!applyKeyInColumns.includes(key)) {
			throw new InsightError("Invalid key " + key + " in COLUMNS");
		}
	});
	let groupKeys = transformations["GROUP"];
	if(isJSON(groupKeys)) {
		throw new InsightError("GROUP must be a non-empty array");
	} else {
		groupKeys = groupKeys as string[];
	}
	if(groupKeys.length === 0) {
		throw new InsightError("GROUP must be a non-empty array");
	}
	for (const key of groupKeys) {
		if(!mFieldValidator(key) && !sFieldValidator(key)) {
			throw new InsightError("Invalid key " + key + " in COLUMNS");
		}
	};
	let allTransformationKeys = groupKeys.concat(applyKeys);
	// keys in columns should be the subset of keys in transformations
	applyKeyInColumns.forEach((key)=> {
		if(!allTransformationKeys.includes(key)) {
			throw new InsightError("Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present");
		}
	});
};

const applyRuleValidator = (applyRules: object[]): string[] => {
	const ruleTokens = ["MAX", "MIN", "AVG", "SUM", "COUNT"];
	let rules: object[] = [];
	let applyFields: string[] = [];
	applyRules.forEach((rule) => {
		rules.push(Object.values(rule)[0]);
	});
	for (const rule of rules) {
		if (!isJSON(rule)) {
			throw new InsightError("APPLY RULE must be object");
		};
		let ruleObjectKeys = Object.keys(rule);
		if(ruleObjectKeys.length === 0) {
			throw new InsightError("Apply body should only have 1 key, has 0");
		}
		let token = ruleObjectKeys[0];
		let key: string = rule[token] as string;
		if (key === "") {
			throw new InsightError("Invalid apply rule target key");
		}
		if(ruleTokens.includes(token)) {
			if(!mFieldValidator(key)) {
				throw new InsightError("Invalid key type in " + token);
			};
			if((token === "COUNT") && !sFieldValidator(key)) {
				throw new InsightError("Invalid apply rule target key");
			}
		} else {
			throw new InsightError("Invalid transformation operator");
		}
		applyFields.push(key);
	}
	return applyFields;
};

export {transformationsValidator, applyRuleValidator};
