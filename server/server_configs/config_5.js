console.log('It is for separate database tests for the application');

const env = process.env.NODE_ENV || 'development';

console.log('process.env.*****:', env);

if (env === 'development' || env === 'test') {

	const config = require('./config_5.json');
	console.log('config: ', config);

	// selects one env of "config.json"
	const configEnv = config[env];
	console.log('configEnv: ', configEnv);

	//!!!! It is great. It just calls "key names" in an array format.
	
	// Finds the keys in the selected env of config.json file.
	console.log('Object.keys: ', Object.keys(configEnv));

	Object.keys(configEnv).forEach((key) => {

		console.log('key: ', key);

		// console.log("process.env: ", process.env);
		// Assigns values of "configEnv" to the value of "process.env.xxx"

		// It assigns two roles: 1) creates a new properites with value 2) assined value to the existing properties
		process.env[key] = configEnv[key];

	});

}