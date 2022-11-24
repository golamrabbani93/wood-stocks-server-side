const express = require('express');
const cors = require('cors');
const {MongoClient, ServerApiVersion} = require('mongodb');
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
		const categories = client.db('sitpad').collection('category');
		const products = client.db('sitpad').collection('products');
		//*products category
		app.get('/categories', async (req, res) => {
			const query = {};
			const cursor = categories.find(query);
			const result = await cursor.toArray();
			res.send(result);
		});
		//*load category product
		app.get('/products/:category_id', async (req, res) => {
			const id = parseInt(req.params.category_id);
			const query = {category_id: id};
			const cursor = products.find(query);
			const result = await cursor.toArray();
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
