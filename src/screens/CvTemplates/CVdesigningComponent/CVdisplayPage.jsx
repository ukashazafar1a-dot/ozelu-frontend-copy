"use client"
import React from "react";
import useApp from "../../../store/useApp";
import CVpurchaseForm from "./CVpurchaseForm";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
const data = [
  {
    _id: 1,
    title: "CV DESIGN 1",
    isPaid: true,
    price: 20,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
  {
    _id: 2,
    title: "CV DESIGN 3",
    isPaid: true,
    price: 13,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
  {
    _id: 3,
    title: "CV DESIGN 4",
    isPaid: true,
    price: 25,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
];

const CVdisplayPage = () => {
  
    let params = useParams();
    const id = params?.id;
    console.log('id is',id)
    const [template, setTemplate] = useState(null);
    const { templates} = useApp()

    useEffect(()=>{
      if(!id) return;
      const selectedTemplate = templates.find(item=> item._id === id);
      console.log("Template", selectedTemplate)
      setTemplate(selectedTemplate);
    },[templates])

  return (
    <div className="cv-display-container">
      {!template && (<p>Loading...</p>)}
      {template &&
      (<><h1 className="card-container-heading__cv-page-purchase">
        {" "}
        Welcome to the Purchase Page, Let&lsquo;s take the first step towards a new
        opportunity
      </h1>
      <div className="container">
      <div className="row">
        <div className="col-lg-6 col-sm-12">
          <div className="main__img img-center">
            <img style={{borderRadius: '1rem'}} src={process.env.NEXT_PUBLIC_API_URL + '/public/cvtemplates/' + template.preview} />
          </div>
                {/* <div className="card-display__cv-page" >
                  <div className="card-img-top" style={{backgroundImage: `url("${process.env.NEXT_PUBLIC_API_URL}/public/cvtemplates/${template.preview}")`}}></div>
                  <div className="card-body">
                    <h5 className="card-title">{template.title}</h5>
                  </div>
                  <ul>
                    <li>
                      Price{" "}
                      <span className="price-isPaid__cv-page">
                        {template.price}
                        {` AED`}
                      </span>
                    </li>
                    
                  </ul>
                </div> */}
        </div>
        <div className="col-lg-6 col-sm-12 my-lg-0 my-5">
          <h4>{template.title}</h4>
          <h6>
            <strong>Price</strong>
            <small>{': '}{template.price}{' AED'}</small>
          </h6>
        
          <hr/>
          <br/>
          <CVpurchaseForm template={template?._id}/>
        </div>
      </div>
      </div></>)}
    </div>
  );
};

export default CVdisplayPage;
