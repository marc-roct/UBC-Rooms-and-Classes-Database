import {
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import * as fs from "fs-extra";

import {folderTest} from "@ubccpsc310/folder-test";
import {assert, AssertionError, expect} from "chai";
import {clearDisk} from "../TestUtil";

describe("InsightFacade", function () {
	let insightFacade: InsightFacade;

	const persistDirectory = "./data";
	const datasetContents = new Map<string, string>();

	// Reference any datasets you've added to test/resources/archives here, and they will
	// automatically be loaded in the 'before' hook.
	const datasetsToLoad: {[key: string]: string} = {
		sections: "./test/resources/archives/pair.zip",
		rooms: "./test/resources/archives/rooms.zip",
		testRooms: "./test/resources/archives/testrooms.zip",
		noIndex: "./test/resources/archives/noIndex.zip",
		noRooms: "./test/resources/archives/noRooms.zip",
		invalidZIP: "./test/resources/archives/invalidZip.zip",
		geoLocation: "./test/resources/archives/geoLocation.zip",
		seats: "./test/resources/archives/testSeatsDefault.zip"
	};

	before(function () {
		// This section runs once and loads all datasets specified in the datasetsToLoad object
		for (const key of Object.keys(datasetsToLoad)) {
			const content = fs.readFileSync(datasetsToLoad[key]).toString("base64");
			datasetContents.set(key, content);
		}
		// Just in case there is anything hanging around from a previous run of the test suite
		fs.removeSync(persistDirectory);
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			insightFacade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			fs.removeSync(persistDirectory);
		});

		// This is a unit test. You should create more like this!
		it("Should add a valid section dataset", function () {
			const id: string = "sections";
			const content: string = datasetContents.get("sections") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Sections)
				.then((result: string[]) => expect(result).to.deep.equal(expected));
		});

		it("Should add a valid room dataset", function () {
			const id: string = "rooms1";
			const content: string = datasetContents.get("rooms") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result: string[]) => expect(result).to.deep.equal(expected));
		});

		it("Should add a valid room testdataset", function () {
			const id: string = "testRooms";
			const content: string = datasetContents.get("testRooms") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result: string[]) => expect(result).to.deep.equal(expected));
		});

		it("Should add a valid room seatsDataset", function () {
			const id: string = "seats";
			const content: string = datasetContents.get("seats") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result: string[]) => expect(result).to.deep.equal(expected));
		});

		it("Should throw an insight error for adding zip with a missing index", function () {
			const id: string = "noIndex";
			const content: string = datasetContents.get("noIndex") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result: string[]) => expect.fail("addDataset should've failed"))
				.catch((expectedError) => {
					expect(expectedError).to.be.an.instanceof(InsightError);
				});
		});

		it("Should throw an insight error for adding invalid zip", function () {
			const id: string = "invalidZip";
			const content: string = datasetContents.get("invalidZip") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result: string[]) => expect.fail("addDataset should've failed"))
				.catch((expectedError) => {
					expect(expectedError).to.be.an.instanceof(InsightError);
				});
		});

		it("Should throw an insight error for having no valid geoLocations", function () {
			const id: string = "geo";
			const content: string = datasetContents.get("geoLocation") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result: string[]) => expect.fail("addDataset should've failed"))
				.catch((expectedError) => {
					expect(expectedError).to.be.an.instanceof(InsightError);
				});
		});

		it("Should throw an error for not having any rooms", function () {
			const id: string = "noRooms";
			const content: string = datasetContents.get("noRooms") ?? "";
			const expected: string[] = [id];
			return insightFacade.addDataset(id, content, InsightDatasetKind.Rooms)
				.then((result: string[]) => expect.fail("addDataset should've failed, returned: " + result))
				.catch((expectedError) => {
					if (expectedError instanceof AssertionError) {
						throw expectedError;
					} else {
						expect(expectedError).to.be.an.instanceof(InsightError);
					}
				});
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);

			insightFacade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				insightFacade.addDataset(
					"rooms",
					datasetContents.get("rooms") ?? "",
					InsightDatasetKind.Rooms
				),
				insightFacade.addDataset(
					"sections",
					datasetContents.get("sections") ?? "",
					InsightDatasetKind.Sections
				),
			];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			fs.removeSync(persistDirectory);
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries/sections_queries",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.have.deep.members(expected);
					assert.equal(actual.length, expected.length);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);
		// test transformation orders
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => insightFacade.performQuery(input),
			"./test/resources/queries/rooms_and_transform_queries",
			{
				assertOnResult: (actual, expected) => {
					expect(actual).to.have.deep.equal(expected);
					assert.equal(actual.length, expected.length);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						expect(actual).to.be.instanceof(InsightError);
					}
				},
			}
		);
	});

	// List of Datasets
	describe("listDatasets", function (){

		let facade: InsightFacade;

		beforeEach(function (){
			// must do clearDisk first
			// it could when data is loaded right at facade is created
			// thus put clearDisk after creating facade might not work
			// clearing the disk can isolate the tests
			clearDisk();
			facade = new InsightFacade();
		});

		it("return no datasets", function () {
			// "return" is required to allow mocha to wait for the promise
			// otherwise, it executes the next test; recall async await
			// recall 210; [] and another [] are different objects
			return facade.listDatasets().then((insightDatasets) => {
				expect(insightDatasets).to.be.an.instanceof(Array);
				expect(insightDatasets).to.have.length(0);
			});
		});

		it("successfully return a list of datasets", function () {
			// 1. add a dataset
			// 2. list dataset
			return facade.addDataset("courses", datasetContents.get("sections") ?? "",
				InsightDatasetKind.Sections)
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.deep.equal([
						{
							id: "courses",
							kind: InsightDatasetKind.Sections,
							numRows: 64612,
						}
					]);
				});
		});

		it("successfully return multiple lists of datasets", function () {
			return facade.addDataset("courses", datasetContents.get("sections") ?? "",
				InsightDatasetKind.Sections)
				.then(() => {
					return facade.addDataset("courses-2", datasetContents.get("sections") ?? "",
						InsightDatasetKind.Sections);
				})
				.then(() => {
					return facade.listDatasets();
				})
				.then((insightDatasets) => {
					expect(insightDatasets).to.be.an.instanceof(Array);
					expect(insightDatasets).to.have.length(2);
					const insightDatasetCourses = insightDatasets.find((dataset) => dataset.id === "courses");
					expect(insightDatasetCourses).to.exist;
					expect(insightDatasetCourses).to.deep.equal({
						id: "courses",
						kind: InsightDatasetKind.Sections,
						numRows: 64612,
					});
				})
				.then(() => {
					return facade.addDataset("rooms-1", datasetContents.get("testRooms") ?? "",
						InsightDatasetKind.Rooms);
				});
		});
	});
});
