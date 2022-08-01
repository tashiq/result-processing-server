const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const cors = require('cors')
app.use(cors());
app.use(express.json());
require('dotenv').config();
const port = process.env.PORT || 4000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.elbg4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const ObjectId = require('mongodb').ObjectId;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db('resultProcessing');
        const userCollection = database.collection('user');
        const markCollection = database.collection('marks');
        const notificationCollections = database.collection('notifications')
        app.post('/users', async (req, res) => {
            const doc = req.body;
            // const result = await userCollection.insertOne(doc);
            // console.log("result");
            // res.send(result.acknowledged);
            console.log(doc);
        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = {
                email: email
            }
            const result = await userCollection.findOne(query);
            // console.log(result);
            res.send(result);
        })
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const url = req.body.url;
            const query = {
                email: email
            }
            const options = { upsert: true };
            const updated = {
                $set: {
                    photo: url
                }
            }
            const result = await userCollection.updateOne(query, updated, options);
            res.send(result.acknowledged);
        })
        app.put('/users', async (req, res) => {
            const email = req.query.email;
            const data = req.body;
            const { name, designation, faculty, department, blood, phone, dob } = data;
            const query = {
                email: email
            }
            const options = { upsert: true };
            const updated = {
                $set: {
                    dob, name, designation, faculty, department, blood, phone
                }
            }
            const result = await userCollection.updateOne(query, updated, options);
            res.send(result.acknowledged);
        })
        app.post('/exammark', async (req, res) => {
            const code = req.query.code;
            const type = req.query.type;
            const data = req.body;
            // console.log('hitting');
            const result = await markCollection.insertOne(data);
            // console.log(result);
            res.send(result.acknowledged);
        })
        app.get('/exammark', async (req, res) => {
            const editedBy = req.query.editedBy;
            const src = req.query.search;
            const cursor = markCollection.find({ examiner: editedBy });
            const result = await cursor.toArray();
            // console.log(result);
            res.json(result);
        })
        app.get('/notifications', async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email
            }
            const cursor = notificationCollections.find(query);
            const result = await cursor.toArray();
            res.json(result);
        })
        app.put('/notifications', async (req, res) => {
            const email = req.query.email;
            const read = req.query.read;
            const data = req.body;
            const _idList = data.map(item => ObjectId(item._id));
            // console.log(_idList);
            const result = await notificationCollections.updateOne(
                {
                    _id: { $in: _idList },
                    email: email
                },
                {
                    $set: {
                        read: true
                    }
                })
            res.send(result)
        })
    }
    finally {

    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('working');
})

app.listen(port, () => {
    console.log(port);
})
