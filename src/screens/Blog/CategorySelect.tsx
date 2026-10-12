"use client"
import React, { useState } from 'react';
import Select from 'react-select';

type props = {
  options?:any,
  handleChange?:any
}

const CategorySelect = ({options,handleChange}:props) => {
  
  return (
    <div className='catory-select-field'>
        <Select
                options={options}
                onChange={handleChange}
                placeholder="Select Category"
                className="custom--select-field"
                classNamePrefix="react-select"
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? 'black' : 'black',
                    color: 'black'
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isSelected ? '#f7f7f7' : 'white', 
                    color: state.isSelected ? '#000000' : '#000000',
                    '&:hover': {
                      backgroundColor: 'lightgray', // Change hover color if desired
                    },
                  }),
                }}

                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary25: '#ffffff',
                    primary: '#121212'
                  },
                })}
               />
    </div>
  )
}

export default CategorySelect