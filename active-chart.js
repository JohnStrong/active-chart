/**
 *	ACTIVE-CHART => simple, responsive d3 charts
 *
 **/
;( function(d3) {

	'use strict';

	// String to Int parsing method
	String.prototype.toInt = function() {
		return parseInt(this, 10);
	};


	var _consts = {
		
		error: {
		'invalidId': 'first function parameter much be a valid element id',
		'invalidOrient': 'orient property much be set to either veritical or horizontal'
		},

		defaults: {
			'height': 1000,
			'scale': 1,
			'innerPadding': 0,
			'outerPadding': 0,
			'orient': 'vertical'
		}

		// will add custom color range for d3 chart later
	},

	_util = {

		is: function(entity, type) {
			var clas = Object.prototype.toString.call(entity).slice(8, -1);
			return (clas === type);
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

	_chart = function(skeleton) {

		var node = skeleton.node,
		dimensions = skeleton.dimensions,
		padding = skeleton.padding,

		// real dimensions
		width = dimensions[0],
		height = dimensions[1],

		// initial chart entity
		entity = node.append('svg')
			.attr('width', width)
			.attr('height', height),


		padding = padding[0]/width || 0,
		outerPadding = padding[1]/width || 0,

		// set chart scales
		xScale = d3.scale.ordinal()
			.rangeRoundBands([0, width], padding, outerPadding),
		yScale = d3.scale.linear().range([height, 0]),

		colorScale = d3.scale.category20();

		// domain keys for chartable data
		// chartable data
		return function(domain, data) {
			
			// set domain from which to apply x/y scales
			var xDomain = xScale.domain(data.map(function(d) { return d[domain.x]; })),
			yDomain = yScale.domain(data.map(function(d) { return d[domain.y]; }));

			// TODO: generate axis

			// TODO: generate the chart .... really basic right now
			entity.selectAll('.bar')
				.data(data)
				.enter()
				.append('rect')
				.attr('x', function(d) { return xScale(d[domain.x]); })
				.attr('width', xScale.rangeBand())
				.attr('y', function(d) { return yScale(d[domain.y]); })
				.attr('height', function(d) { return height - yScale(d[domain.y]); })
				.style('fill', function(d, i) { return colorScale(i); });
		};
	};

	// Active Chart api
	function ActiveChart(id) {
		try {
			this.node = d3.select(id);
			this.width = this.node.style('width').toInt()
		}
		catch (e) {
			throw new Error(_consts.error.invalidId);
		}
	}

	// set the chart domain from data given (object, [xdomain, ydomain])
	ActiveChart.prototype.data = function(data, domain) {
		
		this.data = data;

		this.domain = {
			'x': domain[0],
			'y': domain[1]
		};

		return this;
	};

	// width scale (1 -> 100%, .5 -> 50%)
	ActiveChart.prototype.scale = function(widthScale) {
		this.scale = _util.is(widthScale, 'Number')? widthScale : _consts.defaults.scale;

		return this;
	};

	ActiveChart.prototype.height = function(height) {
		this.height = _util.is(height, 'Number')? height : _consts.defaults.height;

		return this;
	};

	// inner & outer chart padding [inner, outer]
	ActiveChart.prototype.padding = function(padding) {

		var paddingInner = padding[0]? padding[0] : _consts.defaults.innerPadding,
		paddingOuter = padding[1]? padding[1] : _consts.defaults.outerPadding;

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
			throw new Error(_consts.error.invalidOrient);
		}

		return this;
	};


	// should take a color range array
	ActiveChart.prototype.color = function(colRange) {
		this.colRange = _util.is(colRange, 'Array')? colRange : undefined;

		return this;
	}

	// draw the chart
	ActiveChart.prototype.draw = function() {
		
		var self = this,

		// apply user defined scale to current container width
		realWidth = this.width*this.scale,

		padding = _util.setPadding(realWidth, this.data.length),
		innerPadding = padding.inner(this.padding[0]),
		outerPadding = padding.outer(this.padding[1]),

		skeleton = {
			'node': self.node,
			'dimensions': [realWidth, self.height],
			'padding': [innerPadding, outerPadding],
			'colRange': self.colRange
		};
		
		console.log(skeleton);

		// draw the chart to the dom node
		_chart(skeleton)(this.domain, this.data);
	};

	// removes the need for user to use 'new'	
	var activeChart = function(id) {
		return new ActiveChart(id);
	};

	// outward facing api namespace(s)
	window.activeChart = window.AC = activeChart;

} )(d3);