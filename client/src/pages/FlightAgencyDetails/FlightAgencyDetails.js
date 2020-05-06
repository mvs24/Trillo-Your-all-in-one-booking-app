import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { connect } from 'react-redux';
import ErrorModal from '../../shared/components/UI/ErrorModal';
import Button from '../../shared/components/Button/Button';

import Agency from '../../components/Agency/Agency';
import LoadingSpinner from '../../shared/components/UI/LoadingSpinner';
import Flight from '../../pages/Flights/Flight';

const FlightAgencyDetails = (props) => {
  const [agency, setAgency] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [myFlights, setMyFlights] = useState();
  const [myFlightsIds, setMyFlightsIds] = useState();
  const start = 0;
  const [end, setEnd] = useState(4);
  const { isAuthenticated } = props;

  useEffect(() => {
    const agencyId = props.match.params.agencyId;
    const getAgency = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/agencies/${agencyId}`);
        setAgency(res.data.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.response.data.message);
      }
    };

    getAgency();
  }, []);

  useEffect(() => {
    const getMyFlights = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/v1/bookings/flights/futureBookings');
        setLoading(false);
        setMyFlights(res.data.data);
      } catch (err) {
        setLoading();
        setError(err.response.data.message);
      }
    };
    if (isAuthenticated) {
      getMyFlights();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      let myFlightsIds = [];
      if (myFlights) {
        myFlightsIds = myFlights.map((flight) => flight._id);
        setMyFlightsIds(myFlightsIds);
      }
    }
  }, [myFlights]);

  if (loading) return <LoadingSpinner asOverlay />;
  if (error)
    return (
      <ErrorModal show onClear={() => setError(false)}>
        {error}
      </ErrorModal>
    );

  if (!agency) return <h1>No Agency Found!</h1>;
  if (isAuthenticated && !myFlightsIds) return <LoadingSpinner asOverlay />;

  const showMoreHandler = () => {
    setEnd((prev) => prev + 4);
  };

  return (
    <>
      {loading && <LoadingSpinner asOverlay />}
      {error && (
        <ErrorModal show onClear={() => setError(false)}>
          {error}
        </ErrorModal>
      )}
      <div className="agency__details--container">
        <Agency agency={agency} flight />
        <div className="flightsAgencyCnt">
          {agency.flights.slice(start, end).map((flight) => (
            <Flight
              booked={isAuthenticated && myFlightsIds.includes(flight._id)}
              white
              flight={flight}
            />
          ))}
          <div className="searchBtn--grid">
            <Button
              type="pink"
              disabled={end >= agency.flights.length}
              clicked={showMoreHandler}
            >
              Show More
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.user.isAuthenticated,
});

export default connect(mapStateToProps)(FlightAgencyDetails);