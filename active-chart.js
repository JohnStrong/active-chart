/**
 *	ACTIVE-CHART => simple, responsive d3 charts
 *
 **/
;( function(d3) {

	'use strict';
	
	var _activeChart = ( function() {

			var _parentWidth = function() {
				return d3.select(this.parentNode).style('width');
			},
	
			_setPadding = function(width, dataLen) {
				
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

			// this -> config with properties
			// set width; padding; orient, return result
			return function(node) {

				// test obj
				console.log(this.scale, this.node, this.padding, this.points, this.orient);

				// set props for chart...
			};

	} )(),
	
	activeChart = ( function() {
		
		var base = {};

		base._error = {
			'invalidId': 'first function parameter much be a valid element id',
			'invalidOrient': 'orient property much be set to either veritical or horizontal'
		};

		base._consts = {
			'width': 1,
			'innerPadding': 0.5,
			'outerPadding': 0,
			'orient': 'vertical'
		};

		base._util = {

			is: function(entity, type) {
				var clas = Object.prototype.toString.call(entity).slice(8, -1);
				return (clas === type);
			}
		}

		var self = base;

		// node id
		self['node'] = function(id) {
			try {
				this.node = d3.select(id);
			}
			catch (e) {
				throw new Error(this._error.invalidId);
			}

			return this;
		};

		// data to chart
		self['data'] = function(data) {
			this.points = data;

			return this;
		};

		// width scale (1 -> 100%, .5 -> 50%)
		self['scale'] = function(widthScale) {
			this.scale = widthScale;

			return this;
		};

		// inner & outer chart padding
		self['padding'] = function(padding) {

			this.padding = {};

			this.padding.inner = padding[0]? padding[0] : this._consts.innerPadding,
			this.padding.outer = padding[1]? padding[1] : this._consts.outerPadding;

			return this;
		};

		// veritical or horizontal
		self['orient'] = function(orient) {

			var isOrientString = this._util.is(orient, 'String');

			if(isOrientString) {
				if(orient === 'vertical' || orient === 'horizontal') {
					this.orient = orient;
				} else {
					this.orient = this._consts.orient;
				}
			} else {
				throw new Error(this._error.invalidOrient);
			}

			return this;
		};

		// draw the chart
		self['draw'] = function() {
			_activeChart.call(this);
		};

		return self;

	} )();

	window.activeChart = activeChart;

} )(d3);