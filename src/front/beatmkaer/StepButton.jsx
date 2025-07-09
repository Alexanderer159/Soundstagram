
import React from 'react';
import './MusicLoopMaker.css';

const StepButton = ({ active, playing, onClick }) => {
    const classes = `step-button ${active ? 'active' : ''} ${playing ? 'playing' : ''}`;
    return <button className={classes} onClick={onClick} />;
};

export default StepButton;