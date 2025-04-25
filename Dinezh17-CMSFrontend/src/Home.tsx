import React, { useContext } from 'react';
import { AuthContext } from './auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const{user} = useContext(AuthContext)!
  

  const navigate = useNavigate()
  const handclick = ()=>{
    if(user){
      if(user.role=="HR"){
        navigate("/employee-stats-overall")
      }
      else if(user.role=="Manager"){
        navigate("/employee-eval-hod")
      }else {

        navigate("/my-competency-stats")

      }
    }else{
      navigate("/login")
    }



  }
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    height: '100vh',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    color:"FFFAFA"
  };

  


  

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    color: '#ffffff',
    padding: '2rem',
    maxWidth: '800px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    color:"black",
    marginBottom: '1.5rem',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  };

  const subtitleStyle: React.CSSProperties = {
    color:"black",
    fontSize: '1.5rem',
    marginBottom: '3rem',
    opacity: 0.9,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '1rem 2.5rem',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    
    textTransform: 'uppercase',
    letterSpacing: '1px',
  };

 

  return (
    <div style={containerStyle}>
      
      <div ></div>
      <div style={contentStyle}>
        <h1 style={titleStyle}>Competency Management App</h1>
        <p style={subtitleStyle}>Streamline your team's skills assessment and development</p>
        <button 
          style={buttonStyle}
          onClick={handclick}
          
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;