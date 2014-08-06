PreLoader = (function (window, document)
{	
	// ==================================================================================================================
    // Helper Functions
    // ==================================================================================================================

	// =========================================================
	// Extend Objects || Deep Copy

	var extend = function (source)
	{	
		var objs = Array.prototype.slice.call(arguments, 1);

		for (var obj = 0; obj < objs.length; obj++)
		{
			for (var prop in objs[obj])
			{	
				if (objs[obj].hasOwnProperty(prop))
				{	
					if (typeof objs[obj][prop] === 'object' && objs[obj][prop] !== null)
					{
						source[prop] = (Object.prototype.toString.call(objs[obj][prop]) === '[object Array]') ? [] : {};

						extend(source[prop], objs[obj][prop]);
					}
					else
					{
						source[prop] = objs[obj][prop];	
					}
				}
			}
		}

		return source;
	};

	// =========================================================
	// Param Is A Function?

	var isFunction = function (fn)
	{
		return (typeof fn === 'function')
	};

	// =========================================================
	// Turn Param To Array

	var toArray = function (a)
	{	
		var res = [];

		for (var i = 0, l = a.length; i < l; i++)
		{
			res.push(a[i]);
		}

		return res;
	};

	// ==================================================================================================================
    // PreLoader Constructor
    // ==================================================================================================================

	var PreLoader = function (images, params)
	{	
		if (!(this instanceof PreLoader))
		{
			return new PreLoader(images, params);
		}

		this.images  = this._createImageArray(images);
		this.options = extend({}, this._defaultOptions, params);

		this.counter      = 0;
		this.imagesLength = this.images.length;

		this.loadedImages  = [];
		this.errorImages   = [];

		this._init();
	};

	// ==================================================================================================================
    // Methods/Properties
    // ==================================================================================================================

	// =========================================================
	// Default Options

	PreLoader.prototype._defaultOptions =
	{	
		/* Callbacks */
		complete  : function () {},
		loaded    : function () {},
		error     : function () {},
		start     : function () {},

		/* Options */
		type      : 'parallel'
	};

	// =========================================================
	// Initialise

	PreLoader.prototype._init = function ()
	{
		if (this.images.length > 0)
		{	
			this.options.start.call(this, this.images);

			if (this.options.type === 'parallel')
			{
				this._preLoadParallel();
			}
			else if (this.options.type === 'sequence')
			{	
				this.sequenceImages = this.images.slice();

				this._preLoadSequence();
			}
		}
		else
		{
			this.options.complete.call(this, this.images, this.loadedImages, this.errorImages);
		}
	};

	// =========================================================
	// Create Image Array

	PreLoader.prototype._createImageArray = function (images)
	{
		var res;

		switch(typeof images)
		{

		case 'object':

			if (images instanceof Array)
			{
				this.isUrls = true;
				res         = images;
			}
			else
			{
				res = toArray(images);
			}

			break;

		case 'string':

			res = toArray(document.querySelectorAll(images));
			break;

		default :
			throw new Error('Unexpected type of images passed');
		}

		return res;
	};

	// =========================================================
	// Check If Loading Is Complete 

	PreLoader.prototype._isComplete = function ()
	{
		return this.counter === this.imagesLength;
	};

	// =========================================================
	// Return Progress

	PreLoader.prototype._checkProgress = function ()
	{
		return Math.round(((this.counter) / this.imagesLength) * 100);
	};

	// =========================================================
	// Image Load Events

	PreLoader.prototype._preLoadEvent = function (action, image)
	{
		this.counter++;

		this[action + 'Images'].push(image);

		this.options[action].call(this, image, this._checkProgress());

		if (this._isComplete())
		{
			this.options.complete.call(this, this.images, this.loadedImages, this.errorImages);

			return false;
		}

		this.options.type === 'sequence' && this._preLoadSequence();
	};

	// =========================================================
	// Load Single Image

	PreLoader.prototype._preLoadImage = function (img)
	{	
		var self  = this,
			image = new Image();

		image.onload = function ()
		{
			self._preLoadEvent('loaded', img);
		}

		image.onerror = function ()
		{
			self._preLoadEvent('error', img)				
		}

		image.src = (this.isUrls) ? img : img.getAttribute('data-preloader');
	};

	// =========================================================
	// Preload Images Parallel

	PreLoader.prototype._preLoadParallel = function ()
	{
		for (var i = 0; i < this.imagesLength; i++)
		{	
			this._preLoadImage(this.images[i]);
		}
	};

	// =========================================================
	// Preload Images Sequence

	PreLoader.prototype._preLoadSequence = function ()
	{	
		this.sequenceImages.length && this._preLoadImage(this.sequenceImages.shift());
	}

	// =========================================================
	// Return Constructor

	return PreLoader;

})(window, document);	