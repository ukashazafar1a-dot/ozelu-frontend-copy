import Swal from "sweetalert2";

const showCustomPopup = (message: any) => {
  Swal.fire({
    title: `<div class="font-primary">${message?.heading ? message?.heading : 'Out of Sale Now!' }</div>`,
    html: `<div class="rte font-primary sm-text">${message?.content ? message?.content : '' }</div>`,
    imageUrl: "https://ozelu.s3.eu-north-1.amazonaws.com/Assets/forms-payments-blocking-error-message-sorry.png",
    imageHeight: 200,
    imageAlt: "Sorry - Ozelu Studio",
    showCloseButton: true,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: "Okay...",
    showLoaderOnConfirm: false,
    showLoaderOnDeny:false,
    loaderHtml:`<div></div>`
  });
};

export default showCustomPopup;
