(function () {

	var INDICATORS = {
		none: 'Default',
		pop_est: 'Population',
		gdp: 'GDP',
		mean_income: 'Mean Income'
	};

	function Sidebar (/* ... */) {
		this.init.apply(this, arguments);
	}

	_.merge(Sidebar.prototype, {
		init: function (el) {
			this.view = {
				el: el,
				indicators: el.querySelector('.indicators')
			};
			this.tpl = {
				sidebar: _.template(document.querySelector('#tpl-sidebar').text)
			};
			this.render();
			this.bindEvents();
		},

		render: function () {
			this.view.indicators.innerHTML = this.tpl.sidebar({
				indicators: INDICATORS
			});
		},

		bindEvents: function () {
			var radios = this.view.indicators.querySelectorAll('input'),
				onChange = _.bind(this.onChange, this);
			for (var i = 0; i < radios.length; i++) {
				radios[i].addEventListener('change', onChange);
			}
		},

		onChange: function (e) {
			console.log(e.target);
		}
	});

	return new Sidebar(document.querySelector('#sidebar'));

}());
