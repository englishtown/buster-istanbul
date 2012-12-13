define(['scripts/src/model'], function(Model){
	var App = {
		init: function(settings) {
			this.settings = new Model("settings");
			this.settings.set(settings);
			this.settings.save();
			return this;
		},
		getSettings: function(attr) {
			return this.settings.get(attr);
		}
	};

	return App;
});