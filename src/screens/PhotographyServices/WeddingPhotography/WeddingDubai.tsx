import { returnImage } from '@/helpers/generals'
import React from 'react'

const WeddingDubai = ({section}:any) => {
  return (
    <section className="php-photography">
    <div className="container-photography">
      <div className="row pt-30">
        <div className="col-md-7 pl-12">
          <h2 className='fw-bold text-md-left text-center'>Wedding Photography in Dubai</h2>
          <div className="rte">
            <p>
              Demo Print Shop wedding photographers welcome you to the realm of
              gorgeous and genuine wedding photography. Our studio provides
              a variety of wedding photography techniques in Dubai, Sharjah,
              and anywhere else in the United Arab Emirates.
              <br />
              <br />
              We understand that everyone want&lsquo;s their wedding to have
              a unique touch, hence, each of our clients receives a tailored
              approach. On the eve or much before the wedding, the
              photographer must meet with the bride and groom in person to
              discuss all aspects of photography on such an important day,
              build a personal bond, and learn what the happy couple
              appreciate the most.
              <br />
              <br />
              Our photographers exclusively employ cutting-edge technology.
              As a result, we have been able to produce high-quality photos.
              All of the photos are processed many times in various software
              solutions like photoshop, lightroom and other photo processing
              software&lsquo;s. We personally edit each shot, bringing it to
              perfection so that you may enjoy the stunning images for many
              years to come. Our spectacular picture books with special
              designs are also handcrafted - so that you may feel as much of
              the individuality of your occasion as possible.
              <br />
              <br />
              This page features our clients&lsquo; most popular wedding
              photography packages. However, if you want anything specific,
              we would gladly design a one-of-a-kind package for you that
              totally fulfills your requirements.
            </p>
          </div>
        </div>
        <div className="col-md-5">
          {returnImage(section?.settings?.image,'image-class',600)}
        </div>
      </div>
    </div>
  </section>
  )
}

export default WeddingDubai