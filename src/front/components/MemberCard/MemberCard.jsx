import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquareFull } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons'
import { Link } from "react-router-dom";
import '../../styles/index.css'
import './membercard.css'

export const MemberCard = (member) => {


    return(
<>
<div className="memcard p-2">
    <div className="d-flex justify-content-center pt-3">
    <img src={member.pic} className="memberpic rounded-circle object-fit-cover" />
    </div>

    <h1 className="teamname d-flex justify-content-center mt-2">{member.name}</h1>
    <p className="role d-flex justify-content-center">{member.role}</p>
    <p className="teambio d-flex justify-content-center my-3 text-center">{member.bio}</p>
    <div className="d-flex justify-content-center gap-5 my-4">
      <Link to={member.url1} className="text-decoration-none"><FontAwesomeIcon className="linksteam" icon={faGithub} mask={faSquareFull} /></Link>
      <Link to={member.url2} className="text-decoration-none"><FontAwesomeIcon className="linksteam" icon={faLinkedin} mask={faSquareFull} /></Link>
    </div>
</div>
</>
)
}