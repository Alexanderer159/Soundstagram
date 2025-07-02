import React from "react";
import "../styles/aboutus.css";
import "../styles/index.css";
import { Membercard } from "../components/Member_Card.jsx";

export const AboutUs = () => {
    return (
        <>
            <div className="aboutus container-fluid">
                <div className="filter">
                <div className="row">
                    <div className="col">
                        <p className="meet text-center fw-bold">Meet the band...</p>
                        <div className="banner"></div>
                    </div>
                </div>
                <div className="row mt-5 d-flex justify-content-center">
                    <div className="col">
                        <div className="member team1">
                            <Membercard pic='/Pictures/Team_Members/Adrian.png' name='Adrian' role='The Creative Guitarist (Frontend & Audio Engine)' 
                            bio="The original riff was his. Adrián conceived Soundstagram and now shapes the skeleton of the frontend, integrating tools like WaveSurfer.js and fine-tuning the online audio editor. He's the one who plays the first chord and lets the rest of the band flow."
                                url1='https://github.com/adrifther' url2='https://github.com/adrifther/adrifther/blob/main/url' />
                        </div>
                    </div>
                    <div className="col">
                        <div className="member team2">
                            <Membercard pic='Pictures/Team_Members/Alejandro.png' name='Alejandro' role='Frontman (UI, Styles & Animations)' 
                            bio="He makes the band shine. Alejandro is the group's powerhouse, transforming designs into fluid and eye-catching experiences. His touch on each screen is like a stage presence: elegant, energetic, and stylish."
                                url1='https://github.com/Alexanderer159' url2='https://www.linkedin.com/in/alejandro-de-yavorsky/' />
                        </div>
                    </div>
                    <div className="col">
                        <div className="member team3">
                            <Membercard pic='Pictures/Team_Members/Toni.png' name='Toni' role='Drummer (Backend & Architecture)' 
                            bio="Always in the shadows, setting the rhythm with precision. He may not be center stage, but without him, the song has no structure. Antonio is the one who keeps the project moving: he designs databases, structures APIs, and ensures everything works without missing a beat."
                                url1='https://github.com/cheftonic92' url2='https://www.linkedin.com/in/antonio-barroso-s%C3%A1ez-895811ba/'/>
                        </div>
                    </div>
                    <div className="col">
                        <div className="member team4">
                            <Membercard pic='https://media.licdn.com/dms/image/v2/D4D35AQEtNuNrR07zYw/profile-framedphoto-shrink_200_200/profile-framedphoto-shrink_200_200/0/1697359716786?e=1752004800&v=beta&t=JynxGtpCohL0Py9hhoc2VD4zthxZt-wYP-B--U6xFrM' name='Sergio' role='Discreet Keyboard (Support & Details)' 
                            bio="He brings harmony where it's needed, filling in details, adjusting pieces, and participating in the front-end when needed. Like a good keyboard in a band."
                                url1='https://github.com/padyy23' url2='https://www.linkedin.com/in/sergio-padilla-mogoll%C3%B3n-775771295/' />
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
};