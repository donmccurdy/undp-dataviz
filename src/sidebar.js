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
				indicators: el.querySelector('.indicators'),
				detail: el.querySelector('.country-detail'),
				handle: el.querySelector('.sidebar-handle')
			};
			this.tpl = {
				sidebar: _.template(document.querySelector('#tpl-sidebar').text),
				detail: _.template(document.querySelector('#tpl-detail').text)
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
			this.renderDetail();
		},

		renderDetail: function (iso) {
			if (!iso) {
				this.view.detail.innerHTML = this.tpl.detail({
					name: '???',
					indicators: []
				});
				return;
			}
			var country = _(this.countries)
				.pluck('metadata')
				.where({iso_a3: iso})
				.first();

			var self = this;
			country.indicators = {};
			_.forEach(INDICATORS, function (label, key) {
				if (key !== 'NONE') {
					country.indicators[label] = self.indicators[key][iso];
				}
			});

			this.view.detail.innerHTML = this.tpl.detail(country);
		},

		loadCountries: function (countries) {
			this.countries = countries;
		},

		loadIndicators: function (indicators) {
			this.indicators = indicators;
		},

		bindEvents: function () {
			var self = this,
				radios = this.view.indicators.querySelectorAll('input'),
				onChange = _.bind(this.onChange, this);
			for (var i = 0; i < radios.length; i++) {
				radios[i].addEventListener('change', onChange);
			}
			this.view.handle.addEventListener('click', function () {
				var classList = self.view.el.classList;
				if (classList.contains('open')) {
					classList.remove('open');
				} else {
					classList.add('open');
				}
			});
			if (window.matchMedia('(max-width: 728px)')) {
				this.view.el.classList.remove('open');
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
