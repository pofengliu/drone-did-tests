var Product = require("../models/product");

// query products api
async function allChunkedProducts(req, res) {
  
  let productChunks = [];
  await Product.find({}, null, { sort: { title: -1 } }, function (err, docs) {
    const chunkSize = 3;
    for (let i = 0; i < docs.length; i += chunkSize) {
      productChunks.push(docs.slice(i, i + chunkSize));
    }
    res.send({ products: productChunks });
  });
}

module.exports.allChunkedProducts = allChunkedProducts;
