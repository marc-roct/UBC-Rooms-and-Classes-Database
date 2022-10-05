const queryParser = (query: any): string[] => {
	// console.log("!!!!!!! PRITING THE FIRST LINE IN PARSER: ");
	// console.log(typeof query);
	let keys: string[] = [];
	for(let item in query) {
		if (item === "0") {
			console.log("******* DEBUGGING ********");
			console.log(query);
			console.log(typeof query);
		}
		keys.push(item);
		if(typeof query[item] === "object") {
			keys = keys.concat(queryParser(query[item]));
		} else {
			return keys;
		}
	};
	return keys;
};

export {queryParser};
