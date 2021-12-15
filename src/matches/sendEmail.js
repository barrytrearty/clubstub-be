import sgMail from "@sendgrid/mail";
import QRCode from "qrcode";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (product, receiverEmail) => {
  const msg = {
    to: receiverEmail,
    from: "btrearty@gmail.com",
    subject: `GAA Tickets - ${product.description}`,
    text: `${product.description}`,
    html: `<div><h2>Congratulations</h2>
    <h4>You will be attending the ${product.description}</h4>
    <h4>Game to take place on the </h4>
    <strong>${product.price}</strong></div>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/800px-QR_code_for_mobile_English_Wikipedia.svg.png">`,
  };
  await sgMail.send(msg);
};
