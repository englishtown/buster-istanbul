
define(['scripts/src/app', 'scripts/src/model'], function(App, Model) {
	var assert = buster.assert;
	buster.testCase("App", {
		"init with settings": function() {
			var app = App.init({name: "Example"});
			assert.equals(app.getSettings("name"), "Example");
		}
	});

	buster.testCase("Model", function(run) {
		run({"model deferreds": function() {
			var user = new Model('User');
			user.set({login: "user1"}).then(function(data){
				assert.equals(data['login'], 'user1');
			});
			user.save();
			assert.equals(user.get('login'), 'user1');
		}});
	});
});