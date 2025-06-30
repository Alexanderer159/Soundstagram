import React from "react";
import "../styles/aboutus.css";
import "../styles/index.css";
import { Link } from "react-router-dom";
import { Membercard } from "../components/Member_Card.jsx";

export const AboutUs = () => {
  return (
<>
<div className="container-fluid">
    <div className="row">
        <div className="col-12">
            <h1 className="meet text-center">Meet the team...</h1>
        </div>
    </div>
    <div className="row mt-5">
        <div className="col member">
            <div className="team1">
                <Membercard />
            </div>
        </div>
                <div className="col member">
            <div className="team2">
                <Membercard />
            </div>
        </div>
                <div className="col member">
            <div className="team3">
                <Membercard />
            </div>
        </div>
                <div className="col member">
            <div className="team4">
                <Membercard />
            </div>
        </div>

    </div>
  </div>
</>
  );
};