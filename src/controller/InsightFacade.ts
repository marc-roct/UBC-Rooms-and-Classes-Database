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
import {checkFieldsAgainstDatasetKind, queryValidator} from "./Utilities/queryHelpers/queryValidators/queryValidator";
import {whereParser, getDatabase} from "./Utilities/queryHelpers/queryParser";
import {optionFilter} from "./Utilities/queryHelpers/transformationHelpers/filterHelpers";
import {isJSON} from "./Utilities/jsonHelper";
import {transformationFilter} from "./Utilities/queryHelpers/transformationHelpers/transformationHelper";
import {parseContentSections} from "./Utilities/addDatasetHelpers/addDatasetSectionsHelpers";
import {parseContentRooms} from "./Utilities/addDatasetHelpers/addDatasetRoomsHelpers";
import {idValidator, persistDir, readData, storeDatabase} from "./Utilities/commonIFHelpers";

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
		this.databases = this.databases.concat(await readData(this.databases.length));
		try {
			idValidator(id);
		} catch (err) {
			return Promise.reject(err);
		}
		for (const database of this.databases) {
			if (database.id === id) {
				return Promise.reject(new InsightError("Invalid id: " + id + " has already been added"));
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

	public async removeDataset(id: string): Promise<string> {
		this.databases = this.databases.concat(await readData(this.databases.length));
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
			return Promise.reject(new NotFoundError(id + " was not found in internal model"));
		}

		return Promise.resolve(id);
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		this.databases = this.databases.concat(await readData(this.databases.length));
		let transformationTracker = 0;
		let currentDatabaseId: string;
		let inputQuery: Record<string, any>;
		let allFieldsInQuery: string[];
		if (isJSON(query)) {
			inputQuery = query;
		} else {
			return Promise.reject(new InsightError("The data type of input query is either null or undefined."));
		}
		try {
			// the id will be used in the query parser
			[currentDatabaseId, transformationTracker, allFieldsInQuery] = queryValidator(inputQuery);
		} catch(err){
			return Promise.reject(err);
		}

		// TODO: added transformation filter; to be tested
		let filteredResult: InsightResult[];
		try{
			let database = getDatabase(this.databases, currentDatabaseId);
			checkFieldsAgainstDatasetKind(allFieldsInQuery, database["kind"]);
			let result = whereParser(query["WHERE"], database["data"]);
			// TODO: updated to check if transformation exists
			if(transformationTracker > 0) {
				let transformedResult = transformationFilter(query["TRANSFORMATIONS"], result);
				filteredResult = optionFilter(query["OPTIONS"],transformedResult);
			} else {
				filteredResult = optionFilter(query["OPTIONS"],result);
			};
			// console.log(filteredResult);
			// console.log(result);
			if(filteredResult.length > 5000) {
				return Promise.reject(new ResultTooLargeError("The result is too big. " +
					"Only queries with a maximum of 5000 results are supported."));
			};
		} catch(err){
			return Promise.reject(err);
		}
		return Promise.resolve(filteredResult);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		this.databases = this.databases.concat(await readData(this.databases.length));
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
