import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import {expect, use} from "chai";
import chaiHttp from "chai-http";

describe("Server", function () {

	let facade: InsightFacade;
	let server: Server;

	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		server.start();
	});

	after(function () {
		// TODO: stop server here once!
		server.stop();
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what's going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what's going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", function () {
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	*/

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});

// it("PUT test for courses dataset", function () {
// 	try {
// 		return chai.request(SERVER_URL)
// 			.put(ENDPOINT_URL)
// 			.send(ZIP_FILE_DATA)
// 			.set("Content-Type", "application/x-zip-compressed")
// 			.then(function (res: ChaiHttp.Response) {
// 				// some logging here please!
// 				expect(res.status).to.be.equal(200);
// 			})
// 			.catch(function (err) {
// 				// some logging here please!
// 				expect.fail();
// 			});
// 	} catch (err) {
// 		// and some more logging here!
// 	}
// });
