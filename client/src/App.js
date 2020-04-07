import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { setHeaders, setCurrentUser } from './store/actions/userActions';
import Layout from './Layout/Layout';
import Tours from './pages/Tours/Tours';
import Home from './pages/Home/Home';
import TourDetails from './pages/TourDetails/TourDetails';
import SuccessBooking from './components/SuccessBooking/SuccessBooking';
import AccountSettings from './AccountSettings/AccountSettings';
import MyBookings from './AccountSettings/MyBookings/MyBookings';
import AgencyDetails from './pages/AgencyDetails/AgencyDetails';
import MyNotifications from './AccountSettings/MyNotifications/MyNotifications';
import DiscoverDreamTour from './pages/DiscoverDreamTour/DiscoverDreamTour'

function App(props) {
  const setUserData = async () => {
    setHeaders(localStorage.getItem('jwt'));
    await props.setCurrentUser();
  };

  if (localStorage.getItem('jwt')) {
    setUserData();
  }

  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route path="/tours/:tourId" exact component={TourDetails} />
          <Route path="/categories/tours" exact component={Tours} />
          <Route path="/" exact component={Home} />
          <Route path="/me" exact component={AccountSettings} />
          <Route path="/my-bookings" exact component={MyBookings} />
          <Route path="/agencies/:agencyId" exact component={AgencyDetails} />
          <Route path="/my-notifications" exact component={MyNotifications} />
          <Route path="/discover-dream-tour" exact component={DiscoverDreamTour} />
        </Switch>
      </Layout>
      <Route
        path="/success/tours/:tourId/users/:userId/price/:price"
        exact
        component={SuccessBooking}
      />
    </BrowserRouter>
  );
}

export default connect(null, { setCurrentUser })(App);
