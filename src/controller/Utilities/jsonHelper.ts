const isJSON = (query: any): query is Record<string, unknown> => {
	return query !== null && query !== undefined && typeof query === "object" && !Array.isArray(query);
};

export {isJSON};
