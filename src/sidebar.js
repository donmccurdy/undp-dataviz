(function (exports) {

	var INDICATORS = {
		NONE: 'Default',
		POPULATION_2011: 'Population',
		GROSS_NATIONAL_INCOME_2013: 'Gross National Income',
		MEAN_YEARS_SCHOOLING_2013: 'Mean Years Schooling',
		LIFE_EXPECTANCY_2013: 'Life Expectancy'
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
			this.indicators = [];
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

		loadIndicators: function (indicators) {
			this.indicators = indicators;
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
			var mesh, iso, value, height, max;

			// Find max value
			max = _.max(this.indicators[property]);

			for (var i = 0; i < this.countries.length; i++) {
				mesh = this.countries[i];
				if (property === 'NONE') {
					// Reset height
					mesh.scale.set(1, 1, 1);
					mesh.position.setZ(0);
				} else {
					// Compute relative height
					iso = mesh.metadata.iso_a3;
					value = this.indicators[property][iso];
					height = Math.max(MAX_HEIGHT *  value / max, MIN_HEIGHT);

					// Scale
					mesh.scale.set(1, 1, height);
					mesh.position.setZ(height - 1);
				}
			}
		}
	});

	exports.Sidebar = Sidebar;

}(window));
