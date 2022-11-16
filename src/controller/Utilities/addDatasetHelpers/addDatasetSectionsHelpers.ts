import JSZip, {JSZipObject} from "jszip";
import {InsightError} from "../../IInsightFacade";
import {Database, Dataset, DatasetSections} from "../../InsightFacade";
import * as fs from "fs-extra";

const fileKeys: string[] = ["Subject", "Course", "Avg", "Professor",
	"Title", "Pass", "Fail", "Audit", "id", "Year"];

const parseContentSections = async function(content: string): Promise<DatasetSections[]> {
	let zip = new JSZip();
	try {
		await zip.loadAsync(content, {base64: true});
	} catch (err) {
		return Promise.reject(new InsightError("Invalid zip"));
	}

	let listCourses: any[];
	try {
		listCourses = await contentValidator(zip);
	} catch (err) {
		return Promise.reject(err);
	}

	return Promise.resolve(convertCoursesToDatasets(listCourses));
};
async function contentValidator(zip: JSZip): Promise<JSON[]> {
	// filters zip for files in root 'courses/'
	let coursesInFolderCourses: JSZipObject[];
	coursesInFolderCourses = zipFilterValidator(zip);

	// file.async loads information from file asynchronously
	let listPromises: Array<Promise<string>> = [];
	for (const file of coursesInFolderCourses) {
		listPromises.push(file.async("string"));
	}
	let listContentAsString: string[] = await Promise.all(listPromises);

	// filters and parse all valid strings into JSON
	let listFileContentAsJSON: JSON[] = stringToJsonParse(listContentAsString);

	let listValidCourses: JSON[] = validJSONObjectFilter(listFileContentAsJSON);

	return Promise.resolve(listValidCourses);
};

function zipFilterValidator(zip: JSZip) {
	let filteredObjects: JSZipObject[] = zip.filter(function (relativePath, file) {
		const regex = new RegExp("courses/w*");
		return (regex.test(relativePath));
	});

	if (filteredObjects.length === 0) {
		throw new InsightError("Invalid Dataset: No files in courses/ or no courses directory");
	}
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

	if (listJSON.length === 0) {
		throw new InsightError("Invalid Dataset: Files are not JSON");
	}
	return listJSON;
}

function validJSONObjectFilter(listToFilterJSON: any[]) {
	let filteredJSON: JSON[] = [];

	for (let fileJson of listToFilterJSON) {
		// Convert fileJson to type any to be able to call fileJSON.result
		let fileJSON: any = fileJson;
		for (let fileKey of  Object.keys(fileJSON.result)) {
			let containsAll: boolean = true;
			for (const key of fileKeys) {
				if (!Object.keys(fileJSON.result[fileKey]).includes(key)) {
					containsAll = false;
					break;
				}
			}

			if (containsAll) {
				filteredJSON.push(fileJSON.result[fileKey]);
			}
		}
	}
	if (filteredJSON.length === 0) {
		throw new InsightError("Invalid Dataset: Files don't contain required keys");
	}
	return filteredJSON;
}

function convertCoursesToDatasets(listCourses: any[]) {
	let listDataset: DatasetSections[] = [];
	for (const course of listCourses) {
		let newDataset: DatasetSections = {
			dept : course.Subject,
			id : course.Course,
			avg : course.Avg,
			instructor : course.Professor,
			title : course.Title,
			pass : course.Pass,
			fail : course.Fail,
			audit : course.Audit,
			uuid : String(course.id),
			year : (function (courseSection: string) {
				if (courseSection === "overall") {
					return 1900;
				}  else {
					return Number(course.Year);
				}
			})(course.Section),
		};
		listDataset.push(newDataset);
	}
	return listDataset;
};

export {contentValidator, convertCoursesToDatasets, parseContentSections};
