import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import {queryParser} from "./queryParser";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	constructor() {
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.reject("Not implemented.");
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		const listOfValidOperations = ["IS", "NOT", "AND", "OR", "LT", "GT", "EQ"];
		const listOfValidMFields = ["avg","pass", "fail", "audit", "year"];
		const listOfValidSFields = ["dept",  "id", "instructor",  "title", "uuid"];
		let inputQuery: string;
		if (typeof query === "string") {
			inputQuery = query;
		} else {
			return Promise.reject("The data type of input query is either null or undefined.");
		};
		// TODO: build a recursion to parse all JSON keys
		try {
			inputQuery = JSON.parse(inputQuery);
		} catch (err) {
			return Promise.reject(err);
		}

		let keys = Object.keys(inputQuery);

		// TODO: can we have 2 WHERE clauses
		let bodyTracker = 0;
		let optionTracker = 0;
		keys.forEach((key,index) => {
			if (key === "WHERE") {
				bodyTracker += 1;
			} else if (key === "OPTIONS") {
				optionTracker += 1;
			}
		});
		if (bodyTracker === 0) {
			return Promise.reject("Missing WHERE");
		};
		if(optionTracker === 0) {
			return Promise.reject("Missing OPTION");
		};
		if (bodyTracker > 1 || optionTracker > 1) {
			return Promise.reject("Invalid Query");
		};

		// TODO: use recursion to parse the query
		let allKeys = queryParser(inputQuery);
		console.log("######PRINTING QUERY TO JSON#####");
		console.log(inputQuery);
		console.log(allKeys);
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
