import React from 'react';
import Link from 'next/link';
import { returnImage } from '@/helpers/generals';

type props = {
    section?:any
}

function SameDayDelivery({section}:any) {
    return (
    <section className="delivery">
        <div className="d-flex container py-3 flex-lg-row flex-column gap-2">
            <div className="serviceSectionLeftContent p-2 p-lg-5 d-flex flex-column justify-content-center">
                <h2 className="h2 head serviceHeading">What is Passport Size Photos Delivery service?</h2>
                <br />
                <div className="rte rte-settings mb-3 content">
                    <p>
                        Ozelu provides an online service that simplifies the process of taking passport size photographs for new passports or renewals, visa applications and other official documents.</p>
                    <p>Forget about visiting a photo studio to get your photograph clicked by using our online service for passport size photos. If you have a phone with a camera of just 10 megapixels or more, click a picture of yourself, our team of photoshop experts will edit it, print and deliver it to a location of your choice. We guarantee that if you follow our guidelines, the picture will be accepted by the authority you are applying to, with a money back guarantee in the rare case of a rejection.</p>
                </div>
                <div className=''>
                    <Link
                        href='/passport-size-photos'
                        className="orderButton fw-bold font-secondary mx-auto mx-md-0">
                        Place Your Order
                    </Link>
                </div>
            </div>
            <div className="serviceSectionRightContent">
                {returnImage(section?.settings?.image)}
            </div>
        </div>
    </section>
    )
}

export default SameDayDelivery