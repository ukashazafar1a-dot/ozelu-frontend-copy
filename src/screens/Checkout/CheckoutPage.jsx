"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "react-use-cart";
import CheckoutForm from "./CheckoutForm";
import CheckoutProduct from "./CheckoutProduct";
import "./styleCheckoutComponent.scss";
import './style.css';
import { useRouter } from "next/navigation";
import {getAreas} from '@/helpers/apiRequests'

const CheckoutPage = ({ data }) => {
  const router = useRouter();
  const { isEmpty, cartTotal } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(data?.free_delivery_threshold ? data?.free_delivery_threshold : 0);
  const [minPrice,setMinPrice] = useState(data?.min_price ? data?.min_price : 0)
  const [totalPrice,setTotalPrice] = useState(0)
  const [selectedArea,setSelectedArea] = useState(null)
  const [areas,setAreas] = useState([])

  function handleShowForm(event) {
    event.preventDefault();
    event.stopPropagation();
    setShowForm(!showForm);
  }

  const loadAreas = async function(){
    const data = await getAreas('store');
    if(data){
      const sortedAreas = data?.sort((a, b) => {
        if (a?.name < b?.name) {
          return -1;
        }
        if (a?.name > b?.name) {
          return 1;
        }
        return 0;
      });
      setAreas(sortedAreas)
    }
  }

  useEffect(() => {
    if (isEmpty) router.push("/");
    loadAreas()
  }, []);

  useEffect(()=>{
    setFreeDeliveryThreshold(data?.free_delivery_threshold ? data?.free_delivery_threshold : 0);
    setMinPrice(data?.min_price ? data?.min_price : 0)
  },[data])

  return (
    <div>
      <div className="mobileview-header" onClick={handleShowForm}>
        <div>
          <span className="icon-cont__mobileview">
            <i className="fas fa-shopping-cart primary-color"></i>
          </span>
          <span className="text-cont__mobileview">
            <span className="mr-2 primery-color">
              {showForm ? "Hide Order Summary" : "Show Order Summary"}
            </span>
            <i
              className={`fa-solid ${
                showForm ? "fa-chevron-down" : "fa-chevron-up"
              } primery-color`}
            ></i>
          </span>
        </div>
        <div className="total-price-mobileview">AED {totalPrice}</div>
      </div>
      <div className="page-container__checkout">
        <CheckoutForm
          deliveryCharges={deliveryCharges}
          freeDeliveryThreshold={freeDeliveryThreshold}
          setDeliveryCharges={setDeliveryCharges}
          areas={areas}
          minPrice={minPrice}
          area = {selectedArea}
          setArea = {setSelectedArea}
        />
        <CheckoutProduct
          classes={showForm ? "" : "hidden__mobile"}
          deliveryCharges={deliveryCharges}
          freeDeliveryThreshold={freeDeliveryThreshold}
          totalPrice={totalPrice}
          setTotalPrice={setTotalPrice}
          minPrice={minPrice}
          area = {selectedArea}
          areas={areas}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
