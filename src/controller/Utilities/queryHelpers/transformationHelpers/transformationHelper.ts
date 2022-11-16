import {Dataset} from "../../../InsightFacade";
import {InsightResult} from "../../../IInsightFacade";
import Decimal from "decimal.js";

interface Group {
	id: string;
	keys: string[];
	members: Dataset[];
}

const transformationFilter = (query: any, dataSets: Dataset[]): InsightResult[] => {
	let dataSetGroups = groupFilter(query["GROUP"],dataSets);
	let filteredResult = applyFilter(query["APPLY"], dataSetGroups);
	return filteredResult;
};

const groupFilter = (groupKeys: string[], dataSets: Dataset[]): Group[] => {
	let groups: Group[] = [];
	const groupIds = new Set();
	let keys: string[] = [];
	groupKeys.forEach((keyBeforeFormatted)=> {
		let key = keyBeforeFormatted.split("_")[1];
		keys.push(key);
	});
	dataSets.forEach((dataSet) => {
		let groupId: string = "";
		keys.forEach((key)=> {
			groupId = groupId.concat(dataSet[key].toString());
		});
		groupId = groupId.replace(/ /g,"_");
		if(groupIds.has(groupId)) {
			groups.forEach((group) => {
				if(group.id === groupId) {
					group.members.push(dataSet);
				};
			});
		} else {
			groupIds.add(groupId);
			let group: Group = {id: groupId, keys: [], members: []};
			group.members.push(dataSet);
			groups.push(group);
			group.keys = keys;
		};
	});

	return groups;
};

const applyFilter = (applyRules: object[], groups: Group[]): InsightResult[] => {
	let calculatedResults: InsightResult[] = [];
	groups.forEach((group) => {
		calculatedResults.push(applyRulesToGroup(applyRules, group));
	});
	return calculatedResults;
};

const applyRulesToGroup = (applyRules: object[], group: Group): InsightResult => {
	let calculatedResult: InsightResult = {};
	let member = group.members[0];
	type ObjectKey = keyof typeof member;
	group.keys.forEach((key) => {
		calculatedResult[key] = member[key as ObjectKey];
	});
	applyRules.forEach((ruleObject) => {
		let result: number = 0;
		const ruleBody = Object.entries(ruleObject);
		let fieldName = ruleBody[0][0];
		let tokenObject = ruleBody[0][1];
		const applyRule = Object.entries(tokenObject);
		let token = applyRule[0][0];
		let key = applyRule[0][1] as string;
		let formattedFieldName = fieldName.toString();
		let formattedKey = key.split("_")[1];
		switch(token.toString()) {
			case "MAX": {
				result = maxCalculator(group, formattedKey);
			};
				break;
			case "MIN": {
				result = minCalculator(group, formattedKey);
			};
				break;
			case "AVG": {
				result = avgCalculator(group, formattedKey);
			};
				break;
			case "SUM": {
				result = sumCalculator(group, formattedKey);
			};
				break;
			case "COUNT": {
				result = countCalculator(group, formattedKey);
			};
				break;
			default:
				return calculatedResult;
		}
		calculatedResult[formattedFieldName] = result;
	});
	return calculatedResult;
};

const maxCalculator = (group: Group, key: string): number => {
	let maxValue = 0;
	group.members.forEach((dataset) => {
		let valueToCheck: number = dataset[key] as number;
		if(valueToCheck > maxValue) {
			maxValue = valueToCheck;
		}
	});
	return maxValue;
};

const minCalculator = (group: Group, key: string): number => {
	let minValue = Number.MAX_VALUE;
	group.members.forEach((dataset) => {
		let valueToCheck: number = dataset[key] as number;
		if(valueToCheck < minValue) {
			minValue = valueToCheck;
		}
	});
	return minValue;
};

const avgCalculator = (group: Group, key: string): number => {
	let total: Decimal = new Decimal(0);
	let numRows = 0;
	group.members.forEach((dataset) => {
		let value = dataset[key];
		let valueToCheck = new Decimal(value);
		total = Decimal.add(total,valueToCheck);
		numRows++;
	});
	let avg = total.toNumber() / numRows;
	let result = Number(avg.toFixed(2));
	return result;
};

const sumCalculator = (group: Group, key: string): number => {
	let sum: Decimal = new Decimal(0);
	group.members.forEach((dataset) => {
		let valueToCheck = new Decimal(dataset[key] as number);
		sum = Decimal.add(sum, valueToCheck);
	});
	let result = Number(sum.toFixed(2));
	return result;
};

const countCalculator = (group: Group, key: string): number => {
	let set = new Set();
	group.members.forEach((dataset) => {
		set.add(dataset[key]);
	});
	let result = set.size;
	return result;
};


export {transformationFilter};
