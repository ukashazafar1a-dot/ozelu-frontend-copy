import React from 'react'

const ArticleShare = ({article}:any) => {
    const url = 'https://ozelu.com/blog/' + article?.slug;
    const title = article?.title
  return (
    <div className="share-box article-content w-100 mb-5">
        <h3 className='h2'>Share With Others</h3>
        <div className='d-flex align-items-center justify-content-start gap-3'>
          <a className='content' href={`https://www.facebook.com/sharer.php?u=${url}`} 
             target='_blank'>
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a className='content' href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`} 
             target='_blank'>
            <i className="fa-brands fa-linkedin"></i>
          </a>
          <a className='content' href={`https://twitter.com/intent/tweet?url=${url}&text=${title}`} 
             target='_blank'>
            <i className="fa-brands fa-twitter"></i>
          </a>
          <a className='content' href={`https://api.whatsapp.com/send?text=${title}%20${url}`} 
             target='_blank'>
            <i className="fa-brands fa-whatsapp"></i>
          </a>
          <a className='content' href={`mailto:?subject=${title}&body=${url} - ${title}`} 
             target='_blank'>
            <i className="fa-regular fa-envelope"></i>
          </a>
        </div>
    </div>
  )
}

export default ArticleShare