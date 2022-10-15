import JSZip, {JSZipObject} from "jszip";
import {InsightError} from "../IInsightFacade";

// eslint-disable-next-line max-lines-per-function
const contentValidator =  async function(zip: JSZip): Promise<JSON[]> {
	// filters zip for files in root 'courses/'
	let coursesInFolderCourses: JSZipObject[];
	coursesInFolderCourses = zip.filter(function (relativePath, file) {
		const regex = new RegExp("courses/w*");
		return (regex.test(relativePath));
	});
	if (coursesInFolderCourses.length === 0) {
		throw new InsightError("Invalid Dataset: No files in courses/ or no courses directory");
	}

	let listPromises: Array<Promise<string>> = [];
	for (const file of coursesInFolderCourses) {
		listPromises.push(file.async("string"));
	}

	let listContentAsString: string[] = await Promise.all(listPromises);

	let listFileContentAsJSON: JSON[] = [];
	for (const string of listContentAsString) {
		try {
			listFileContentAsJSON.push(JSON.parse(string));
		} catch (e) {
			console.log("wassssap");
		}
	}
	if (listFileContentAsJSON.length === 0) {
		throw new InsightError("Invalid Dataset: Files are not JSON");
	}

	const fileKeys: string[] = ["Subject", "Course", "Avg", "Professor",
		"Title", "Pass", "Fail", "Audit", "id", "Year"];

	let listValidCourses: JSON[] = [];
	for (let fileJson of listFileContentAsJSON) {
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
				listValidCourses.push(fileJSON.result[j]);
			}
 		}
	}
	if (listValidCourses.length === 0) {
		throw new InsightError("Invalid Dataset: Files don't contain required keys");
	}

	return Promise.resolve(listValidCourses);
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

export {contentValidator, idValidator};
