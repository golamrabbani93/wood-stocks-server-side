const express = require('express');
const cors = require('cors');
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
async function run() {
	try {
		const categoriesCollection = client.db('sitpad').collection('category');
		const productsCollection = client.db('sitpad').collection('products');
		const allOrders = client.db('sitpad').collection('orders');
		const userCollection = client.db('sitpad').collection('user');
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
		//*update sold product
		app.put('/updateproduct/:id', async (req, res) => {
			const id = req.params.id;
			const status = req.body;
			console.log('🚀🚀: run -> status', status.productStatus);
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
		//*post sold products
		app.post('/orders', async (req, res) => {
			const soldProduct = req.body;
			const result = await allOrders.insertOne(soldProduct);
			res.send(result);
		});
		//*post user
		app.post('/user', async (req, res) => {
			const user = req.body;
			const result = await userCollection.insertOne(user);
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
