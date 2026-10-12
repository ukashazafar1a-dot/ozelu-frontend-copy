"use client"

import React, { useEffect, useState } from 'react'
import "./style.css"

const AppReviews = () => {

	const [getScreenWidth, setScreenWidth] = useState(0);
	const [getScreenHeight, setScreenHeight] = useState(0);
	const onResize = () => {
		setScreenWidth(window.innerWidth);
		setScreenHeight(window.innerHeight);
	};
	useEffect(() => {
		onResize();
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
		};
	}, []);
	const isMobileScreen = () => {
		return getScreenWidth <= 500 ? true : false;
	};
	return (
	<section className='app-reviews__wrapper'>
		<div className="services-tittle review-heading">
			<div className="container">
				<h2 className="text-center my-5 heading-h2 mx-0">Customer Reviews</h2>
			</div>
		</div>
		<div className="review-slider">
			<div className="container mb-3">
				<div id="myCarousel" className="carousel slide" data-ride="carousel">
					{!isMobileScreen() && (<div >
						<ol className="carousel-indicators">
							<li data-target="#myCarousel" data-slide-to="0" className="active"></li>
							<li data-target="#myCarousel" data-slide-to="1" className="active"></li>
							<li data-target="#myCarousel" data-slide-to="2" className="active"></li>


						</ol>
						<div className="carousel-inner" role="listbox">

							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="row">
									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Efficient, convenient, stress free service. Excellent customer
												experience !!!
											</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Shokat Sheik
											</span>
										</div>
									</div>
									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Fantastic service so user friendly! Sent my picture in and photos
												were delivered to
												my door within a couple of hours! 5 stars
											</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Sarah Nolan</span>
										</div>
									</div>
									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Easy n simple way of printing photos. Card or cash payment with
												home
												delivery is a
												plus.</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Surendran Nagarajan</span>
										</div>
									</div>
								</div>
							</div>


							<div className="carousel-item active" style={{ backgroundColor: "white" }}>
								<div className="row">
									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Highly recommend Ozelu Online Photo Studio, easy to use their
												portal,
												top-notch for
												delivery
												service, we receive it in few hours. Excellent print quality & inexpensive. 1M
												star,
												Ozelu
												Online Photo Studio you’re the best.
											</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Nancy Hatamleh</span>
										</div>
									</div>
									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Excellent service, uploaded our passport photos for visa
												application,
												within just a
												few hours
												the photos were delivered exactly as per requirements, very easy and practical.
												I
												wont
												hesitate to use the service again!
											</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Noor Salem</span>
										</div>
									</div>
									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Excellent Service. Very fast and reliable. Thanks to Ozelu, we
												have
												been able to
												apply for
												our baby daughter passport in record time. Thanks again!</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Eric Daya</span>
										</div>
									</div>
								</div>
							</div>



							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="row">
									<div className="col-md-4">
										<div className="review-box">
											<p className="content">We ordered our newborn daughter&lsquo;s pictures at 4.30pm and they
												were
												delivered to our
												door at 7pm. Excellent service and really good value. Thanks!
											</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Matthew Hagan</span>
										</div>
									</div>

									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Quick and efficient. Quality v good.
											</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Marwa Gamal</span>
										</div>
									</div>

									<div className="col-md-4">
										<div className="review-box">
											<p className="content">Quick and Professional service specially during Covid time, I
												sent
												the required
												pictures through the email and they printed and delivered the same within few
												hours
												👏👍👌🙌
											</p>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="fa fa-star checked"></span>
											<span className="name">-Osamah Awartani</span>
										</div>
									</div>

								</div>
							</div>
						</div>
					</div>)}
					{isMobileScreen() && (<div >
						<div className="carousel-inner" role="listbox">
							<div className="carousel-item active" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Efficient, convenient, stress free service. Excellent customer
										experience !!!
									</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Shokat Sheik
									</span>
								</div>
							</div>
							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Fantastic service so user friendly! Sent my picture in and photos
										were delivered to
										my door within a couple of hours! 5 stars
									</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Sarah Nolan</span>
								</div>
							</div>
							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Easy n simple way of printing photos. Card or cash payment with
										home
										delivery is a
										plus.</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Surendran Nagarajan</span>
								</div>
							</div>
							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Highly recommend Ozelu Online Photo Studio, easy to use their
										portal,
										top-notch for
										delivery
										service, we receive it in few hours. Excellent print quality & inexpensive. 1M
										star,
										Ozelu
										Online Photo Studio you’re the best.
									</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Nancy Hatamleh</span>
								</div>
							</div>
							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Excellent service, uploaded our passport photos for visa
										application,
										within just a
										few hours
										the photos were delivered exactly as per requirements, very easy and practical.
										I
										wont
										hesitate to use the service again!
									</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Noor Salem</span>
								</div>
							</div>
							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Excellent Service. Very fast and reliable. Thanks to Ozelu, we
										have
										been able to
										apply for
										our baby daughter passport in record time. Thanks again!</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Eric Daya</span>
								</div>
							</div>

							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">We ordered our newborn daughter&lsquo;s pictures at 4.30pm and they
										were
										delivered to our
										door at 7pm. Excellent service and really good value. Thanks!
									</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Matthew Hagan</span>
								</div>
							</div>
							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Quick and efficient. Quality v good.
									</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Marwa Gamal</span>
								</div>
							</div>
							<div className="carousel-item" style={{ backgroundColor: "white" }}>
								<div className="review-box">
									<p className="content">Quick and Professional service specially during Covid time, I
										sent
										the required
										pictures through the email and they printed and delivered the same within few
										hours
										👏👍👌🙌
									</p>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="fa fa-star checked"></span>
									<span className="name">-Osamah Awartani</span>
								</div>
							</div>
						</div>
					</div>)}
					<a className="carousel-control-prev" href="#myCarousel" role="button" data-slide="prev">
						<span aria-hidden="true">
							<i className="fa-solid fa-chevron-left"></i>
						</span>
						<span className="sr-only">Previous</span>
					</a>
					<a className="carousel-control-next" href="#myCarousel" role="button" data-slide="next">
						<span aria-hidden="true">
							<i className="fa-solid fa-chevron-right"></i>
						</span>
						<span className="sr-only">Next</span>
					</a>
				</div>
			</div>
		</div>
	</section>
	)
}

export default AppReviews