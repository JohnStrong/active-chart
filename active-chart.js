/**
 *	ACTIVE-CHART => simple, responsive d3 charts
 *
 **/
;( function(d3) {

	'use strict';

	var _error = {
		'invalidId': 'first function parameter much be a valid element id',
		'invalidOrient': 'orient property much be set to either veritical or horizontal'
	},

	_defaults = {
		'height': 1000,
		'scale': 1,
		'innerPadding': 0,
		'outerPadding': 0,
		'orient': 'vertical'
	},

	_util = {

		is: function(entity, type) {
			var clas = Object.prototype.toString.call(entity).slice(8, -1);
			return (clas === type);
		},

		parentWidth: function() {
			return d3.select(this.parentNode).style('width');
		},
	
		setPadding: function(width, dataLen) {
			
			var datumLen = (width/dataLen);

			return {
				'inner': function(inner) {
					return  datumLen * inner;
				},

				'outer': function(outer) {
					return datumLen * outer;
				}
			};
		}
	},

	_chart = function(node, dimensions) {
		
		var chart = {};

		// store dimensions in scope
		chart.width = dimensions[0];
		chart.height = dimensions[1];

		// initial chart entity
		chart.entity = node.append('svg')
			.attr('width', chart.width)
			.attr('height', chart.height);

		// sets the chart scales
		chart.axis = function(padding) {
				
			var padding = padding[0]/this.width || 0,
				outerPadding = padding[1]/this.width || 0;

			// set chart scales
			this.xScale = d3.scale.ordinal()
				.rangeRoundBands([0, this.width], padding, outerPadding);

			this.yScale = d3.scale.linear().range([this.height]);

			return this;
		};

		return chart;
	};

	// Active Chart api
	function ActiveChart(id) {
		try {
			this.node = d3.select(id);
		}
		catch (e) {
			throw new Error(_error.invalidId);
		}
	}

	// set the chart domain from data given (object, [xdomain, ydomain])
	ActiveChart.prototype.data = function(data, domain) {
		
		this.domain = {
			'x': data.map(function(d) { return d[domain[0]]; }),
			'y': data.map(function(d) { return d[domain[1]]; })
		};

		return this;
	};

	// width scale (1 -> 100%, .5 -> 50%)
	ActiveChart.prototype.scale = function(widthScale) {
		this.scale = _util.is(widthScale, 'Number')? widthScale : _defaults.scale;

		return this;
	};

	ActiveChart.prototype.height = function(height) {
		this.height = _util.is(height, 'Number')? height : _defaults.height;

		return this;
	};

	// inner & outer chart padding [inner, outer]
	ActiveChart.prototype.padding = function(padding) {

		var paddingInner = padding[0]? padding[0] : _defaults.innerPadding,
		paddingOuter = padding[1]? padding[1] : _defaults.outerPadding;

		this.padding = [paddingInner, paddingOuter];

		return this;
	};

	// veritical or horizontal
	ActiveChart.prototype.orient = function(orient) {

		var isOrientString = _util.is(orient, 'String');

		if(isOrientString) {
			if(orient === 'vertical' || orient === 'horizontal') {
				this.orient = orient;
			} else {
				this.orient = _defaults.orient;
			}
		} else {
			throw new Error(_error.invalidOrient);
		}

		return this;
	};

	// draw the chart
	// will need to verifiy all properties are set??
	ActiveChart.prototype.draw = function() {
		
		console.log(this.height,
			this.scale, 
			this.node, 
			this.padding, 
			this.domain, 
			this.orient
		);

		// temporary width constant for testing purposes
		var rW = 1000,
		
		padding = _util.setPadding(rW, this.domain.length),
		iPadding = padding.inner(this.padding[0]),
		oPadding = padding.outer(this.padding[1]);

		// draw the chart to the dom node
		_chart(this.node, [rW, this.height]).axis([iPadding, oPadding]);
	};

	// removes the need for user to use 'new'	
	var activeChart = function(id) {
		return new ActiveChart(id);
	};

	// outward facing api namespace(s)
	window.activeChart = window.AC = activeChart;

} )(d3);