import React, { useState } from 'react';
import { connect } from 'react-redux';
import ErrorModal from '../../shared/components/UI/ErrorModal';
import LoadingSpinner from '../../shared/components/UI/LoadingSpinner';
import { IconContext } from 'react-icons';
import { MdCreateNewFolder } from 'react-icons/md';
import { GiDetour } from 'react-icons/gi';
import { FaDollarSign } from 'react-icons/fa';
import Button from '../../shared/components/Button/Button';
import Input from '../../shared/components/Input/Input';
import './CreateAgency.css';
import axios from 'axios';
import Textarea from '../../shared/components/Input/Textarea';
import ImageUpload from '../../shared/components/ImageUpload/ImageUpload';

const MakeAnImpact = (props) => {
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const [agencyData, setAgencyData] = useState({
    name: {
      configOptions: {
        type: 'text',
        placeholder: 'Name of your agency',
      },
      value: '',
      valid: false,
      touched: false,
      validRequirements: {
        required: true,
        minlength: 2,
      },
    },
    description: {
      configOptions: {
        type: 'text',
        placeholder: 'Write a description for your agency (Min: 20 characters)',
      },
      value: '',
      valid: false,
      touched: false,
      validRequirements: {
        required: true,
        minlength: 20,
      },
    },
  });
  const [image, setImage] = useState({
    value: null,
    isValid: false,
  });
  const [previewUrl, setPreviewUrl] = useState();
  const [formValid, setFormValid] = useState();

  const checkValidity = (value, requirements) => {
    let isValid = true;

    if (requirements.required) {
      isValid = isValid && value.trim().length !== 0;
    }
    if (requirements.minlength) {
      isValid = isValid && value.trim().length >= requirements.minlength;
    }
    if (requirements.isEmail) {
      isValid = isValid && /\S+@\S+\.\S+/.test(value);
    }

    return isValid;
  };

  const inputHandler = (e, inputIdentifier) => {
    const newUpdatedData = { ...agencyData };
    const updatedIdentifier = { ...newUpdatedData[inputIdentifier] };

    updatedIdentifier.value = e.target.value;
    updatedIdentifier.touched = true;
    updatedIdentifier.valid = checkValidity(
      updatedIdentifier.value,
      updatedIdentifier.validRequirements
    );
    newUpdatedData[inputIdentifier] = updatedIdentifier;

    setAgencyData(newUpdatedData);

    let isFormValid = true;
    for (let key in newUpdatedData) {
      isFormValid = isFormValid && newUpdatedData[key].valid;
    }

    setFormValid(isFormValid);
  };

  const createAgencyHandler = async () => {
    try {
      const formData = new FormData();
      formData.set('name', agencyData.name.value);
      formData.set('description', agencyData.description.value);
      formData.set('category', 'tours');
      formData.append('image', image.value);
      setLoading(true);
      const agency = await axios.post(`/api/v1/agencies`, formData);
      setLoading(false);
      props.history.push('/my-agency');
    } catch (err) {
      setLoading(false);
      setError(err.response.data.message);
    }
  };

  const inputImageHandler = (value, isValid) => {
    setImage({
      value,
      isValid,
    });

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(value);
  };

  let formData = [];
  for (let key in agencyData) {
    if (key === 'name') {
      formData.push(
        <Input
          value={agencyData[key].value}
          valid={agencyData[key].valid}
          touched={agencyData[key].touched}
          configOptions={agencyData[key].configOptions}
          onChange={(e) => inputHandler(e, key)}
        />
      );
    } else if (key === 'description') {
      formData.push(
        <Textarea
          value={agencyData[key].value}
          valid={agencyData[key].valid}
          touched={agencyData[key].touched}
          configOptions={agencyData[key].configOptions}
          onChange={(e) => inputHandler(e, key)}
        />
      );
    }
  }

  return (
    <div className="create__agency__container">
      {loading && <LoadingSpinner asOverlay />}
      {error && (
        <ErrorModal show onClear={() => setError()}>
          {error}
        </ErrorModal>
      )}
      <div className="first">
        <h1>How about the information about your agency?</h1>
        <p>
          It's ok if you can't think of a good name right now. You can change it
          later.
        </p>
        {formData.map((el) => el)}
        <div className="user__photo--container">
          {previewUrl && (
            <img className="user__photo--image" src={previewUrl} />
          )}
          <ImageUpload
            title={'Logo of your agency'}
            onInput={inputImageHandler}
          />
        </div>
        <div className="create__agency__buttons">
          <Button
            className="btn1"
            type="danger"
            clicked={() => props.history.goBack()}
          >
            Exit
          </Button>
          <Button
            disabled={!formValid}
            clicked={createAgencyHandler}
            className="btn2"
            type="success"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    userData: state.user.userData,
  };
};

export default connect(mapStateToProps)(MakeAnImpact);