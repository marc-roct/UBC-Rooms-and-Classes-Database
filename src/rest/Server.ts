import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import {readFileSync} from "node:fs";

import {
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import * as fs from "fs";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	// insightFacade object that helpers can access
	private insightFacade: InsightFacade = new InsightFacade();

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();

		this.express.set("insightFacade", this.insightFacade);

		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		this.express.use(express.static("./frontend/public"));

	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be placed before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);

		// TODO: your other endpoints should go here
		// TODO: change echo to the function that calls the backend
		// list
		this.express.get("/datasets", Server.listDataset);
		// add
		this.express.put("/dataset/:id/:kind", Server.addDataset);
		this.express.delete("/dataset/:id", Server.removeDataset);
		this.express.post("/query", Server.queryDataset);

	}

	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err: any) {
			res.status(400).json({error: err.message});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}

	/**
	 * helpers that communicate with the backend
	 */
	private static async listDataset(req: Request, res: Response) {
		try {
			let datasetList: InsightDataset[] = [];
			let insightFacade = req.app.get("insightFacade");
			// console.log("going to call list dataset");
			datasetList = await insightFacade.listDatasets();
			// console.log("in list dataset");
			res.status(200).json({result: datasetList});
		} catch (err: any) {
			if(err instanceof InsightError) {
				res.status(400).json({error: err.message});
			} else {
				res.status(400).json({error:err.message});
			}
		}
	}

	// TODO: check all the error messages are return correctly
	// TODO: check the local data to see if the dataset is already exists
	private  static async addDataset(req: Request, res: Response) {
		try {
			const id = req.params.id;
			const kind = req.params.kind;
			const inputFile = Buffer.from(req.body, "base64");
			// console.log(inputFile);
			// const content = fs.readFileSync(inputFile).toString("base64");
			// console.log(content);
			let insightFacade = req.app.get("insightFacade");
			let addedDataSet = await insightFacade.addDataset(id,inputFile,kind);
			// console.log(addedDataSet);
			res.status(200).json({result: addedDataSet});
		} catch (err: any) {
			if(err instanceof InsightError) {
				res.status(400).json({error: err.message});
			} else {
				res.status(400).json({error:err.message});
			}
		}
	}

	private static async removeDataset(req: Request, res: Response) {
		try {
			const id = req.params.id.toString();
			let insightFacade = req.app.get("insightFacade");
			let removedID = await insightFacade.removeDataset(id);
			res.status(200).json({result: removedID});
		} catch (err: any) {
			if(err instanceof NotFoundError) {
				res.status(404).json({error: err.message});
			} else {
				res.status(400).json({error:err.message});
			}
		}
	}

	private static async queryDataset(req: Request, res: Response) {
		try {
			let insightFacade = req.app.get("insightFacade");
			let query = req.body;
			// console.log(query);
			let queryResult = await insightFacade.performQuery(query);
			res.status(200).json({result: queryResult});
		} catch (err: any) {
			if(err instanceof InsightError) {
				res.status(400).json({error: err.message});
			} else {
				res.status(400).json({error:err.message});
			}
		}
	}
}
