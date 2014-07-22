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
		complete  : null,
		loaded    : null,
		error     : null,
		start     : null
	};

	// =========================================================
	// Initialise

	PreLoader.prototype._init = function ()
	{
		if (this.images.length > 0)
		{	
			if (isFunction(this.options.start))
			{
				this.options.start.call(this, this.images);
			}

			this._preload();
		}
		else
		{
			if (isFunction(this.options.complete))
			{
				this.options.complete.call(this, this.images, this.loadedImages, this.errorImages);
			}
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

			res = images;
			break;

		case 'string':

			res = document.querySelectorAll(images);
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
		return Math.round(((this.counter + 1) / this.imagesLength) * 100);
	};

	// =========================================================
	// Image Load Events

	PreLoader.prototype._preLoadEvent = function (action, image)
	{
		this.counter++;

		this[action + 'Images'].push(image);

		if (isFunction(this.options[action]))
		{
			this.options[action].call(this, image, this._checkProgress());
		}

		if (this._isComplete())
		{
			if (isFunction(this.options.complete))
			{
				this.options.complete.call(this, this.images, this.loadedImages, this.errorImages);
			}
		}
	};

	// =========================================================
	// Preload Images

	PreLoader.prototype._preload = function ()
	{	
		var	self = this;

		for (var i = 0; i < this.imagesLength; i++)
		{	
			(function (img)
			{
				var image = new Image();

				image.onload = function ()
				{
					self._preLoadEvent('loaded', img);
				}

				image.onerror = function ()
				{
					self._preLoadEvent('error', img)				
				}

				image.src = img.getAttribute('data-preloader');

			})(this.images[i]);
		}
	};

	return PreLoader;

})(window, document);	