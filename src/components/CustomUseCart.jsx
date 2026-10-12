// CustomUseCart.js
import { useCart as useCartOriginal } from "react-use-cart";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";

export const useCart = () => {
  const {
    addItem: addItemOriginal,
    updateItemQuantity: updateItemQuantityOriginal,
    ...restOriginal
  } = useCartOriginal();

  const addItem = (item, quantity) => {
    // Customize the identification logic here
    const existingItem = restOriginal.items.find(
      (cartItem) =>
        cartItem?.id?.split(":")[0] === item.id &&
        _.isEqual(cartItem.properties, item.properties)
    );

    if (existingItem) {
      console.log("Is there", uuidv4(), existingItem.quantity, quantity);
      // If the item already exists, update the quantity
      updateItemQuantityOriginal(
        existingItem.id,
        existingItem.quantity + quantity
      );
      // addItemOriginal({id:item.id+':'+uuidv4(),...item}, existingItem.quantity + quantity);
    } else {
      let id = item.id + ":" + uuidv4();
      console.log("not there", id);
      // If the item does not exist, add it to the cart
      addItemOriginal({ ...item, id }, quantity);
    }
  };

  return {
    addItem,
    ...restOriginal,
  };
};
