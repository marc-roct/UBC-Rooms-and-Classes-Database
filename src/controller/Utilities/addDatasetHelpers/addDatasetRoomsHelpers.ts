import {Dataset, DatasetRooms} from "../../InsightFacade";
import JSZip from "jszip";
import {InsightError} from "../../IInsightFacade";
import {parse} from "parse5";
import {Document} from "parse5/dist/tree-adapters/default";
import http from "http";
import {constructDatasetRooms, parseIndex} from "./roomParsers";

export interface IndexBuildingData {
	shortname: string;
	fullname: string;
	address: string;
	fileLocation: string;
	lat: number;
	lon: number
}

export interface BuildingRoomData {
	number: string;
	seats: number;
	furniture: string;
	type: string;
	href: string;
}
const parseContentRooms = async function(content: string): Promise<Dataset[]> {
	let zip = new JSZip();
	try {
		await zip.loadAsync(content, {base64: true});
	} catch (err) {
		return Promise.reject(new InsightError("Invalid zip"));
	}

	let listRooms: DatasetRooms[];
	try {
		listRooms = await contentValidator(zip);
	} catch (err) {
		return Promise.reject(err);
	}

	return Promise.resolve(listRooms);
};

async function contentValidator(zip: JSZip): Promise<DatasetRooms[]> {
	let index: Document = await zipRoomsValidator(zip, "index.htm");
	let listIndexBuildings: IndexBuildingData[] = parseIndex(index);
	if (listIndexBuildings.length === 0) {
		throw new InsightError("No valid buildings in index.htm");
	}

	let listGeoLocPromises: Array<Promise<IndexBuildingData>> = [];
	for (let buildingData of listIndexBuildings) {
		listGeoLocPromises.push(getGeoLocation(buildingData));
	}
	listIndexBuildings = await Promise.all(listGeoLocPromises);

	// getGeoLocation returns the indexData with lon and lat as 0 when errors
	// filter those errored results
	listIndexBuildings.filter((building) => building.lat !== 0);
	if (listIndexBuildings.length === 0) {
		throw new InsightError("No valid building addresses in index.htm");
	}

	let listPromises: Array<Promise<DatasetRooms[]>> = [];
	for (let buildingData of listIndexBuildings) {
		listPromises.push(constructDatasetRooms(zip, buildingData));
	}
	let roomsListList: DatasetRooms[][] = await Promise.all(listPromises);

	let datasetRooms: DatasetRooms[] = [];
	for (let roomsList of roomsListList) {
		datasetRooms = datasetRooms.concat(roomsList);
	}
	if (!datasetRooms.length) {
		throw new InsightError("No valid rooms");
	}
	return Promise.resolve(datasetRooms);
}

async function zipRoomsValidator(zip: JSZip, fileName: string): Promise<Document> {
	let indexAsString: string, indexZip = zip.file(fileName);
	if (indexZip === null) {
		throw new InsightError("Invalid Dataset: Missing " + fileName + " file");
	} else {
		indexAsString = await indexZip.async("string");
	}

	let indexAsDocument: Document = parse(indexAsString, {sourceCodeLocationInfo: false});
	return Promise.resolve(indexAsDocument);
}

function getGeoLocation(indexData: IndexBuildingData): Promise<IndexBuildingData> {
	let address: string = indexData.address.replace(/\s/g, "%20");
	return new Promise((resolve) => {
		http.get("http://cs310.students.cs.ubc.ca:11316/api/v1/project_team170/" + address,
			(result) => {
				result.setEncoding("utf8");
				let rawData = "";
				result.on("data", (chunk) => {
					rawData += chunk;
				});
				result.on("end", () => {
					try {
						const parsedData = JSON.parse(rawData);
						if (!Object.keys(parsedData).includes("error")) {
							resolve({
								shortname: indexData.shortname,
								fullname: indexData.fullname,
								address: indexData.address,
								fileLocation: indexData.fileLocation,
								lat: parsedData?.lat,
								lon: parsedData?.lon
							});
						} else {
							resolve(indexData);
						}
					} catch (e) {
						console.error(e);
					}
				});
			});
	});
}

export {parseContentRooms, zipRoomsValidator};
