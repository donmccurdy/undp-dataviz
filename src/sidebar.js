(function (exports) {

	var INDICATORS = {
		none: 'Default',
		pop_est: 'Population',
		gdp: 'GDP',
		mean_income: 'Mean Income'
	};

	var MIN_HEIGHT = 1,
		MAX_HEIGHT = 100;

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
			this.countries = [];
			this.render();
			this.bindEvents();
		},

		render: function () {
			this.view.indicators.innerHTML = this.tpl.sidebar({
				indicators: INDICATORS
			});
		},

		loadCountries: function (countries) {
			this.countries = countries;
		},

		bindEvents: function () {
			var radios = this.view.indicators.querySelectorAll('input'),
				onChange = _.bind(this.onChange, this);
			for (var i = 0; i < radios.length; i++) {
				radios[i].addEventListener('change', onChange);
			}
		},

		onChange: function (e) {
			this.scaleBy(e.target.value);
		},

		scaleBy: function (property) {
			var max = _(this.countries)
				.pluck('metadata')
				.pluck(property)
				.max();

			for (var mesh, value, i = 0; i < this.countries.length; i++) {
				mesh = this.countries[i];
				value = Math.max(MAX_HEIGHT * mesh.metadata[property] / max, MIN_HEIGHT);
				if (property === 'none') {
					mesh.scale.set(1, 1, 1);
					mesh.position.setZ(0);
				} else {
					mesh.scale.set(1, 1, value);
					mesh.position.setZ(value - 1);
				}
			}
		}
	});

	exports.Sidebar = Sidebar;

}(window));
