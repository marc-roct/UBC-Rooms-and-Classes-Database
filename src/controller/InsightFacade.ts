import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError
} from "./IInsightFacade";
import JSZip, {JSZipObject} from "jszip";
import {contentValidator, idValidator} from "./Utilities/contentValidator";


/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

interface Dataset {
	sections_dept: string;
	sections_id: string;
	sections_avg: number;
	sections_instructor: string;
	sections_title: string;
	sections_pass: number;
	sections_fail: number;
	sections_audit: number;
	sections_uuid: string;
	sections_year: number;

}

interface Database {
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

		let datasets: Dataset[] = [];
		for (const course of listCourses) {
			let newDataset: Dataset = {
				sections_dept : course.Subject, sections_id : course.Course, sections_avg : course.Avg,
				sections_instructor : course.Professor, sections_title : course.Title,
				sections_pass : course.Pass, sections_fail : course.Fail,
				sections_audit : course.Audit,
				sections_uuid : course.id,
				sections_year : course.Year,
			};
			datasets.push(newDataset);
		}


		this.databases.push({
			id: id,
			data: datasets,
			kind: kind
		});

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
		return Promise.reject("Not implemented.");
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("Not implemented.");
	}
}
