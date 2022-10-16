import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";

import {whereValidator, isJSON, queryValidator, optionValidator} from "./Utilities/queryValidator";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private readonly databases: any;
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
		// TODO: STUB
		// console.log(this.dataSet);
		let currentDatabaseId: string;
		let inputQuery: Record<string, any>;
		if (isJSON(query)) {
			inputQuery = query;
		} else {
			return Promise.reject("The data type of input query is either null or undefined.");
		};
		try {
			// the id will be used in the query parser
			currentDatabaseId = queryValidator(query);
		} catch(err){
			console.log(err);
			return Promise.reject(err);
		}
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
