import React from "react";
import "../styles/aboutus.css";
import "../styles/index.css";
import { Membercard } from "../components/Member_Card.jsx";

export const AboutUs = () => {
    return (
        <>
            <div className="container-fluid">
                <div className="row">
                    <div className="col">
                        <p className="meet text-center fw-bold">Meet the band...</p>
                        <div className="banner"></div>
                    </div>
                </div>
                <div className="row mt-5 d-flex justify-content-center">
                    <div className="col">
                        <div className="member team1">
                            <Membercard pic='/Pictures/Team_Members/Adrian.png' name='Adrian' role='El Guitarrista Creativo (Frontend & Audio Engine)' bio='El riff original fue suyo. Adrián imaginó Soundstagram y ahora da forma al esqueleto del frontend, integrando herramientas como WaveSurfer.js y afinando el editor de audio online. Es quien lanza el primer acorde y deja que el resto de la banda fluya.'
                                url1='https://github.com/adrifther' url2='https://github.com/adrifther/adrifther/blob/main/url' />
                        </div>
                    </div>
                    <div className="col">
                        <div className="member team2">
                            <Membercard pic='Pictures/Team_Members/Alejandro.png' name='Alejandro' role='Frontman (UI, Estilo & Animaciones)' bio='Hace que la banda brille. Alejandro es el exponente del grupo, el que convierte los diseños en experiencias fluidas y llamativas. Su toque en cada pantalla es como una presencia en el escenario: elegante, energética y con estilo.'
                                url1='https://github.com/Alexanderer159' url2='https://www.linkedin.com/in/alejandro-de-yavorsky/' />
                        </div>
                    </div>
                    <div className="col">
                        <div className="member team3">
                            <Membercard pic='Pictures/Team_Members/Toni.png' name='Toni' role='Backtería (Backend & Arquitectura)' bio='Siempre en la sombra, marcando el ritmo con precisión. Puede que no esté en el centro del escenario, pero sin él, la canción no tiene estructura. Antonio es quien mantiene el compás del proyecto: diseña bases de datos, estructura APIs y asegura que todo funcione sin perder el tempo.'
                                url1='https://github.com/cheftonic92' url2='https://www.linkedin.com/in/antonio-barroso-s%C3%A1ez-895811ba/' />
                        </div>
                    </div>
                    <div className="col">
                        <div className="member team4">
                            <Membercard pic='https://media.licdn.com/dms/image/v2/D4D35AQEtNuNrR07zYw/profile-framedphoto-shrink_200_200/profile-framedphoto-shrink_200_200/0/1697359716786?e=1752004800&v=beta&t=JynxGtpCohL0Py9hhoc2VD4zthxZt-wYP-B--U6xFrM' name='Sergio' role='El Teclista Discreto (Soporte & Detalles)' bio='Aporta armonía donde hace falta, completando detalles, ajustando piezas y participando en el frontend cuando se necesita. Como un buen teclado en una banda.'
                                url1='https://github.com/padyy23' url2='https://www.linkedin.com/in/sergio-padilla-mogoll%C3%B3n-775771295/' />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};