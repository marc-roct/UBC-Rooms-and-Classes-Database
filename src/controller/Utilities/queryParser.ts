const whereParser = (data: Record<string, any>): string[] => {
	let dataCollector: string[] = [];
	if(typeof data === "object" && !Array.isArray(data)) {
		// if the input data is an object: push the key to the dataCollector
		// and call queryParser to check the values inside the object
		for(let key in data) {
			dataCollector.push(key);
			dataCollector = dataCollector.concat(whereParser(data[key]));
		}
	} else if (Array.isArray(data)) {
		// if the input data is an array: loop through each item and call queryParser()
		for(let index in data) {
			dataCollector = dataCollector.concat(whereParser(data[index]));
		}
	} else {
		// base case: push the data to the dataCollector when it's neither an object or an array
		dataCollector.push(data);
		return dataCollector;
	}
	return dataCollector;
};

export {whereParser};
