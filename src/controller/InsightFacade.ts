import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip, {JSZipObject} from "jszip";
import * as fs from "fs-extra";
import {contentValidator, convertCoursesToDatasets, idValidator, storeDatabase,
	persistDir} from "./Utilities/addDatasetHelpers";


import {whereValidator, isJSON, queryValidator, optionValidator} from "./Utilities/queryValidator";
import {optionFilter} from "./Utilities/queryParser";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export interface Dataset {
	dept: string;
	id: string;
	avg: number;
	instructor: string;
	title: string;
	pass: number;
	fail: number;
	audit: number;
	uuid: string;
	year: number;

}

export interface Database {
	id: string;
	data: Dataset[];
	kind: InsightDatasetKind;
}

export default class InsightFacade implements IInsightFacade {

	private databases: Database[] = [];

	constructor() {
		console.log("InsightFacadeImpl::init()");
	}


	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			idValidator(id);
		} catch (err) {
			return Promise.reject(err);
		}
		if (fs.pathExistsSync(persistDir + "/" + id + ".zip")) {
			return Promise.reject(new InsightError("Invalid id: id already stored on disk"));
		} else {
			for (const database of this.databases) {
				if (database.id === id) {
					return Promise.reject(new InsightError("Invalid id: id has already been added"));
				}
			}
		}

		let zip = new JSZip();
		await zip.loadAsync(content, {base64: true});

		let listCourses: any[];
		try {
			listCourses = await contentValidator(zip);
		} catch (err) {
			return Promise.reject(err);
		}

		let datasets: Dataset[] = convertCoursesToDatasets(listCourses);
		let newDatabase: Database = {id: id, data: datasets, kind: kind};
		this.databases.push(newDatabase);

		let idList: string[] = [];
		for (const database of this.databases) {
			idList.push(database.id);
		}

		await storeDatabase(newDatabase);
		return Promise.resolve(idList);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	// eslint-disable-next-line max-lines-per-function
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
			// console.log(err);
			return Promise.reject(err);
		}

		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
