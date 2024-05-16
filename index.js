const express = require('express');
const app = express();
const cors= require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port= 5000;

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
    const bookedService = database.collection('bookedService');
    // add-provider-services
    app.post('/addService',async (req,res)=>{
        const data = req.body.wrap;
        const provider = req.query.provider;
        const wrap ={...data,currentUser: provider}
        const result= await service.insertOne(wrap);

        res.send(result);
    });
    // retrieve-service-provider-services
    app.get('/providerService',async (req,res)=>{
        const email = req.query.provider;
        const query = {currentUser : email}
        const option={
            projection:{_id: 0,category: 1}
        }

        const result = await service.findOne(query,option)

        res.send(result);
    })
    // check whether service-provider have past data
    app.get('/providerAllData',async (req,res)=>{
      const user = req.query.user;
      const query= {currentUser: user};
      const collectData = service.find(query);
      const result = await collectData.toArray()

      res.send(result);
    })
    // update service-provider existed data
    app.put('/updateService/:id',async(req,res)=>{
      const params = req.params.id;
      const data = req.body.wrap;
      const query = {_id: new ObjectId(`${params}`)};
      const updateDoc={
        $set:{
          service:data.service,
          price:data.price,
          description:data.description,
          photo:data.photo,
          location:data.location,
          providerName: data.providerName,
          providerEmail: data.providerEmail,
          providerImg : data.providerImg
        }
      }
      
      const result = await service.updateOne(query,updateDoc);

      res.send(result);
    })
    // removeItem from service provider
    app.delete('/removeItem/:id',async (req,res)=>{
      const params = req.params.id;
      const query = {_id: new ObjectId(`${params}`)};

      const result = await service.deleteOne(query)

      res.send(result);
    })
    // get all-services
    app.get('/allServices', async (req,res)=>{
      const user = req.query.userEmail;
      const page = parseInt(req.query.pageNumber);
      const search = req.query.searchService;
      const perPage= 3;
      
      let query={};
      if(search=="undefined"||search==""){
        query={}
      }else{
        query.service = {$regex: search.toLowerCase(),$options:"i"}
      }

      if(user!="undefined"){
        query.currentUser ={$ne: user}
      }

      const totalDocument = await service.countDocuments(query);
      const totalPage = Math.ceil(totalDocument/perPage);
      const containData = service.find(query).skip((page - 1) * perPage).limit(perPage);
      const result = await containData.toArray();
      const wrap = {result,totalPage};

      res.send(wrap)
    })
    // get specific single data for details
    app.get('/details/:id',async (req,res)=>{
      const params = req.params.id;
      const query ={_id: new ObjectId(`${params}`)};
      const result= await service.findOne(query);

      res.send(result)
    })
    // purchaseItem
    app.post('/purchaseItem',async(req,res)=>{
        const info = req.body.wrap;
        const result= bookedService.insertOne(info);

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
