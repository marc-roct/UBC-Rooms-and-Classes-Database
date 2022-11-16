import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "./IInsightFacade";
import * as fs from "fs-extra";
import {parseContentSections} from "./Utilities/addDatasetHelpers/addDatasetSectionsHelpers";
import {parseContentRooms} from "./Utilities/addDatasetHelpers/addDatasetRoomsHelpers";
import {idValidator, persistDir, storeDatabase} from "./Utilities/commonIFHelpers";
import {isJSON, queryValidator} from "./Utilities/queryValidator";
import {getDataset, optionFilter, whereParser} from "./Utilities/queryParser";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export interface Dataset {
	[key: string]: string | number;
}

export interface DatasetSections extends Dataset{
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

export interface DatasetRooms extends Dataset{
	fullname: string;
	shortname: string;
	number: string;
	name: string;
	address: string;
	lat: number;
	lon: number;
	seats: number;
	type: string;
	furniture: string;
	href: string;
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

		let newDatabase: Database;
		let datasets: Dataset[];
		if (kind === InsightDatasetKind.Sections) {
			datasets = await parseContentSections(content);
		} else {
			datasets = await parseContentRooms(content);
		}
		newDatabase = {id: id, data: datasets, kind: kind};
		this.databases.push(newDatabase);
		let idList: string[] = [];
		for (const database of this.databases) {
			idList.push(database.id);
		}

		await storeDatabase(newDatabase);
		return Promise.resolve(idList);
	}

	public removeDataset(id: string): Promise<string> {
		try {
			idValidator(id);
		} catch (err) {
			return Promise.reject(err);
		}

		let inStorage: boolean = false;
		let inClass: boolean = false;
		if (fs.pathExistsSync(persistDir + "/" + id + ".zip")) {
			fs.removeSync(persistDir + "/" + id + ".zip");
			inStorage = true;
		}
		for (const [index, database] of this.databases.entries()) {
			if (database.id === id) {
				inClass = true;
				this.databases.splice(index, 1);
				break;
			}
		}
		if (!inClass && !inStorage) {
			return Promise.reject(new NotFoundError(" was not found in internal model"));
		}

		return Promise.resolve(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let currentDatabaseId: string;
		let inputQuery: Record<string, any>;
		if (isJSON(query)) {
			inputQuery = query;
		} else {
			return Promise.reject(new InsightError("The data type of input query is either null or undefined."));
		}
		try {
			// the id will be used in the query parser
			currentDatabaseId = queryValidator(inputQuery);
		} catch(err){
			// console.log(err);
			return Promise.reject(err);
		}

		let filteredResult: InsightResult[];
		try{
			let dataset = getDataset(this.databases, currentDatabaseId);
			let result = whereParser(query["WHERE"], dataset);
			if(result.length > 5000) {
				return Promise.reject(new ResultTooLargeError("The result is too big. " +
					"Only queries with a maximum of 5000 results are supported."));
			} else {
				filteredResult = optionFilter(query["OPTIONS"],result);
			}
		} catch(err){
			return Promise.reject(err);
		}
		return Promise.resolve(filteredResult);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		let datasetList: InsightDataset[] = [];
		for(let database of this.databases) {
			let numberOfRows = database.data.length;
			let insightDataset = {
				id: database.id,
				kind: database.kind,
				numRows: numberOfRows
			};
			datasetList.push(insightDataset);
		}

		return Promise.resolve(datasetList);
	}
}
