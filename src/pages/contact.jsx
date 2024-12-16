import React from "react";
import { Link } from "react-router-dom";
import "./contact.css"

export const Contact = () => {
  return <div className="contact">
  
  <div className="contactTitle">
  <h1>Contact Us</h1>
  </div>
  <div className="contactBody">
  <h3>Email: <Link>anas.ziad.2004@gmail.com</Link></h3>
  <h3>Phone: 079 6340363</h3> 
  </div>
  </div>;
};
