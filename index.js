const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

const port = process.env.PORT || 5092;

app.use(cors());
app.use(bodyParser.json());

// console.log(process.env.DB_USER,process.env.DB_PASS)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stltu.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('connection error', err)
    const productCollection = client.db("pro-repair").collection("services");
    const orderCollection = client.db("pro-repair").collection("ordered-services");
    const reviewCollection = client.db("pro-repair").collection("user-review");
    const adminsCollection = client.db("pro-repair").collection("admins");

    app.get('/products', (req, res) => {
        productCollection.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    });

    app.get('/product/:id', (req, res) => {
        console.log('from req.params', req.params.id)
        productCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, items) => {
                res.send(items[0]);
                console.log(err);
            })
    });


    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log('adding new product', newProduct);
        productCollection.insertOne(newProduct)
            .then(result => {
                console.log('inserted count', result.insertedCount);
                res.send(result.insertedCount > 0)
            })
    })

    app.delete('/deleteProduct/:id', (req, res) => {
        console.log('from deleteProduct backend', req.params.id)
        productCollection.deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.send({ deleteCount: result.deletedCount });
            })
    });


    // order-products
    app.post('/addOrderedProduct', (req, res) => {
        const newProduct = req.body;
        console.log('adding new product', newProduct);
        orderCollection.insertOne(newProduct)
            .then(result => {
                console.log('inserted count', result);
                res.send(result.insertedCount > 0)
            })
    });


    app.get('/orderedProducts', (req, res) => {
        // console.log(req.query.email);
        orderCollection.find({ email: req.query.email })
            .toArray((err, items) => {
                res.send(items);
            })
    });


    // all user order list (admin page)
    app.get('/allUserOrderedProducts', (req, res) => {
        // console.log(req.query.email);
        orderCollection.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    });


    // verify-admin
    app.post('/isAdmin', (req, res) => {
        // console.log(req.query.email);
        adminsCollection.find({ email: req.body.email })
            .toArray((err, admins) => {
                console.log('find result by email',admins);
                res.send(admins.length > 0);
            })
    });




    // make-admin
    app.post('/addAdmins', (req, res) => {
        const newAdminEmail = req.body;
        console.log('adding review', newAdminEmail);
        adminsCollection.insertOne(newAdminEmail)
            .then(result => {
                console.log('inserted count', result);
                res.send(result.insertedCount > 0)
            })
    });


    // add-review
    app.post('/writeReview', (req, res) => {
        const review = req.body;
        console.log('adding review', review);
        reviewCollection.insertOne(review)
            .then(result => {
                console.log('inserted count', result);
                res.send(result.insertedCount > 0)
            })
    });

    // review api path
    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, items) => {
                res.send(items);
            })
    });


    // update order status
    app.patch('/update/:id', (req, res) => {
        orderCollection.updateOne({ _id: ObjectId(req.params.id) },
        {
            $set: {orderStatus: req.body.updatedOrderStatus}
        })
            .then(result=>{
                // console.log(result);
            })

    });




    //   client.close();
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})