import {Dataset} from "../InsightFacade";
import JSZip from "jszip";
import {InsightError} from "../IInsightFacade";

const parseContentRooms = async function(content: string): Promise<Dataset[]> {
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

	return Promise.resolve([]);
};

async function contentValidator(zip: JSZip) {
	console.log(zip);
	return [];
}

export {parseContentRooms};
