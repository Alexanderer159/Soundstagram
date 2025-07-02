import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareFull } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Link } from "react-router-dom";
import '../styles/index.css'
import '../styles/membercard.css'

export const Membercard = (member) => {


    return(
<>
<div className="memcard p-2">
    <div className="d-flex justify-content-center pt-3">
    <img src={member.pic} className="memberpic rounded-circle object-fit-cover" />
    </div>

    <h1 className="teamname d-flex justify-content-center mt-2">{member.name}</h1>
    <p className="role text-light d-flex justify-content-center">{member.role}</p>
    <p className="teambio d-flex justify-content-center text-light my-3 text-center">{member.bio}</p>
    <div className="d-flex justify-content-center text-light gap-5 my-4">
    <Link to={member.url1} style={{ textDecoration: 'none' }}><FontAwesomeIcon className="linksteam" icon={faGithub} mask={faSquareFull} /></Link>
      <Link to={member.url2} style={{ textDecoration: 'none' }}><FontAwesomeIcon className="linksteam" icon={faLinkedin} mask={faSquareFull} /></Link>
    </div>
</div>
</>
)
}