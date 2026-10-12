import { returnImage } from '@/helpers/generals'
import React from 'react'



const LogoIcons = ({section}:any) => {
  const iconsData = [
    {
      icon: returnImage(section?.settings?.image1,'icon-image',256),
      heading: "BRAINSTORMING",
      text: "A fine log carries key principle of an organization. Our team will perform client and industry research and brainstorm brillient ideas",
      backgroundColor: "#d3d39a"
    },
    {
      icon: returnImage(section?.settings?.image2,'icon-image',256),
      heading: "SKETCHING",
      text: "Sketching is an effective and easy brainstorming tool, we will present various rough versions of logo, get a feedback, and polish the winning concept.",
      backgroundColor: "#f9d5b0"
    },
    {
      icon: returnImage(section?.settings?.image3,'icon-image',256),
      heading: "DESIGNING",
      text: "We then will digitalize the winning concept and create multiple variants of the design, keeping in mind the main theme and purpose.",
      backgroundColor: "#deabad"
    },
    {
      icon: returnImage(section?.settings?.image4,'icon-image',256),
      heading: "FINALIZING",
      text: "Upon selection, our teams will submit the design files in proper format.",
      backgroundColor: "#8acbd6"
    }
  ]
  return (
    <div className='px-3 px-lg-5'>
      <div className="d-flex justify-content-between flex-wrap">
        {iconsData.map((item, i) => {
          return (<div key={i} className="icons-container text-center col-lg-3 col-md-4">
            <div className="image__wrapper" 
                 style={{ background: `${item.backgroundColor}` }}>
                {item.icon}
            </div>
            <h5 className="card-title text-center mt-3 mx-auto fw-bold h3" id="text1">{item.heading}</h5>
            <p>{item.text}</p>
          </div>)
        })}
      </div>
    </div>
  )
}

export default LogoIcons