"use client"
import React,{useRef,useState} from "react";
import useApp from '../../../store/useApp';
import CheckoutModal from "./CheckoutModal";
import CvCard from "./CvCard";
import './style.css';

const data = [
  {
    _id: 1,
    title: "CV DESIGN 1",
    isPaid: false,
    price: 0,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
  {
    _id: 2,
    title: "CV DESIGN 2",
    isPaid: true,
    price: 12,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
  {
    _id: 2,
    title: "CV DESIGN 2",
    isPaid: true,
    price: 12,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
  {
    _id: 2,
    title: "CV DESIGN 2",
    isPaid: true,
    price: 12,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
  {
    _id: 2,
    title: "CV DESIGN 2",
    isPaid: true,
    price: 12,
    preview: "string(img url)",
    cv: "string(document url) (will be there if its free template)",
  },
];

const CVtempletes = () => {
  const {templates} = useApp();
  const [template,setTemplate] = useState();

  function hideModal(){
    window.jQuery('#checkoutmodal').modal('hide')
  }
  function showModal(){
    window.jQuery('#checkoutmodal').modal('show')
  }

  function openModal(item){
    setTemplate(item)
    showModal()
  }
  
  return (
    <div className="container">
      <h2 className="h1 text-center my-3 card-container-heading__cv-page">Award Winning CV Templates</h2>
      <div className="row d-flex cv-flex">
        {templates && templates.map((item,index) => {
          return <CvCard item={item} key={index} openModal={openModal} id={index} />
        })}
      </div>
      <CheckoutModal hideModal={hideModal} showModal={showModal} template={template}/>
    </div>
  );
};

export default CVtempletes;
