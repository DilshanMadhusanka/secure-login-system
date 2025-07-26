import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Home() {

const [auth, setAuth] = useState(false); // default auth eka faluse. log wel na
const [message, setMessage] = useState(''); // message store krann
const [name, setName] = useState('');  // log wena kenage name eka store kra ganna 
 
axios.defaults.withCredentials = true; 

// check one is authorize or not ( token eka browser eke cookei eke thiynwad nadd kiyala check kranwa )
useEffect(() => {
    axios.get('http://localhost:8081')
        .then(res => {
            if(res.data.Status === "Success") {
                setAuth(true); 
                setName(res.data.name);
               // navigate('/login');
            } else {
                setAuth(false);
                setMessage(res.data.Error);
            }
        })
        .catch(err => console.log(err));
}, []);


// logout function ( delete the cookie from the browser)
const handleLogout = () => {
    axios.get('http://localhost:8081/logout')
        .then(res => {
            location.reload(true);
        })
        .catch(err => console.log(err));
}

  return (
    <div className="container mt-4">
      {/* check log or not */}
      {auth ? (
        <div>
          <h3>You are Authorized {name}</h3>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <h3>{message}</h3>
          <h3>Login Now</h3>
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default Home;
