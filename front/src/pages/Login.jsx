import githubLogo from '../assets/githubLogo.png'
import googleLogo from '../assets/googleLogo.png'
import inlithanLogo from '../assets/inlithanLogo.png'
import { useNavigate } from 'react-router-dom'
// import './Login.css'


function Login(){
    const navigate = useNavigate()

    const handleGoogle = () => {
      window.location.href = 'http://localhost:5000/auth/google'
    }
    
    const handleGithub = () => {
      window.location.href = 'http://localhost:5000/auth/github'
    }
  
    return(

        <div className="login-container">

            <img src={inlithanLogo} alt="inlithan logo" className='logo'/>
            <h1 className="title">Welcome to Inlithan Labs</h1>

            <div className='buttons'>
                <button onClick={handleGoogle} className="btn-google">
                    <img src={googleLogo} alt="Google" className="btn-icon" />
                    Signup with Google

                </button>

                <button onClick={handleGithub} className="btn">
                    <img src={githubLogo} alt="Github" className="btn-icon" />
                    Signup with Github
                </button>
            </div>
        </div>
    )
}

export default Login