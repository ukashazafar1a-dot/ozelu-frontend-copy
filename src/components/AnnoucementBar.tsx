import { htmlDecode } from "@/helpers/generals";
import { Site } from "@/libs/site";
import React from "react";

const AnnoucementBar = ({content}:any) => {
  return (
    <div className="annoucement-bar-section px-lg-5 px-3" style={{backgroundColor:content?.settings?.background_color}}>
      <div className="py-2 container-fluid pr-lg-5 pl-lg-4 px-0">
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-none d-lg-flex align-items-center justify-content-start gap-3">
            <p className="m-0 p-0 font-simple" dangerouslySetInnerHTML={{__html: htmlDecode(content?.settings?.info_text)}} />
          </div>
          <div className="d-flex align-items-center justify-content-between gap-3 end-side">
            <div className="d-flex align-items-center justify-content-end gap-2">
              <a
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow on Facebook"
                href={Site?.socialLinks?.facebook}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  className="w-6 h-6 fill-primary"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M400 32H48A48 48 0 0 0 0 80v352a48 48 0 0 0 48 48h137.25V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.27c-30.81 0-40.42 19.12-40.42 38.73V256h68.78l-11 71.69h-57.78V480H400a48 48 0 0 0 48-48V80a48 48 0 0 0-48-48z"></path>
                </svg>
              </a>

              <a
                className="social-link"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow on instagram"
                href={Site?.socialLinks?.instagram}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 448 512"
                  className="w-6 h-6 fill-primary"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                </svg>
              </a>
            </div>
            <div className="d-flex align-items-center justify-content-start flex-md-row flex-column number--fields">
              {content?.settings?.email && <a
                target="_blank"
                rel="noreferrer"
                className="d-flex align-items-center justify-content-start gap-2 font-simple flex-basis-auto"
                href={"mailto:" + content.settings.email}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  className="w-6 h-6 fill-primary"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M471.05 168.36L263.24 65.69a16.37 16.37 0 00-14.48 0L41 168.36a16 16 0 00-9 14.31V432a16.09 16.09 0 0016.19 16h415.62A16.09 16.09 0 00480 432V182.67a16 16 0 00-8.95-14.31zM256 97.89l173 85.44-175.7 86.78-173-85.44z"></path>
                </svg>
                <span>{content.settings.email}</span>
              </a>}
              {content?.settings?.phone && <a
                target="_blank"
                rel="noreferrer"
                className="d-flex align-items-center justify-content-start gap-2 font-simple w-100"
                href={"https://wa.me/" + content.settings.phone}
              >
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 fill-primary"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="none" d="M0 0h24v24H0V0z"></path>
                  <path d="M16.49 3c-2.21 0-4.21.9-5.66 2.34l1.06 1.06a6.47 6.47 0 019.18 0l1.06-1.06A7.932 7.932 0 0016.49 3z"></path>
                  <path d="M20.03 7.46a5.022 5.022 0 00-7.08 0l1.06 1.06c.63-.63 1.51-1.03 2.47-1.03s1.84.39 2.47 1.03l1.08-1.06zM15.08 9.59L16.49 11l1.41-1.41c-.36-.37-.86-.59-1.41-.59s-1.05.22-1.41.59z"></path>
                  <path d="M15.63 14.4l-2.52 2.5c-2.5-1.43-4.57-3.5-6-6l2.5-2.52c.23-.24.33-.57.27-.9L9.13 3.8c-.09-.46-.5-.8-.98-.8H4c-.56 0-1.03.47-1 1.03.17 2.89 1.05 5.6 2.43 7.97 1.58 2.73 3.85 4.99 6.57 6.57 2.37 1.37 5.08 2.26 7.97 2.43.56.03 1.03-.44 1.03-1v-4.15c0-.48-.34-.89-.8-.98l-3.67-.73a.985.985 0 00-.9.26z"></path>
                </svg>
                <span>{content.settings.phone}</span>
              </a>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnoucementBar;
