/**
 *	ACTIVE-CHART => simple, responsive d3 charts
 *
 **/
;( function(d3) {
	

	var _util = {

		is: function(entity, type) {
			Object.prototype.toString.call(entity).slice(8, -1);
			return (entity === type);
		}
	},

	_activeChart = ( function() {
			
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

				var dataLength = this.data.length,
				// rWidth = d3.select(node).call(_parentWidth),

				padding = _setPadding(1278, dataLength),
				rInner = padding.inner(this.innerPadding),
				rOuter = padding.outer(this.outerPadding);

				// set orient [vertical, horizontal]
			};

	} )(),
	
	activeChart = ( function() {
		
		var _error = {
			'invalidId': 'first function parameter much be a valid element id'
		},

		_consts = {
			'width': 1,
			'innerPadding': 0.5,
			'outerPadding': 0,
			'orientation': 'vertical'
		};

		/**
		 *	usage:
		 *	
		 *	id -> html id node preceded by a '#' in general d3 fashion
		 *	
		 *	props ->
		 *		width [0 - 1] => (0% - 100%) ,
		 *		innerPadding [0 - 1],
		 *		outerPadding [0 - 1],
		 *		orientation ['vertical', 'horizontal']
		 *
		 **/
		return function(id, data, props) {
			
			var svgNode,
				config = {};

			try {
				svgNode = d3.select(id).append('svg');
			}
			catch (e) {
				throw new Error(_error.invalidId);
			}

			// set chart configuration details

			config.width = props.width? props.width : _consts.width;

			config.innerPadding = props.innerPadding? props.innerPadding : _consts.innerPadding;
			config.outerPadding = props.outerPadding? props.outerPadding : _consts.outerPadding;

			config.orientation = props.orientation? props.orientation : _consts.orientation;

			config.data = data;

			_activeChart.call(config, svgNode[0]);
		};

	} )();

	window.activeChart = activeChart;

} )(d3);