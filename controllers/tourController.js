const mongoose = require('mongoose');
// const Jimp = require('jimp');
const Tour = require('../models/tourModel');
const factory = require('./factoryHandler');
const ApiFeatures = require('../utils/apiFeatures');
const asyncWrapper = require('../utils/asyncWrapper');
const Agency = require('../models/agencyModel');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const multer = require('multer');
// const sharp = require('sharp');
// const uniqid = require('uniqid');

const getToursBy = (sortBy) =>
  asyncWrapper(async (req, res, next) => {
    let tours = await Tour.find().sort(sortBy);

    tours = tours.filter(
      (el) => el.startDates[el.startDates.length - 1].getTime() > Date.now()
    );

    let wantedTours = [];
    if (tours.length > 8) {
      wantedTours = tours.splice(0, 8);
    } else {
      wantedTours = tours;
    }

    res.status(200).json({
      status: 'success',
      results: wantedTours.length,
      data: wantedTours,
    });
  });

const getTours = (type) =>
  asyncWrapper(async (req, res, next) => {
    let filter = {};

    if (req.params.agencyId) {
      filter = { agency: req.params.agencyId };
    }

    const features = new ApiFeatures(Tour.find(filter), req.query)
      .filter()
      .filterCategory()
      .sort()
      .select()
      .paginate();

    const tours = await features.query;

    let futureTours = [];
    let finishedTours = [];

    tours.forEach((tour) => {
      if (tour.startDates.length > 0) {
        const lastDate = tour.startDates[tour.startDates.length - 1];
        if (lastDate.getTime() > Date.now()) {
          futureTours.push(tour);
        } else {
          finishedTours.push(tour);
        }
      }
    });

    let results;
    let data;

    if (type === 'finished') {
      results = finishedTours.length;
      data = finishedTours;
    } else if (type === 'future') {
      results = futureTours.length;
      data = futureTours;
    }

    res.status(200).json({
      status: 'success',
      results,
      data,
    });
  });

// /agencies/:agencyId/tours
exports.getTour = factory.getOne(Tour);

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// exports.uploadImageCover = upload.single('imageCover');
// exports.uploadImages = upload.array('image', 3);

exports.createTour = asyncWrapper(async (req, res, next) => {
  req.body.startDates = JSON.parse(req.body.startDates);
  req.body.locations = JSON.parse(req.body.locations);
  req.body.startLocation = {
    coordinates: JSON.parse(req.body.coordinates),
    address: req.body.address,
    description: req.body.address,
  };
  req.body.coordinates = undefined;
  req.body.address = undefined;

  for (let i = 0; i < req.body.startDates.length - 1; i++) {
    if (
      new Date(req.body.startDates[i]) > new Date(req.body.startDates[i + 1])
    ) {
      return res.status(400).json({
        status: 'fail',
        message: 'Start Dates should be in the asc order! Try again!',
      });
    }
  }

  if (req.file) {
    // console.log(req.file)
    req.body.imageCover = req.file.location;

    //   Jimp.read(req.file.location)
    // .then(lenna => {
    //   return lenna
    //     .resize(2000, 1333) // resize
    //     .quality(90) // set JPEG quality
    //     .greyscale() // set greyscale
    //     .write(req.body.imageCover); // save
    // })
    // .catch(err => {
    //   console.error(err);
    // });
    // sharp(base64_encode(req.file.location))
    // .resize(2000, 1333)
    // .toFile(req.body.imageCover, (err, info) => { if (err) console.log(err) });

    //  Jimp.read('https://mariusfirstbucket.s3.amazonaws.com/pexels-photo-3512848-1589106569016.jpg', (err, lenna) => {
    //   if (err) console.log(err)
    //   lenna
    //     .resize(2000, 1333) // resize
    //     .write(req.body.imageCover); // save
    // });

    // console.log(base64_encode(req.body.imageCover))

    // await sharp(base64_encode(req.body.imageCover))
    //   .resize(2000, 1333)
    // .toFormat('jpeg')
    // .jpeg({ quality: 90 })
    //   .toFile(`${req.body.imageCover}`);
  }

  const doc = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: doc,
  });
});
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.getFinishedTours = getTours('finished');
exports.getAllTours = getTours('future');

exports.getTopFiveTours = getToursBy('-ratingsAverage');
exports.getMostPopularTours = getToursBy('-numBought');

exports.getTourStatistics = asyncWrapper(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsQuantity: { $ne: 0 } },
    },
    {
      $group: {
        _id: '$agency',
        avg: { $avg: '$ratingsAverage' },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getReviewStats = asyncWrapper(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const totalReviews = tour.ratingsQuantity;
  const avgRating = tour.ratingsAverage;

  const stats = await Tour.aggregate([
    {
      $match: {
        _id: { $in: [mongoose.Types.ObjectId(req.params.tourId.toString())] },
      },
    },
    {
      $lookup: {
        from: 'reviewtours',
        foreignField: 'tour',
        localField: '_id',
        as: 'reviews',
      },
    },
    {
      $unwind: '$reviews',
    },

    {
      $group: {
        _id: '$reviews.rating',
        nReviews: { $sum: 1 },
      },
    },
    {
      $addFields: { rating: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $addFields: {
        percentage: {
          $multiply: [{ $divide: ['$nReviews', totalReviews] }, 100],
        },
      },
    },
    {
      $sort: { rating: 1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
    totalReviews,
    avgRating,
  });
});

exports.discountTour = asyncWrapper(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  const agency = await Agency.findById(tour.agency.toString());

  if (!tour) return next(new AppError('No tour found with that id', 400));

  if (!req.body.priceDiscount)
    return next(new AppError('Please specify a price discount', 400));

  const userToNotify = [];
  agency.tours.forEach((tour) => {
    tour.bookings.forEach((booking) => {
      userToNotify.push(booking.user);
    });
  });

  let msg = 'We have made a price discount! Visit us to learn more!';

  if (req.body.message) {
    msg = req.body.message;
  }

  const notification = {
    message: msg,
    agency: agency._id,
    tour: tour._id,
  };

  for (let i = 0; i < userToNotify.length - 1; i++) {
    for (let j = i + 1; j < userToNotify.length; j++) {
      if (userToNotify[i].toString() == userToNotify[j].toString()) {
        userToNotify.splice(i, 1);
      }
    }
  }
  for (let i = 0; i < userToNotify.length - 1; i++) {
    for (let j = i + 1; j < userToNotify.length; j++) {
      if (userToNotify[i].toString() == userToNotify[j].toString()) {
        userToNotify.splice(i, 1);
      }
    }
  }

  const priceDiscount = req.body.priceDiscount;
  if (priceDiscount > tour.price) {
    return res.status(400).json({
      status: 'fail',
      message: `Price Discount (${priceDiscount}) can not be below the regular price`,
    });
  }
  tour.priceDiscount = priceDiscount;
  tour.price = tour.price - priceDiscount;
  await tour.save();

  userToNotify.forEach(async (userId) => {
    const user = await User.findById(userId);
    if (user) {
      user.notifications.push(notification);
      await user.save();
    }
  });

  res.status(200).json({
    status: 'success',
    tour,
  });
});

exports.getByCategory = asyncWrapper(async (req, res, next) => {
  const difficulties = req.query.difficulties.split(',');
  let tours;
  if (req.query.rating) {
    tours = await getTours('future', {
      difficulty: { $in: difficulties },
      ratingsAverage: { $gte: req.query.rating },
    });
  } else tours = await Tour.find({ difficulty: { $in: difficulties } });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.getToursWithin = asyncWrapper(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours,
  });
});

exports.getDistances = asyncWrapper(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});

exports.searchForTours = asyncWrapper(async (req, res, next) => {
  const { searchInput } = req.query;

  const toursFound = await Tour.find({
    $or: [
      { name: new RegExp(searchInput, 'i') },
      { difficulty: new RegExp(searchInput, 'i') },
      { summary: new RegExp(searchInput, 'i') },
      { description: new RegExp(searchInput, 'i') },
      { startLocation: { description: new RegExp(searchInput, 'i') } },
      { startLocation: { address: new RegExp(searchInput, 'i') } },
    ],
  });

  res.status(200).json({
    status: 'success',
    results: toursFound.length,
    data: toursFound,
  });
});
