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
	// console.log("$$$$$$$$$$$$$$$$$$$");
	// console.log(dataSetGroups);
	return filteredResult;
};

/*
GROUP: [term1, term2, ...] signifies that a group should be created for every unique set of all N-terms.
For example, GROUP: [sections_dept, sections_id] would create a group
for every unique (department, id) pair in the "sections" dataset.
 */
// TODO: the Dataset type may be changed to InsightResult
const groupFilter = (groupKeys: string[], dataSets: Dataset[]): Group[] => {
	// TODO: contact the keys as the id of a group
	let groups: Group[] = [];
	const groupIds = new Set();
	let keys: string[] = [];
	groupKeys.forEach((keyBeforeFormatted)=> {
		let key = keyBeforeFormatted.split("_")[1];
		keys.push(key);
	});
	// console.log(keys);
	dataSets.forEach((dataSet) => {
		// combine key values as an ID
		let groupId: string = "";
		keys.forEach((key)=> {
			groupId = groupId.concat(dataSet[key].toString());
		});
		groupId = groupId.replace(/ /g,"_");
		// console.log("%%%%%%%%%%%%%%%%%");
		// console.log(groupId);
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
	// console.log("%%%%%%%%%%%%%%%%%");
	// console.log(calculatedResults);
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
		let value = ruleBody[0][1];
		// console.log("%%%%%%%%%%%%%%%%%");
		// console.log(ruleObject);
		// console.log(ruleBody);
		// console.log(fieldName);
		// console.log(value);
		const applyRule = Object.entries(value);
		// console.log(applyRule);
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
		console.log("^^^^^^^^^^^^^^^");
		console.log(calculatedResult);
	});
	return calculatedResult;
};

// TODO: do more testing to see the casting is correct
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
	let minValue = 0;
	group.members.forEach((dataset) => {
		let valueToCheck: number = dataset[key] as number;
		if(valueToCheck < minValue) {
			minValue = valueToCheck;
		}
	});
	return minValue;
};

// TODO: fix the bug that the valueToCheck is not converted correctly.
const avgCalculator = (group: Group, key: string): number => {
	let total: Decimal = new Decimal(0);
	let numRows = 0;
	group.members.forEach((dataset) => {
		let value = dataset[key];
		let valueToCheck = new Decimal(value);
		total = Decimal.add(total,valueToCheck);
		numRows++;
	});
	// console.log("****************");
	// console.log(key);
	// console.log(total);
	// console.log(numRows);
	let avg = total.toNumber() / numRows;
	let result = Number(avg.toFixed(2));
	// console.log(avg);
	// console.log(result);
	return result;
};

const sumCalculator = (group: Group, key: string): number => {
	let sum: Decimal = new Decimal(0);
	group.members.forEach((dataset) => {
		let valueToCheck = new Decimal(dataset[key] as number);
		sum.add(valueToCheck);
	});
	let result = Number(sum.toFixed(2));
	return result;
};

// TODO: double check how the count work
const countCalculator = (group: Group, key: string): number => {
	let set = new Set();
	group.members.forEach((dataset) => {
		set.add(dataset[key]);
	});
	let result = set.size;
	return result;
};


export {transformationFilter};
