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
		process.env[key] = configEnv[key];

	});

}

// if (env === 'development') {

//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/User-Profile-Data';

// } else if (env === 'test') {

//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = `mongodb://localhost:27017/User-Profile-Test`;

// }
