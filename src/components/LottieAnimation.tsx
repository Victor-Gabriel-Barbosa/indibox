// components/LottieAnimation.js
import React from 'react';
import Lottie from 'react-lottie';

interface LottieAnimationProps {
  animationData: object; 
  width?: number | string; 
  height?: number | string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({ animationData, width = 'auto', height = 'auto' }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div>
      <Lottie
        options={defaultOptions}
        height={height}
        width={width}
        isClickToPauseDisabled={true}
      />
    </div>
  );
};

export default LottieAnimation;