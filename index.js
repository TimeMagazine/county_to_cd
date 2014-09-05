var fs = require("fs"),
	d3 = require("d3");

//http://www.census.gov/geo/maps-data/data/cd_national.html

fs.readFile("./natl_cocd_delim.txt", "utf8", function(err, body) {
	// burn first line and convert to object
	var data = d3.csv.parse(body.split("\n").slice(1).join("\n"));

	// group by county
	var by_county = d3.nest().key(function(d) { return d.State + d.County; }).entries(data),
		by_district = {};


	// let's get some quick stats while we organize by district
	var stats = {};
	by_county.forEach(function(d) {
		stats[d.values.length] = stats[d.values.length] || [];
		stats[d.values.length].push(d.key);

		d.values.forEach(function(district) {
			var district_id = district.State + district["Congressional District"];
			by_district[district_id] = by_district[district_id] || [];
			by_district[district_id].push([d.key, d.values.length]);
		})
	});

	d3.entries(stats).forEach(function(stat) {
		console.log(stat.value.length + (stat.value.length === 1 ? " county is" : " counties are") + " in " + stat.key + (stat.key === 1 ? " district" : " districts"));
		// print fips codes for exceptionally split-up counties
		if (stat.key > 5) {
			console.log("(" + stat.value.join(",") + ")");
		}
	});

	var perfect = 0;

	by_district = d3.entries(by_district);
	by_district.forEach(function(district) {
		district.avg = d3.sum(district.value, function(d) { return d[1]; }) / district.value.length;
		if (district.avg == 1) {
			perfect += 1;
			console.log("Perfect match for " + district.key);
		}
	});

	console.log(perfect + " districts match county boundaries");


	fs.writeFile("./by_county.json", JSON.stringify(by_county, null, 2));
	fs.writeFile("./by_district.json", JSON.stringify(by_district, null, 2));

});