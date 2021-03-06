const express = require('express');

const wishlistFlightRouter = require('../routes/wishlistFlightRoutes');
const reviewFlightRouter = require('../routes/reviewFlightRoutes');
const authController = require('../controllers/authController');
const flightController = require('../controllers/flightController');
const setAgencyId = require('../globalMiddlewares/setAgencyId');
const controlCategory = require('../globalMiddlewares/controlCategory');
const controlFlightAgencyCreator = require('../globalMiddlewares/controlFlightAgencyCreator');
const filterObj = require('../utils/filterObj');

const router = express.Router({ mergeParams: true });

router
  .route('/:flightId/price-discount')
  .patch(flightController.makePriceDiscount);

router.use('/:flightId/reviews', reviewFlightRouter);
router.use('/:flightId/wishlistFlight', wishlistFlightRouter);

router.route('/:flightId/review-stats').get(flightController.getReviewStats);

router.route('/finishedFlights').get(flightController.getFinishedFlights);

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('agencyCreator', 'user'),
    setAgencyId,
    controlCategory('flights'),
    flightController.createFlight
  )
  .get(flightController.getFutureFlights);

router.get('/searchedFlights', flightController.getSearchedFlights);
router.route('/:id').get(flightController.getFlight);

router.use(
  authController.protect,
  authController.restrictTo('agencyCreator'),
  controlFlightAgencyCreator
);

router
  .route('/:id')
  .get(flightController.getFlight)
  .patch((req, res, next) => {
    req.body = filterObj(req.body, [
      'numBought',
      'agency',
      'ratingsQuantity',
      'ratingsAverage',
    ]);
    next();
  }, flightController.updateFlight)
  .delete(flightController.deleteFlight);

module.exports = router;
