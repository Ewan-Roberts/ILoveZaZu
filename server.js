
const express 	= require('express'),
app         	= express(),
bodyParser  	= require('body-parser'),
morgan      	= require('morgan'),
mongoose    	= require('mongoose'),
request    		= require('request'),
jwt    			= require('jsonwebtoken'),
config 			= require('./config'),
User   			= require('./app/models/user');
port 			= process.env.PORT || 8080;

const importantFunction = () =>  console.log('ba' + +'a'+'a')

mongoose.connect(config.database);

app.set('secret', config.secret);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/createGeneric', (req, res) =>{

	let createAdmin = new User({ 
		name: 'Adam Farah', 
		password: 'pip',
		admin: true 
	});

	createAdmin.save()

	createAdmin.save(err => {
		
		if (err) throw err;
		
		console.log('User saved');
		
		res.json({ success: true });

	});

});

app.get('/', (req, res)=>{res.send('Point your (hopefully Chrome) browser to: http://localhost:' + port + '/api ')});

const apiRoutes = express.Router(); 

apiRoutes.post('/auth', (req, res) =>{

	User.findOne({name: req.body.name}, (err, user) =>{

		if (err) throw err;

		if (!user) {res.status(401).send({success: false,message: 'This user not found.' });
		
		} else if (user) {

			if (user.password != req.body.password) {
				
				res.status(401).send({ success: false, message: 'Wrong password.' })

			} else {

				let payload = {
					admin: user.admin	
				}

				let token = jwt.sign(payload, app.get('secret'), {
					expiresIn: 86400 // expires in 24 hours
				});

				res.json({
					success: true,
					message: 'Here is your token : '+token,
					token: token
				});
			}		

		}

	});
});

apiRoutes.use((req, res, next) =>{

	const token = req.body.token || req.param('token') || req.headers['x-access-token'];

	if (token) {

		jwt.verify(token, app.get('secret'), (err, decoded) =>{			
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });		
			} else {
				req.decoded = decoded;	
				next();
			}
		});

	} else {

		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
		
	}
	
});

apiRoutes.get('/', (req, res) =>{res.json({ message: 'This is the root of the API' })});

apiRoutes.post('/location-search', (req, res) =>{
	
	request('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+req.body.long+','+req.body.lat+'&radius=500&type='+req.body.type+'&key='+config.apiKey, (error, response, body) =>{
		
		let parsed = JSON.parse(body)
		let result = [];

		for (var i = 0; i < parsed.results.length; i++) {
			
			result.push({

				name: parsed.results[i].name,
				location: parsed.results[i].vicinity

			})

		}

		res.json(result)

	});

});

apiRoutes.get('/check', (req, res) =>{res.json(req.decoded)});

app.use('/api', apiRoutes);

app.listen(port);
