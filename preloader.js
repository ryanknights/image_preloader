PreLoader = (function (window, document)
{	
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

	var isFunction = function (fn)
	{
		return (typeof fn === 'function')
	};

	var PreLoader = function (images, params)
	{	
		if (!(this instanceof PreLoader))
		{
			return new PreLoader(images, params);
		}

		this.images  = this._createImageArray(images);
		this.options = extend({}, this._defaultOptions, params);

		this._init();
	};

	PreLoader.prototype._defaultOptions =
	{
		complete  : null,
		eachImage : null,
		error     : null
	};

	PreLoader.prototype._init = function ()
	{
		if (this.images.length > 0)
		{
			this._preload();
		}
		else
		{
			if (isFunction(this.options.complete))
			{
				this.options.complete.call(this, this.images);
			}
		}
	};


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
	}

	PreLoader.prototype._preload = function ()
	{	
		var	self     = this,
			complete = 0;

		for (var i = 0, l = this.images.length; i < l; i++)
		{	
			(function (img)
			{
				var image = new Image();

				image.onload = function ()
				{	
					complete++;

					if (isFunction(self.options.eachImage))
					{
						self.options.eachImage.call(img, self.images);	
					}

					if (complete === l)
					{
						if (isFunction(self.options.complete))
						{
							self.options.complete.call(self, self.images)
						}
					}
				}

				image.onerror = function ()
				{
					complete++;

					if (isFunction(self.options.error))
					{
						self.options.error.call(img, self.images);
					}
				}

				image.src = img.getAttribute('data-preload');

			})(this.images[i]);
		}
	}

	return PreLoader;

})(window, document);	