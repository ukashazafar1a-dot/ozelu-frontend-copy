import React from "react";

const VideoSection = ({ section }: any) => {
  if (section?.settings?.link) {
    return (
      <section className="d-block container py-5">
        <div className="section--header text-center mb-5">
          <h2 className="heading-h2 text-center mx-0 mt-0 fw-bold">
            {section?.settings?.title}
          </h2>
        </div>
        {section?.settings?.link && (
          <div className="iframe-wrapper mx-auto">
            <div className="postion-relative iframe-contaniner">
              <iframe
                className="inn-iframe "
                src={`${section?.settings?.link}&theme=dark&autohide=1&modestbranding=1&showinfo=0&fs=0&controls=1&playsinline=1&rel=0&enablejsapi=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        )}
      </section>
    );
  } else {
    return <></>;
  }
};

export default VideoSection;
