import JSZip from "jszip";
import {DatasetRooms} from "../../InsightFacade";
import {Document, Element, Node} from "parse5/dist/tree-adapters/default";
import {InsightError} from "../../IInsightFacade";
import {BuildingRoomData, IndexBuildingData, zipRoomsValidator} from "./addDatasetRoomsHelpers";

function queryNode(node: Node, query: string): any[] {
	let nodeList: any[] = [];
	if (node.nodeName === query) {
		nodeList.push(node);
	}
	if (Object.keys(node).includes("childNodes")) {
		let castedNode: any = node;
		for (let tempNode of castedNode.childNodes) {
			nodeList = nodeList.concat(queryNode(tempNode, query));
		}
	}
	return nodeList;
}

async function constructDatasetRooms(zip: JSZip, building: IndexBuildingData): Promise<DatasetRooms[]> {
	let buildingRoomsData: BuildingRoomData[] = await parseBuilding(zip, building);
	let datasetRoomList: DatasetRooms[] = [];
	for (let roomsData of buildingRoomsData) {
		datasetRoomList.push({
			fullname: building.fullname,
			shortname: building.shortname,
			number: roomsData.number,
			name: building.shortname + "_" + roomsData.number,
			address: building.address,
			lat: building.lat,
			lon: building.lon,
			seats: roomsData.seats,
			type: roomsData.type,
			furniture: roomsData.furniture,
			href: roomsData.href
		});
	}
	return Promise.resolve(datasetRoomList);
}

async function parseBuilding(zip: JSZip, building: IndexBuildingData): Promise<BuildingRoomData[]> {
	let buildingFile: Document;
	try {
		buildingFile = await zipRoomsValidator(zip, building.fileLocation.substring(2));
	} catch (e) {
		return [];
	}

	let roomTables = queryNode(buildingFile, "table");
	if (!roomTables.length) {
		return [];
	}

	let listRoomData: BuildingRoomData[] = [];
	for (let table of roomTables) {
		let tbody: Element = queryNode(table, "tbody")[0];
		let trList: Element[] = queryNode(tbody, "tr");

		for (let tr of trList) {
			try {
				let tdList: Element[] = queryNode(tr, "td");
				listRoomData.push({
					number: findNumber(tdList).trim(),
					seats: findSeats(tdList),
					furniture: findFurniture(tdList).trim(),
					type: findType(tdList).trim(),
					href: findHref(tdList).trim()
				});
			} catch (e) {
				// skip building
			}
		}
	}

	return Promise.resolve(listRoomData);
}

function parseIndex(index: Document): IndexBuildingData[] {
	let indexTables: Element[] = (queryNode(index, "table"));

	let listIndexBuildings: IndexBuildingData[] = [];
	for (let table of indexTables) {
		let tbody: Element = queryNode(table, "tbody")[0];
		let trList: Element[] = queryNode(tbody, "tr");

		for (let tr of trList) {
			try {
				let tdList: Element[] = queryNode(tr, "td");

				listIndexBuildings.push({
					shortname: findShortname(tdList).trim(),
					fullname: findFullname(tdList).trim(),
					address: findAddress(tdList).trim(),
					fileLocation: findFileLocation(tdList),
					lat: 0,
					lon: 0
				});
			} catch (e) {
				// skip building
			}
		}
	}
	return listIndexBuildings;
}

function findShortname(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-field-building-code") {
				let shortnameElement: any = queryNode(td, "#text")[0];
				return shortnameElement.value;
			}
		}
	}
	throw new InsightError("Missing shortname");
}

function findFullname(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-title") {
				let aElement: any = queryNode(td, "a")[0];
				let titleElement: any = queryNode(aElement, "#text")[0];
				return titleElement.value;
			}
		}
	}
	throw new InsightError("Missing fullname");
}

function findAddress(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-field-building-address") {
				let addressElement: any = queryNode(td, "#text")[0];
				return addressElement.value;
			}
		}
	}
	throw new InsightError("Missing address");
}

function findFileLocation(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-title") {
				let aElement: any = queryNode(td, "a")[0];
				for (let aAttribute of aElement.attrs) {
					if (aAttribute.name === "href") {
						return aAttribute.value;
					}
				}
			}
		}
	}
	throw new InsightError("Missing fileLocation");
}

function findNumber(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-field-room-number") {
				let aElement: any = queryNode(td, "a")[0];
				let numberElement: any = queryNode(aElement, "#text")[0];
				return numberElement.value;
			}
		}
	}
	throw new InsightError("Missing Number");
}

function findSeats(tdList: Element[]): number {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-field-room-capacity") {
				let seatsElement: any = queryNode(td, "#text")[0];
				let notDigitRegex: RegExp = new RegExp("\\D");
				if (notDigitRegex.test(seatsElement.value.trim())) {
					return 0;
				}
				return Number(seatsElement.value.trim());
			}
		}
	}
	throw new InsightError("Missing seats");
}

function findFurniture(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-field-room-furniture") {
				let furnitureElement: any = queryNode(td, "#text")[0];
				return furnitureElement.value;
			}
		}
	}
	throw new InsightError("Missing type");
}

function findType(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-field-room-type") {
				let typeElement: any = queryNode(td, "#text")[0];
				return typeElement.value;
			}
		}
	}
	throw new InsightError("Missing type");
}

function findHref(tdList: Element[]): string {
	for (let td of tdList) {
		for (let attribute of td.attrs) {
			if (attribute.value === "views-field views-field-nothing") {
				let aElement: any = queryNode(td, "a")[0];
				for (let aAttribute of aElement.attrs) {
					if (aAttribute.name === "href") {
						return aAttribute.value;
					}
				}
			}
		}
	}
	throw new InsightError("Missing fileLocation");
}

export {zipRoomsValidator, parseIndex, constructDatasetRooms};
