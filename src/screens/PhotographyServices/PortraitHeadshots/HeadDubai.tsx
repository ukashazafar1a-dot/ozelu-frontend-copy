import { returnImage } from '@/helpers/generals'
import React from 'react'

const HeadDubai = ({section}:any) => {
  return (
    <div className="row pt-30">
    <div className="col-md-7 text-left">
      <h2 className="text-md-left fw-bold text-center h1">Headshot Photography Dubai</h2>
      <p>
        In the highly competitive market of Dubai, United Arab Emirates,
        it is becoming increasing difficult to distinguish yourself from
        others. One of the recommendations given to potential candidates
        in big corporates is to keep your LinkedIn or business profile
        updated, of which one element is a clean portrait headshot.
      </p>
      <p>
        Hence, if you are a looking to get a clean and natural looking
        business headshot for yourself then Ozelu Studio is your answer.
        At Ozelu Studio, we ensure that we click photos from a variety
        of angles with different poses so you can choose a perfect click
        that goes with your personal branding and personality.
      </p>
      <p>
        In additional to portrait headshots we also do family portraits,
        kids portraits and couple portrait headshots. Give us a call to
        book your appointment at our private studio with no disturbance.
      </p>
    </div>
    <div className="col-md-5">
      {returnImage(section?.settings?.image,'head-image',500)}
    </div>
  </div>
  )
}

export default HeadDubai