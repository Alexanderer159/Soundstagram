import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareFull } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Link } from "react-router-dom";
import '../styles/index.css'
import '../styles/membercard.css'

export const Membercard = () => {


    return(
<>
<div className="memcard d-flex flex-column">
    <div className="d-flex justify-content-center py-3">
    <img src="/avatars/usuaria_luna.png" className="memberpic rounded-circle" />
    </div>
    <h1 className="teamname d-flex justify-content-center mt-2">NAME</h1>
    <p className="role text-light d-flex justify-content-center">Role</p>
    <p className="teambio d-flex justify-content-center text-light my-3">Bio</p>
    <div className="linksteam d-flex justify-content-center text-light gap-5 my-4">
    <Link to="/" style={{ textDecoration: 'none' }}><FontAwesomeIcon icon={faGithub} mask={faSquareFull} /></Link>
      <Link to="/" style={{ textDecoration: 'none' }}><FontAwesomeIcon icon={faLinkedin} mask={faSquareFull} /></Link>
    </div>
</div>

</>
)
}