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


	// hold all constant data for the project
	// includes api defaults; error messages; encapsulated properties (perhaps)
	const _consts = {
		
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

		// MAY add default custom color range for d3 chart later (unknown data length??)
	},


	// general helper functions
	_util = {

		'is': function(entity, type) {
			return Object.prototype.toString.call(entity).slice(8, -1) === type;
		},

		'filter': function(obj, pred) {
			
			var res = [];

			for(var ith in obj) {
				if(pred(ith)) {
					res.push(obj[ith]);
				}
			}

			return res;
		},

		'with': function(dependencies) {

			return (fn, deps) => {
				
				var filtered = this.filter(dependencies, function(dep) {
					return deps.indexOf(dep) > -1;
				});

				return fn.apply(null, filtered);
			}
		}
	},

	_setPadding = function(width, dataLen) {
			
		var datumLen = (width/dataLen);

		return {
			'inner': inner => {
				return  datumLen * inner;
			},

			'outer': outer => {
				return datumLen * outer;
			}
		};
	},

	// return d3.scale x/y for the charting function
	_scale = ( function() {

		var xScale = d3.scale.ordinal(),
		yScale = d3.scale.linear();

		// dimensions -> [width, height]
		// padding -> [inner, outer]
		return (dimensions, padding) => {

			var innerP = padding[0]/dimensions[0], 
			outerP = padding[1]/dimensions[1];

			return {
				'xScale': xScale.rangeRoundBands([0, dimensions[0]], innerP, outerP),
				'yScale': yScale.range([dimensions[1], 10])
			};
		};

	} )(),

	// take the chartable data
	// can compute domains for d3.scale(s) on the data
	_domain = function(data) {
		
		return (scale, domain) => {
			return scale.domain(data.map(function(d) { return d[domain]; }));
		};

	},

	// return d3 color scale with set color range
	_color = function(colRange) {
		return d3.scale.ordinal().range(colRange);
	},

	// takes a d3 html node element that can build svg element from
	_svg = function(from) {
		
		return {
			'create': dimensions => {

				return from.append('svg')
					.attr('width', dimensions[0])
					.attr('height', dimensions[1]);
			}
		};
	},

	// d3 chart generatating function
	// takes chart options, set by Active Chart api [node, dimensions, padding, colRang]
	_chart = function(scales, domains, colorScale, node) {

		// height scale for svg
		var height = node.attr('height'),

		// set chart scales
		xScale = scales.xScale,
		yScale = scales.yScale,

		// set domain from which to apply x/y scales
		xDomain = domains[0],
		yDomain = domains[1];

		return (domain, data) => {

			// TODO: generate axis

			// TODO: generate the chart .... really basic right now
			node.selectAll('.bar')
				.data(data)
				.enter()
				.append('rect')
				.attr('x', function(d) { return xScale(d[domain.x]); })
				.attr('width', xScale.rangeBand())
				.attr('y', function(d) { return yScale(d[domain.y]); })
				.attr('height', function(d) { return height - yScale(d[domain.y]); })
				.style('fill', function(d, i) { return colorScale(i); })
				/*
				.each(function() {
					console.log(this);
				})
				*/;
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
		this.colRange = _util.is(colRange, 'Array')? colRange : null;

		return this;
	}

	// draw the chart
	ActiveChart.prototype.draw = function() {
		
		// apply user defined scale to current container width
		var realWidth = this.width*this.scale,

		padding = _setPadding(realWidth, this.data.length),

		innerPadding = padding.inner(this.padding[0]),
		outerPadding = padding.outer(this.padding[1]),

		// array [ width, height]
		dimensions = [realWidth, this.height],
		paddingArr = [innerPadding, outerPadding],

		// apply vars to fn with filter
		applyWith = _util['with']({
			'dimensions': dimensions, 
			'padding': paddingArr
		}),
		
		// { xScale: d3.scale.ordinal, yScale: d3.scale.linear }
		scales = applyWith(_scale, ['dimensions', 'padding']),

		domain = _domain(this.data),

		// Array [ xScale: d3.domain, yScale, d3.domain ]
		domains = [
			domain(scales['xScale'], this.domain['x']), 
			domain(scales['yScale'], this.domain['y'])
		],

		// d3.scale.ordinal with color range OR default 20c
		color = this.colRange? _color(this.colRange) : d3.scale.category20c(),

		node = _svg(this.node),

		// d3 svg node with set width/height
		svgNode = applyWith(node.create, ['dimensions']);

		// draw the chart using computed properties side-effectfully (for now...)
		_chart(scales, domains, color, svgNode)(this.domain, this.data);
	};

	// removes the need for user to use 'new'	
	const activeChart = function(id) {
		return new ActiveChart(id);
	};

	// outward facing api namespace(s)
	window.activeChart = window.AC = activeChart;

} )(d3);