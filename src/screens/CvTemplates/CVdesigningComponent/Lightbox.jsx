"use client"
import React, { useEffect,useState } from 'react';
import FsLightbox from 'fslightbox-react'

export default function Lightbox({images}) {
    const [toggler,setToggler] = useState(false)

  return (
    <>
        <div style={{ position: 'absolute',bottom: '1rem',right: '1rem',padding: '6px',borderRadius: '10px',background: '#000d1d'}} onClick={() => setToggler(!toggler)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style={{fill: "#fff"}}>
                <path d="m21 15.344-2.121 2.121-3.172-3.172-1.414 1.414 3.172 3.172L15.344 21H21zM3 8.656l2.121-2.121 3.172 3.172 1.414-1.414-3.172-3.172L8.656 3H3zM21 3h-5.656l2.121 2.121-3.172 3.172 1.414 1.414 3.172-3.172L21 8.656zM3 21h5.656l-2.121-2.121 3.172-3.172-1.414-1.414-3.172 3.172L3 15.344z"></path>
            </svg>
        </div>
    <div style={{maxWidth: '448px',margin: '0 auto', textAlign: 'center'}}>
			<FsLightbox
				toggler={toggler}
				sources={images}
			/>
    </div>
    </>
  );
}
