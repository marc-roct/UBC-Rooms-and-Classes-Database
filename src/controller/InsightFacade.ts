import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import {queryParser, isJSON, ebnfValidator} from "./Utilities/queryParser";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly dataSet: any;
	constructor() {
		this.dataSet = [];
		console.log("InsightFacadeImpl::init()");
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return Promise.reject("Not implemented.");
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// TODO: STUB
		console.log(this.dataSet);

		let inputQuery: Record<string, any>;
		if (isJSON(query)) {
			inputQuery = query;
		} else {
			return Promise.reject("The data type of input query is either null or undefined.");
		};
		let queryData = queryParser(inputQuery);
		// TODO: factor out these validators; how to use a helper to return promises
		// console.log(queryData);
		let bodyTracker = 0;
		let optionTracker = 0;
		let columnTracker = 0;
		let orderTracker = 0;
		queryData.forEach((key,index) => {
			if (key === "WHERE") {
				bodyTracker += 1;
			} else if (key === "OPTIONS") {
				optionTracker += 1;
			} else if (key === "COLUMNS") {
				columnTracker += 1;
			} else if (key === "ORDER") {
				orderTracker += 1;
			} else {
				if(!ebnfValidator(key)) {
					return Promise.reject("Invalid Key: " + key);
				};
			};
		});
		if (bodyTracker === 0) {
			return Promise.reject("Missing WHERE");
		};
		if(optionTracker === 0) {
			return Promise.reject("Missing OPTION");
		};
		if(columnTracker === 0) {
			return Promise.reject("Missing COLUMNS");
		}
		if (bodyTracker > 1 || optionTracker > 1 || columnTracker > 1 || orderTracker > 3) {
			return Promise.reject("Invalid Query");
		};

		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
