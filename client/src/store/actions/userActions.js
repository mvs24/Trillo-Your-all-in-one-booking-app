import axios from 'axios';
import {
  SIGNUP_LOADING,
  SIGNUP_SUCCESS,
  SIGNUP_ERROR,
  DELETE_ERROR,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  LOGIN_LOADING,
  SET_CURRENT_USER_LOADING,
  SET_CURRENT_USER,
  SET_CURRENT_USER_ERROR,
  SET_WISHLIST,
  SET_WISHLIST_LOADING,
  SET_WISHLIST_ERROR,
  ADD_TO_WISHLIST,
  ADD_TO_WISHLIST_LOADING,
  ADD_TO_WISHLIST_ERROR,
  REMOVE_FROM_WISHLIST,
  REMOVE_FROM_WISHLIST_LOADING,
  REMOVE_FROM_WISHLIST_ERROR,
  ADD_TO_CART,
  ADD_TO_CART_ERROR,
  ADD_TO_CART_LOADING,
  LOADING,
  GET_TOURS_IN_CART_ERROR,
  GET_TOURS_IN_CART,
  UPDATE_USER_DATA,
  ERROR,
  GET_MY_REVIEWS,
} from '../types/userTypes';

export const setHeaders = (token) => {
  if (token) {
    // apply to every request
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  } else {
    // delete auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const signupUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: SIGNUP_LOADING });
    const response = await axios.post('/api/v1/users/signup', userData);
    console.log(response.data.data)
    setHeaders(response.data.token);
    localStorage.setItem('jwt', response.data.token);

    dispatch({
      type: SIGNUP_SUCCESS,
      payload: response.data.data,
    });

    return true;
  } catch (err) {
    dispatch({
      type: SIGNUP_ERROR,
      errormsg: err.response.data.message,
    });
    return false;
  }
};

export const loginUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: LOGIN_LOADING });
    const response = await axios.post('/api/v1/users/login', userData);
    // THE ORDER VERY VERY IMPORTANT !!!!!!!!!!!
    setHeaders(response.data.token);
    localStorage.setItem('jwt', response.data.token);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: response.data.data,
    });

    return true;
  } catch (err) {
    dispatch({
      type: LOGIN_ERROR,
      errormsg: err.response.data.message,
    });
    return false;
  }
};

export const setCurrentUser = () => async (dispatch) => {
  try {
    dispatch({ type: SET_CURRENT_USER_LOADING });
    const response = await axios.get('/api/v1/users/loggedInUser');

    dispatch({ type: SET_CURRENT_USER, payload: response.data.data });
    return true;
  } catch (err) {
    dispatch({
      type: SET_CURRENT_USER_ERROR,
      errormsg: err.response.data.message,
    });
    return false;
  }
};

export const deleteError = () => (dispatch) => {
  dispatch({ type: DELETE_ERROR });
};

export const getMyWishlist = () => async (dispatch) => {
  try {
    dispatch({ type: SET_WISHLIST_LOADING });

    const res = await axios.get('/api/v1/wishlist/tours');

    let result = {
      results: res.data.results,
      totalPrice: res.data.totalPrice,
      data: res.data.data,
    };

    dispatch({ type: SET_WISHLIST, payload: result });
  } catch (err) {
    dispatch({ type: SET_WISHLIST_ERROR, errormsg: err.response.data.message });
  }
};

export const addToWishlist = (tourId) => async (dispatch) => {
  try {
    dispatch({ type: ADD_TO_WISHLIST_LOADING });
    const res = await axios.post(`/api/v1/wishlist/tours/${tourId}`);
    dispatch({ type: ADD_TO_WISHLIST, payload: res.data.data });
  } catch (err) {
    dispatch({
      type: ADD_TO_WISHLIST_ERROR,
      errormsg: err.response.data.message,
    });
  }
};

export const removeFromWishlist = (tourId) => async (dispatch) => {
  try {
    dispatch({ type: REMOVE_FROM_WISHLIST_LOADING });
    await axios.delete(`/api/v1/wishlist/tours/${tourId}`);
    dispatch({ type: REMOVE_FROM_WISHLIST, tourId });
  } catch (err) {
    dispatch({
      type: REMOVE_FROM_WISHLIST_ERROR,
      errormsg: err.response.data.message,
    });
  }
};

export const addToCart = (tourId) => async (dispatch) => {
  try {
    dispatch({ type: ADD_TO_CART_LOADING });
    const res = await axios.post(`/api/v1/cart/tours/${tourId}`);
    dispatch({ type: ADD_TO_CART, payload: res.data.data });
  } catch (err) {
    dispatch({ type: ADD_TO_CART_ERROR, errormsg: err.response.data.message });
  }
};

export const getToursInCart = () => async (dispatch) => {
  try {
    dispatch({ type: LOADING });
    const res = await axios.get(`/api/v1/cart/tours/`);
    dispatch({ type: GET_TOURS_IN_CART, payload: res.data.data });
  } catch (err) {
    dispatch({
      type: GET_TOURS_IN_CART_ERROR,
      errormsg: err.response.data.message,
    });
  }
};

export const updateUserData = (formData) => async (dispatch) => {
  try {
    dispatch({ type: LOADING });
    const res = await axios({
      method: 'patch',
      url: `/api/v1/users/updateMe`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    dispatch({ type: UPDATE_USER_DATA, payload: res.data.data });
  } catch (err) {
    dispatch({ type: ERROR, errormsg: err.response.data.message });
  }
};



export const getMyReviews = () => async (dispatch) => {
  try {
    dispatch({ type: LOADING });
    const res = await axios.get('/api/v1/users/my/reviews');
    dispatch({ type: GET_MY_REVIEWS, payload: res.data.data });
  } catch (err) {
    dispatch({ type: ERROR, errormsg: err.response.data.message });
  }
};