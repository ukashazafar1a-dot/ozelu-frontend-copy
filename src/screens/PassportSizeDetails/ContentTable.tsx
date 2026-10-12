import { htmlDecode } from '@/helpers/generals';
import React from 'react'

const ContentTable = ({content}:any) => {
 

  return (
   <div className='single-page-table mb-5'>
      <table className="photoSize photo-chart-table table text-left">
         <thead>
           <tr>
             <th scope="col" className="small-column">
               Requirements
             </th>
             <th scope="col" className="large-column">
               Description
             </th>
           </tr>
         </thead>
         <tbody>
           {typeof content === "object" && content !== null ?
            
            (content.map((requirement:any, index:any) => {
               return (
                 <tr key={index}>
                   <td className="small-column">{requirement.key}</td>
                   <td className="large-column">
                   <div className='rte' 
                      dangerouslySetInnerHTML={{__html: htmlDecode(requirement.value)}}/>
                   </td>
                 </tr>
               );
             })) : null }
         </tbody>
       </table>
   </div>
 )
}

export default ContentTable