import { getIn } from "formik";

export const RenderErrorMessage = function ({
    errors,
    touches,
    name,
    message = null,
  }:any) {
    const error = getIn(errors, name);
    const touch = getIn(touches, name);
    if (touch && error) {
      return (
        <div className="inputError">
          <div className="arrow-up"></div>
          <span>
            <img
              className="errorImage"
              src={"/images/images/error.jpeg"}
              alt="error image"
              loading="lazy"
            />
          </span>{" "}
          {message ? message : error}
        </div>
      );
    }
    return "";
  };