import {InsightError} from "../IInsightFacade";
import {Database} from "../InsightFacade";
import JSZip from "jszip";
import * as fs from "fs-extra";
const persistDir = "./data";

const idValidator = function(id: string) {
	if (id.includes("_")) {
		throw new InsightError("Invalid id: id contains underscore");
	}

	let whitespaceRegex = new RegExp("^ *$");
	if (whitespaceRegex.test(id)) {
		throw new InsightError("Invalid id: id contains only whitespace");
	}


};

const storeDatabase = async function (database: Database) {
	let zip = new JSZip();
	let content = JSON.stringify(database);
	// console.log(database);
	// console.log(content);
	zip.file(database.id, content);
	let zipped: string = await zip.generateAsync({type: "base64"});
	// console.log(zipped);
	fs.outputFileSync(persistDir + "/" + database.id + ".zip", zipped, "base64");
};

export {idValidator, storeDatabase, persistDir};
