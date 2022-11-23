const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('SitPad server is runing');
});

app.listen(port, () => {
	console.log(`SitPad server is running on ${port}`);
});
