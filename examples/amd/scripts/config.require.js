require.config({
	baseUrl: (buster.env.contextPath || ""),
	packages: [{
		"name": "when",
		"location": "scripts/lib/when",
		"main": "when"
	}]
});