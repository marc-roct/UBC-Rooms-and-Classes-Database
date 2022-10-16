import JSZip, {JSZipObject} from "jszip";
import {InsightError} from "../IInsightFacade";
import {Dataset} from "../InsightFacade";

const fileKeys: string[] = ["Subject", "Course", "Avg", "Professor",
	"Title", "Pass", "Fail", "Audit", "id", "Year"];

const contentValidator =  async function(zip: JSZip): Promise<JSON[]> {
	// filters zip for files in root 'courses/'
	let coursesInFolderCourses: JSZipObject[];
	coursesInFolderCourses = zipFilterValidator(zip);
	if (coursesInFolderCourses.length === 0) {
		throw new InsightError("Invalid Dataset: No files in courses/ or no courses directory");
	}

	let listPromises: Array<Promise<string>> = [];
	for (const file of coursesInFolderCourses) {
		listPromises.push(file.async("string"));
	}
	let listContentAsString: string[] = await Promise.all(listPromises);

	// filters and parse all valid strings into JSON
	let listFileContentAsJSON: JSON[] = stringToJsonParse(listContentAsString);
	if (listFileContentAsJSON.length === 0) {
		throw new InsightError("Invalid Dataset: Files are not JSON");
	}

	let listValidCourses: JSON[] = validJSONObjectFilter(listFileContentAsJSON);
	if (listValidCourses.length === 0) {
		throw new InsightError("Invalid Dataset: Files don't contain required keys");
	}

	return Promise.resolve(listValidCourses);
};

function zipFilterValidator(zip: JSZip) {
	let filteredObjects: JSZipObject[] = zip.filter(function (relativePath, file) {
		const regex = new RegExp("courses/w*");
		return (regex.test(relativePath));
	});
	return filteredObjects;
}

function stringToJsonParse(listString: string[]) {
	let listJSON: JSON[] = [];
	for (const string of listString) {
		try {
			listJSON.push(JSON.parse(string));
		} catch (e) {
			// if parse throws errors skip string
		}
	}
	return listJSON;
}

function validJSONObjectFilter(listToFilterJSON: any[]) {
	let filteredJSON: JSON[] = [];

	for (let fileJson of listToFilterJSON) {
		// Convert fileJson to type any to be able to call fileJSON.result
		let fileJSON: any = fileJson;
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let j = 0; j < fileJSON.result.length; j++) {
			let containsAll: boolean = true;
			for (const key of fileKeys) {
				if (!Object.keys(fileJSON.result[j]).includes(key)) {
					containsAll = false;
					break;
				}
			}

			if (containsAll) {
				filteredJSON.push(fileJSON.result[j]);
			}
		}
	}
	return filteredJSON;
}

const convertCoursesToDatasets = function(listCourses: any[]) {
	let listDataset: Dataset[] = [];
	for (const course of listCourses) {
		let newDataset: Dataset = {
			dept : course.Subject, id : course.Course, avg : course.Avg,
			instructor : course.Professor, title : course.Title,
			pass : course.Pass, fail : course.Fail,
			audit : course.Audit,
			uuid : course.id,
			year : course.Year,
		};
		listDataset.push(newDataset);
	}
	return listDataset;
};

const idValidator = function(id: string) {
	if (id.includes("_")) {
		throw new InsightError("Invalid id: id contains underscore");
	}

	let whitespaceRegex = new RegExp("^ *$");
	if (whitespaceRegex.test(id)) {
		throw new InsightError("Invalid id: id contains only whitespace");
	}


};

export {contentValidator, idValidator, convertCoursesToDatasets};
