
define(['when'], function(when){
	var Model = function(name, data) {
		this.name = name;
		this.data = data || {};
		this.deferreds = [];
	};
	Model.prototype.set = function(data) {
		this['newData'] = this['newData'] || {};
		for (var attr in data) {
			this['newData'][attr] = data[attr];
		}
		var defer = when.defer();
		this.deferreds.push(defer);
		return defer.promise;
	};

	Model.prototype.save = function(data) {
		this['newData'] = this['newData'] || {};
		for (var attr in this['newData']) {
			this.data[attr] = this['newData'][attr];
		}
		this['newData'] = null;
		delete this['newData'];

		var dfd;
		while(dfd = this.deferreds.pop()) {
			dfd.resolve(this.data);
		}
	};

	Model.prototype.get = function(attr) {
		return this.data[attr];
	}
	return Model;
});
