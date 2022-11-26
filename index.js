const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
require('dotenv').config();
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qh4qhby.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});
//*verify jwt web token
function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).send('unauthorized access');
	}
	const token = authHeader.split(' ')[1];
	jwt.verify(token, process.env.WEB_TOKEN, function (err, decoded) {
		if (err) {
			return res.status(403).send({message: 'forbidden access'});
		}
		req.decoded = decoded;
		next();
	});
}
async function run() {
	try {
		const categoriesCollection = client.db('sitpad').collection('category');
		const productsCollection = client.db('sitpad').collection('products');
		const allOrdersCollection = client.db('sitpad').collection('orders');
		const usersCollection = client.db('sitpad').collection('user');
		//*json web token
		app.get('/jwt', async (req, res) => {
			const email = req.query.email;
			const query = {email: email};
			const user = await usersCollection.findOne(query);
			if (user) {
				const token = jwt.sign({email}, process.env.WEB_TOKEN, {expiresIn: '1h'});
				return res.send({accessToken: token});
			}
			res.status(403).send({accessToken: ''});
		});
		//*products category
		app.get('/categories', async (req, res) => {
			const query = {};
			const cursor = categoriesCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});
		//*load category product
		app.get('/products/:category_id', async (req, res) => {
			const id = parseInt(req.params.category_id);
			const query = {category_id: id};
			const cursor = productsCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});
		//*get products by user name
		app.get('/products', async (req, res) => {
			const name = req.query.name;
			const query = {seller_name: name};
			const cursor = productsCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});
		//*post user
		app.post('/products', async (req, res) => {
			const productDetails = req.body;
			const result = await productsCollection.insertOne(productDetails);
			res.send(result);
		});
		//*update sold product
		app.put('/updateproduct/:id', async (req, res) => {
			const id = req.params.id;
			const status = req.body;
			const filter = {_id: ObjectId(id)};
			const option = {upsert: true};

			const updateProductStatus = {
				$set: {
					productStatus: status.productStatus,
				},
			};
			const result = await productsCollection.updateOne(filter, updateProductStatus, option);
			res.send(result);
		});

		//* get all orders by user email
		app.get('/orders', verifyJWT, async (req, res) => {
			const email = req.query.email;
			const decodedEmail = req.decoded.email;
			if (email !== decodedEmail) {
				return res.status(403).send({message: 'forbidden access'});
			}
			const query = {email: email};
			const cursor = allOrdersCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});
		//*post orders products
		app.post('/orders', async (req, res) => {
			const soldProduct = req.body;
			const result = await allOrdersCollection.insertOne(soldProduct);
			res.send(result);
		});
		//*Get all Users
		app.get('/users', async (req, res) => {
			const query = {};
			const cursor = usersCollection.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});
		//*post user
		app.post('/user', async (req, res) => {
			const user = req.body;
			const result = await usersCollection.insertOne(user);
			res.send(result);
		});
	} finally {
	}
}
run().catch((err) => console.log(err));
app.get('/', (req, res) => {
	res.send('SitPad server is runing');
});

app.listen(port, () => {
	console.log(`SitPad server is running on ${port}`);
});
