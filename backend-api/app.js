const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session")
const mongoose = require("mongoose");
const app = express();
const Device = require("./models/device");
const Checkout = require("./models/checkout");

mongoose.connect("mongodb+srv://ganebabuk:0stSieBgqmPF1qtr@cluster0-ufxfh.mongodb.net/shopping-cart?retryWrites=true&w=majority")
.then(() => {
  console.log("Connected to Database.");
})
.catch(() => {
  console.log("Could not connect to Database.");
})

global.session = {carts: []};
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, token"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

app.get("/api/session", (req,res, next) => {
  res.status(200).json(global.session);
});

app.get("/api/devices/crud", (req,res, next) => {
  //add
  // const device = new Device({
  //   skuid: "IPHONERED32GB",
  //   devicename: "Apple iPhone 10 Red 32GB, 3GB RAM",
  //   deviceofferprice: 0,
  //   deviceprice: 80,
  //   currency: "$",
  //   deviceimage: "/assets/images/devices/3.jpeg"
  // });
  // device.save().then(createDevice => {
  //   res.status(201).json({
  //     message: "Device added successfully!",
  //     data: createDevice._id
  //   });
  // });

  //select all
  // Device.find().then(documents => {
  //   res.status(200).json({
  //     message: "Devices fetched successfully!",
  //     data: documents
  //   });
  // });

  //select with where
  // Device.findOne({skuid: "IPHONEBLL64GB",}).then(documents => {
  //   res.status(200).json({
  //     message: "Devices fetched successfully!",
  //     data: documents
  //   });
  // });

  //add multiple
  // const checkout = new Checkout({carts: [{
  //   skuid: "IPHONEBLL64GB",
  //   devicename: "Apple iPhone 10 Black 64GB, 4GB RAM",
  //   deviceofferprice: 90,
  //   deviceprice: 100,
  //   currency: "$",
  //   deviceimage: "/assets/images/devices/1.jpeg",
  //   qty: 2
  // },
  // {
  //   skuid: "IPHONEBLL64GB",
  //   devicename: "Apple iPhone 10 Black 64GB, 4GB RAM",
  //   deviceofferprice: 90,
  //   deviceprice: 100,
  //   currency: "$",
  //   deviceimage: "/assets/images/devices/1.jpeg",
  //   qty: 3
  // }],
  //   customer: {
  //     firstName: "test",
  //     lastName: "test",
  //     address: "test address",
  //     city: "reston",
  //     state: "Virginia",
  //     zipcode: "11111",
  //     email: "test@test.com",
  //     mobile: "1111100000"
  //   }
  // });
  // checkout.save().then(createCart => {
  //   res.status(201).json({
  //     message: "Cart saved successfully!",
  //     data: createCart._id
  //   });
  // });
});

app.get("/api/devices", (req, res, next) => {
  Device.find().then(devices => {
    res.status(200).json(devices);
  });
});

app.get("/api/device-details/:skuid", (req, res, next) => {
  Device.findOne({"skuid": req.params.skuid}).then(documents => {
    if (documents) {
      res.status(200).json(documents);
    } else {
      res.status(404).json({'error': 'Requested device not found.'});
    }
  });
});

app.post("/api/device-details", (req, res, next) => {
  if(global.session.carts.length === 0) {
    global.session.carts.push(req.body);
  } else {
    let isSkuid = true;
    global.session.carts.forEach((cart) => {
      if (cart.skuid === req.body.skuid) {
        cart.qty = cart.qty + req.body.qty
        isSkuid = false;
      }
    });
    if (isSkuid) {
      global.session.carts.push(req.body);
    }
  }
  res.status(200).json(global.session);
});

app.get("/api/carts", (req, res, next) => {
  if (global.session.carts.length > 0) {
    res.status(200).json(global.session.carts);
  } else {
    res.status(404).json();
  }
});

app.post("/api/checkout", (req, res, next) => {
  if (global.session.carts.length > 0) {
    let totalAmt = 0;
    let currency = '';
    global.session.carts.forEach((cart, index) => {
      cart.totalamount = cart.deviceofferprice > 0 ? cart.deviceofferprice * cart.qty : cart.deviceprice * cart.qty;
      totalAmt += cart.deviceofferprice > 0 ? cart.deviceofferprice * cart.qty : cart.deviceprice * cart.qty;
      currency = cart.currency;
    });
    const checkout = new Checkout({carts: global.session.carts,
      customer: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state.value,
        zipcode: req.body.zipcode,
        email: req.body.email,
        mobile: req.body.mobile,
        totalAmount: totalAmt,
        currencyType: currency,
        dateCreated: new Date()
      }
    });
    checkout.save().then(createCart => {
      global.session.carts = [];
      res.status(201).json({
        message: "Order has been placed successfully!",
        orderId: createCart._id
      });
    });
  } else {
    res.status(404).json();
  }
});

app.delete("/api/carts/:skuid", (req, res, next) => {
  global.session.carts.forEach((cart, index) => {
    if (cart.skuid === req.params.skuid) {
      global.session.carts.splice(index,1);
    }
  });
  if (global.session.carts.length > 0) {
    res.status(200).json(global.session.carts);
  } else {
    res.status(404).json();
  }
});

module.exports = app;
