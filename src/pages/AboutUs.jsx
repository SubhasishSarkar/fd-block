import React from "react";
import { IoMdMail } from "react-icons/io";
import { FaLinkedin } from "react-icons/fa";
function AboutUs() {
  return (
    <>
      <div className="text-4xl text-center pt-10">About Us</div>
      <div className="card text-center text-sm text-slate-500 p-2">
        <p>Developed By: Subhasish Sarkar</p>
        <div className="flex justify-center gap-2">
          <a
            href="mailto:sarkarsubhasish207@gmail.com"
            className="hover:bg-blue-200"
          >
            <IoMdMail />
          </a>
          <a
            href="https://www.linkedin.com/in/subhasish-sarkar-6029b2150/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:bg-blue-200"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </>
  );
}

export default AboutUs;
