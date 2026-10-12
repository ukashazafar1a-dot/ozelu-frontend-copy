import React from 'react'

type props = {
  section: any
}

function CountingSection({section}:props) {
  return (
    <section className={`${section?.settings?.bgclr && section?.settings?.textclr ? 'counting--section' : 'no-counting-section'} py-5 px-3 cn-section`} 
      style={{background:section?.settings?.bgclr, color: section?.settings?.textclr}}>
        <div className="container d-flex justify-content-between align-items-center row-gap-3 flex-column flex-md-row px-md-3 px-0">
          <div className="d-flex justify-content-between align-items-center flex-column text-center p-3 p-md-2 col-md-4">
            {section?.settings?.count1 && <div className="cover-photo-heading">{section?.settings?.count1}</div>}
            {section?.settings?.title1   && <div className="cover-photo-content">{section?.settings?.title1}</div> }
          </div>
          <div className="d-flex justify-content-between align-items-center flex-column text-center p-3 p-md-2 col-md-4">
            {section?.settings?.count2 && <div className="cover-photo-heading">{section?.settings?.count2}</div>}
            {section?.settings?.title2   && <div className="cover-photo-content">{section?.settings?.title2}</div> }
          </div>
          <div className="d-flex justify-content-between align-items-center flex-column text-center p-3 p-md-2 col-md-4">
            {section?.settings?.count3 && <div className="cover-photo-heading">{section?.settings?.count3}</div>}
            {section?.settings?.title3   && <div className="cover-photo-content">{section?.settings?.title3}</div> }
          </div>
        </div>
    </section>
  )
}

export default CountingSection