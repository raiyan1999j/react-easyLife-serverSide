const express = require('express');
const app = express();
const cors= require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port= 5000;

// enOMk7AtTpMtG9XY

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sqywi72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db('easyLife');
    const service= database.collection('services');

    app.post('/addService',async (req,res)=>{
        const data = req.body.wrap;
        const provider = req.query.provider;
        const wrap ={...data,provider}
        const result= await service.insertOne(wrap);

        res.send(result);
    });

    app.get('/providerService',async (req,res)=>{
        const email = req.query.provider;
        const query = {provider : email}
        const option={
            projection:{_id: 0,category: 1}
        }

        const result = await service.findOne(query,option)

        res.send(result);
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port,()=>{
    console.log('working or not')
})
