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
	zip.file(database.id, content);
	let zipped: string = await zip.generateAsync({type: "base64"});
	// console.log(zipped);
	fs.outputFileSync(persistDir + "/" + database.id + ".zip", zipped, "base64");
};

const readData = async function (databaseLength: number): Promise<Database[]> {
	let storedCount: number = 0;
	if (fs.pathExistsSync(persistDir)) {
		fs.readdirSync(persistDir).forEach((file) => {
			storedCount++;
		});

		if (storedCount === databaseLength) {
			return [];
		}
	} else {
		return [];
	}

	return await getStoreDatabases();;
};

async function getStoreDatabases(): Promise<Database[]> {
	let zip = new JSZip();
	let readDatabasePromises: Array<Promise<JSZip>> = [];
	fs.readdirSync(persistDir).forEach((file) => {
		let fileData: string = fs.readFileSync(persistDir + "/" + file, {encoding: "base64"});
		readDatabasePromises.push(zip.loadAsync(fileData, {base64: true}));
	});

	await Promise.all(readDatabasePromises);
	let storedDatabasesPromise: Array<Promise<string>> = [];
	zip.forEach((path, file) => {
		storedDatabasesPromise.push(file.async("string"));
	});

	let stringDatabases: string[] = await Promise.all(storedDatabasesPromise);
	let storedDatabases: Database[] = [];
	for (let databaseString of stringDatabases) {
		storedDatabases.push(JSON.parse(databaseString));
	}
	return Promise.resolve(storedDatabases);
}

export {idValidator, storeDatabase, readData, persistDir};
