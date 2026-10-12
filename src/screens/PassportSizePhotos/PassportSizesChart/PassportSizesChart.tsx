"use client"
import React from "react";
import './style.css';
import { PassportSizePhotos } from "../../../utils";
import { DefaultPassportSizePhotos } from "../../../utils";
import { useState } from "react";
import { selectStyles } from "../../../components/SearchableSelect";
import Select from "react-select";

const PassportSizesChart = () => {
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const handleChange = (selectedOption:any) => {
    const selectedValue = selectedOption.value;
    
    const selectedObjects = PassportSizePhotos.filter(
      (item) => item.value === selectedValue
    );
    // console.log(selectedObjects)
    setSelectedObject(selectedObjects);
  };

  return (
    <section className="container margin-bottom mt-5" >
      <div className="formControll mb-3">
         <h2 className="headingSizeChart playfair-heading-800 text-center mb-5">Passport Photo Requirements</h2>
      </div>
      <div className="d-block w-100 position-relative mb-5 custom-image-table">
        <div className="image-wrap mb-5">
          <img 
            src="http://res.cloudinary.com/dvk4zgeh4/image/upload/v1698497828/assets/cover_photo.png" 
            alt="Passport Photo Requirements" 
            loading="lazy"/>
        </div>
        <div className="d-block position-absolute fixed-table w-100 py-5 px-3">
          <div className="d-flex justify-content-start flex-column flex-md-row mb-2">
            <div className="block mr-md-3">
              <p className="fw-bold simple-heading">Please select your country:</p>
            </div>
            <div className="formControll">
              <Select
                options={PassportSizePhotos.map((item) => item.value)
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .map((value) => {
                    return { value: value, label: value };
                  })}
                onChange={handleChange}
                placeholder="Please Select Your Country"
                className="selectOptionsCustom-chart"
                styles={selectStyles}
              />
            </div>
          </div>
          <div className="photoPrintingSizesChart">
            <table className="photoSize table text-left">
              <thead>
                <tr>
                  <th scope="col" className="small-column">Requirements</th>
                  <th scope="col" className="large-column">Description</th>
                </tr>
              </thead>
              <tbody>
                {!selectedObject &&
                  DefaultPassportSizePhotos.map((item,i) => {
                    return (
                      <tr key={i}>
                        <td  className="small-column">{item.type}</td>
                        <td className="large-column">{item.dimensions}</td>
                      </tr>
                    );
                  })}
                {selectedObject &&
                  selectedObject.map((item:any,i:any) => {
                    return (
                      <tr key={i}>
                        <td  className="small-column">{item.type}</td>
                        <td className="large-column">{item.dimensions}</td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PassportSizesChart;

{/* <div className="d-flex justify-content-start">
            <div className="formControll">
              <Select
                options={PassportSizePhotos.map((item) => item.value)
                  .filter((value, index, self) => self.indexOf(value) === index)
                  .map((value) => {
                    return { value: value, label: value };
                  })}
                onChange={handleChange}
                placeholder="Please Select Your Country"
                className="selectOptionsCustom-chart"
                styles={selectStyles}
              />
            </div>
</div>
<div className="photoPrintingSizesChart">
  <table className="photoSize table">
    <thead>
      <tr>
        <th scope="col">Country</th>
        <th scope="col">Photo Type</th>
        <th scope="col">Size in mm</th>
        <th scope="col">Background</th>
      </tr>
    </thead>
    <tbody>
      {!selectedObject &&
        DefaultPassportSizePhotos.map((item,i) => {
          return (
            <tr key={i}>
              <td>{item.country}</td>
              <td>{item.type}</td>
              <td>{item.dimensions}</td>
              <td>{item.background}</td>
            </tr>
          );
        })}
      {selectedObject &&
        selectedObject.map((item:any,i:any) => {
          return (
            <tr key={i}>
              <td>{item.country}</td>
              <td>{item.type}</td>
              <td>{item.dimensions}</td>
              <td>{item.background}</td>
            </tr>
          );
        })}
      </tbody>
  </table>
</div> */}