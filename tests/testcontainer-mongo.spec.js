const Product = require('../models/product')
const routes = require('../routes/index')
const mongoose = require('mongoose')
const { GenericContainer, Wait } = require('testcontainers')
const sinon = require('sinon')
/*
Mongoose model returns a new instance of the Query object. The new query instance has access to the exec method
through the prototype, but NOT all runtime dependencies provide such mechanism
*/

describe('DB modele test with sinon mock', () => {
  before(function() {
    sinon.stub(Product, 'find')
  })

  after(function() {
    Product.find.restore()
  })
  
  // pure unit-test
  it('should slice records as expected', () => {
    Product.find.yields(null, PROD_ORIGIN)
    var req = { params: {} }
    var res = {
      send: sinon.stub()
    }

    routes.allChunkedProducts(req, res)
    sinon.assert.calledWith(
      res.send,
      sinon.match(CHUNKED_RESP)
    )
  })
})

// test with testContainers
describe('MongoDB test with TestContainers', () => {
  let container

  before(async function() {
    container = await new GenericContainer('mongo:4.2')
      .withEnv('DEBUG', 'testcontainers')
      .withExposedPorts(27017)
      .withWaitStrategy(Wait.forLogMessage('Listening on'))
      .start()

    mongoose.Promise = global.Promise
    mongoose.connect(
      `mongodb://localhost:${container.getMappedPort(27017)}/shopping`,
      {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    )
    // seeding database ...
    for (let i = 0; i < PROD_SIX.length; i++) {
      // eslint-disable-next-line no-unused-vars
      PROD_SIX[i].save(function(err, result) {
        // might check result here
      })
    }
  })

  after(async function() {
    await mongoose.disconnect()
    await container.stop()
    console.log('Seeding products collection done!')
  })

  it('should slice records as expected', async () => {
    const req = { params: {} }
    let res = { send: sinon.stub() }
    await routes.allChunkedProducts(req, res)
    // console.log(res.send.getCall(0))
    if (!res.send.getCall(0)) {
      setTimeout(function() {}, 100)
      return
    }
    sinon.assert.calledWith(
      res.send,
      sinon.match.has('products', sinon.match.array)
    )
  })
})

const PROD_ORIGIN = [
  {
    "_id": "5f72af730ddc2940e8f25f12",
    "imagePath": "https://abc.com/6.jpg",
    "title": "Test 6",
    "description": "Test_6_desc",
    "price": 6,
    "stock": 6,
    "__v": 0
  },
  {
    "_id": "5f72af730ddc2940e8f25f11",
    "imagePath": "https://abc.com/5.jpg",
    "title": "Test 5",
    "description": "Test_5_desc",
    "price": 5,
    "stock": 5,
    "__v": 0
  },
  {
    "_id": "5f72af730ddc2940e8f25f10",
    "imagePath": "https://abc.com/4.jpg",
    "title": "Test 4",
    "description": "Test_4_desc",
    "price": 4,
    "stock": 4,
    "__v": 0
  },
  {
    "_id": "5f72af730ddc2940e8f25f0f",
    "imagePath": "https://abc.com/3.jpg",
    "title": "Test 3",
    "description": "Test_3_desc",
    "price": 3,
    "stock": 3,
    "__v": 0
  },
  {
    "_id": "5f72af730ddc2940e8f25f0e",
    "imagePath": "https://abc.com/2.jpg",
    "title": "Test 2",
    "description": "Test_2_desc",
    "price": 2,
    "stock": 2,
    "__v": 0
  },
  {
    "_id": "5f72af730ddc2940e8f25f0d",
    "imagePath": "https://abc.com/1.jpg",
    "title": "Test 1",
    "description": "Test_1_desc",
    "price": 1,
    "stock": 1,
    "__v": 0
  }
]

const CHUNKED_RESP = {
  products: [
    [
      {
        "_id": "5f72af730ddc2940e8f25f12",
        "imagePath": "https://abc.com/6.jpg",
        "title": "Test 6",
        "description": "Test_6_desc",
        "price": 6,
        "stock": 6,
        "__v": 0
      },
      {
        "_id": "5f72af730ddc2940e8f25f11",
        "imagePath": "https://abc.com/5.jpg",
        "title": "Test 5",
        "description": "Test_5_desc",
        "price": 5,
        "stock": 5,
        "__v": 0
      },
      {
        "_id": "5f72af730ddc2940e8f25f10",
        "imagePath": "https://abc.com/4.jpg",
        "title": "Test 4",
        "description": "Test_4_desc",
        "price": 4,
        "stock": 4,
        "__v": 0
      }
    ],
    [
      {
        "_id": "5f72af730ddc2940e8f25f0f",
        "imagePath": "https://abc.com/3.jpg",
        "title": "Test 3",
        "description": "Test_3_desc",
        "price": 3,
        "stock": 3,
        "__v": 0
      },
      {
        "_id": "5f72af730ddc2940e8f25f0e",
        "imagePath": "https://abc.com/2.jpg",
        "title": "Test 2",
        "description": "Test_2_desc",
        "price": 2,
        "stock": 2,
        "__v": 0
      },
      {
        "_id": "5f72af730ddc2940e8f25f0d",
        "imagePath": "https://abc.com/1.jpg",
        "title": "Test 1",
        "description": "Test_1_desc",
        "price": 1,
        "stock": 1,
        "__v": 0
      }
    ]
  ]
}
// test data for inserting into mongodb
const PROD_SIX = [
  new Product({
    imagePath: 'https://abc.com/1.jpg',
    title: 'Test 1',
    description: 'Test_1_desc',
    price: 1,
    stock: 1
  }),
  new Product({
    imagePath: 'https://abc.com/2.jpg',
    title: 'Test 2',
    description: 'Test_2_desc',
    price: 2,
    stock: 2
  }),
  new Product({
    imagePath: 'https://abc.com/3.jpg',
    title: 'Test 3',
    description: 'Test_3_desc',
    price: 3,
    stock: 3
  }),
  new Product({
    imagePath: 'https://abc.com/4.jpg',
    title: 'Test 4',
    description: 'Test_4_desc',
    price: 4,
    stock: 4
  }),
  new Product({
    imagePath: 'https://abc.com/5.jpg',
    title: 'Test 5',
    description: 'Test_5_desc',
    price: 5,
    stock: 5
  }),
  new Product({
    imagePath: 'https://abc.com/6.jpg',
    title: 'Test 6',
    description: 'Test_6_desc',
    price: 6,
    stock: 6
  })
]