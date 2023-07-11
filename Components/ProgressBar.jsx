import React from 'react';
import StepIndicator from 'react-native-step-indicator';


export default function StepIndicatorCustom(props) {
  return (
    <StepIndicator
      customStyles={customStyles}
      currentPosition={props.currentPosition}
      labels={props.labels}
      stepCount={props.stepCount}
    />
  );
};


const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: 'green',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: 'green',
  stepStrokeUnFinishedColor: 'black',
  separatorFinishedColor: 'green',
  separatorUnFinishedColor: 'black',
  stepIndicatorFinishedColor: 'green',
  stepIndicatorUnFinishedColor: 'white',
  stepIndicatorCurrentColor: 'white',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: 'green',
  stepIndicatorLabelFinishedColor: 'white',
  stepIndicatorLabelUnFinishedColor: 'black',
  labelColor: 'black',
  labelSize: 13,
  currentStepLabelColor: 'green'
}