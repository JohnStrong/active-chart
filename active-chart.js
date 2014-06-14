/**
 *	ACTIVE-CHART => simple, responsive d3 charts
 *
 **/
;( function(d3) {

	'use strict';

	String.prototype.toInt = function() {
		return parseInt(this, 10);
	};

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
		yScale = d3.scale.linear().range([height, 0]);

		// domain keys for chartable data
		// chartable data
		return function(domain, data) {
			
			var xDomain = xScale.domain(data.map(function(d) { return d[domain.x]; })),
				yDomain = yScale.domain(data.map(function(d) { return d[domain.y]; }));

			entity.selectAll('.bar')
				.data(data)
				.enter()
				.append('rect')
				.attr('x', function(d) { return xScale(d[domain.x]); })
				.attr('width', xScale.rangeBand())
				.attr('y', function(d) { return yScale(d[domain.y]); })
				.attr('height', function(d) { return height - yScale(d[domain.y]); });
		};
	};

	// Active Chart api
	function ActiveChart(id) {
		try {
			this.node = d3.select(id);
			this.width = this.node.style('width').toInt()
		}
		catch (e) {
			throw new Error(_error.invalidId);
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
		
		console.log(
			this.height,
			this.width,
			this.scale, 
			this.node, 
			this.padding,
			this.data, 
			this.domain, 
			this.orient
		);

		var self = this,

		padding = _util.setPadding(this.width, this.domain.length),
		innerPadding = padding.inner(this.padding[0]),
		outerPadding = padding.outer(this.padding[1]),

		skeleton = {
			'node': self.node,
			'dimensions': [self.width, self.height],
			'padding': [innerPadding, outerPadding]
		};

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