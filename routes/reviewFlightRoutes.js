const express = require('express');

const ReviewFlight = require('../models/reviewFlightModel');
const authController = require('../controllers/authController');
const reviewFlightController = require('../controllers/reviewFlightController');
const setFlightUserId = require('../globalMiddlewares/setFlightUserId');
const controlBooking = require('../globalMiddlewares/controlBooking');
const controlCreator = require('../globalMiddlewares/controlCreator');
const filterBody = require('../globalMiddlewares/filterBody');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    setFlightUserId,
    controlBooking,
    reviewFlightController.createReview
  );

router
  .route('/:id')
  .patch(
    authController.protect,
    // authController.restrictTo('user'),
    // controlCreator(ReviewFlight),
    (req, res, next) => {
      req.body.createdAt = Date.now();
      next();
    },
    filterBody(['flight', 'user']),
    reviewFlightController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user'),
    controlCreator(ReviewFlight),
    filterBody(['flight', 'user']),
    reviewFlightController.deleteReview
  );

module.exports = router;
