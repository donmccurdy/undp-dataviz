(function () {

	var sidebar = document.querySelector('#sidebar'),
		indicators_wrap = sidebar.querySelector('.indicators');

	var indicators = [
		'Population',
		'GDP',
		'Mean Income'
	];

	// TODO bring in lodash for some quick templates
	indicators_wrap.innerHTML = indicators.map(function (title) {
		return (''
			+ '<li>'
			+	'<label>'
			+		'<input type="radio" name="indicators">'
			+		title
			+	'</label>'
			+ '</li>'
		);
	}).join('');

}());
