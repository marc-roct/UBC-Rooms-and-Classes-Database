import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip, {JSZipObject} from "jszip";
import {contentValidator, convertCoursesToDatasets, idValidator} from "./Utilities/addDatasetHelpers";
import {isJSON, queryValidator} from "./Utilities/queryValidator";
import {whereParser, getDataset} from "./Utilities/queryParser";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

export interface Dataset {
	[key: string]: string | number;
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

	private databases: Database[] = [
		{
			id: "sections",
			data: [
				{
					dept: "adhe",
					id: "327",
					avg: 85.64,
					instructor: "",
					title: "teach adult",
					pass: 22,
					fail: 0,
					audit: 0,
					uuid: "8672",
					year: 2008
				},
				{
					dept: "adhe",
					id: "327",
					avg: 97.15,
					instructor: "",
					title: "teach adult",
					pass: 13,
					fail: 0,
					audit: 0,
					uuid: "8673",
					year: 2008
				},
				{
					dept: "bcom",
					id: "327",
					avg: 95,
					instructor: "",
					title: "teach adult",
					pass: 22,
					fail: 0,
					audit: 0,
					uuid: "8672",
					year: 2008
				},
				{
					dept: "cpsc",
					id: "320",
					avg: 70,
					instructor: "",
					title: "teach adult",
					pass: 13,
					fail: 0,
					audit: 0,
					uuid: "8673",
					year: 2005
				}
			],
			kind: InsightDatasetKind.Sections
		}
	];

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		try {
			idValidator(id);
		} catch (err) {
			return Promise.reject(err);
		}
		for (const database of this.databases) {
			if (database.id === id) {
				return Promise.reject(new InsightError("Invalid id: id has already been added"));
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
		this.databases.push({id: id, data: datasets, kind: kind});

		let idList: string[] = [];
		for (const database of this.databases) {
			idList.push(database.id);
		}

		return Promise.resolve(idList);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.reject("Not implemented.");
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let currentDatabaseId: string;
		let inputQuery: Record<string, any>;
		if (isJSON(query)) {
			inputQuery = query;
		} else {
			return Promise.reject("The data type of input query is either null or undefined.");
		};
		try {
			// the id will be used in the query parser
			currentDatabaseId = queryValidator(inputQuery);
		} catch(err){
			console.log(err);
			return Promise.reject(err);
		}
		let dataset = getDataset(this.databases, currentDatabaseId);
		let result = whereParser(query["WHERE"], dataset);
		// console.log(result);
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
