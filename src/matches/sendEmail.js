import sgMail from "@sendgrid/mail";
import QRCode from "qrcode";
import fs from "fs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (product, receiverEmail, qrCode) => {
  // let pathToAttachment = `${qrCode}/attachment.pdf`;
  // let attachment = fs.readFileSync(pathToAttachment).toString("base64");

  const msg = {
    to: receiverEmail,
    from: "btrearty@gmail.com",
    subject: `GAA Tickets - ${product.description}`,
    text: `${product.description}`,
    html: `<div><h2>Congratulations</h2>
    <h4>You will be attending the ${product.description}</h4>
    <h4>Game to take place on the </h4>
    <strong>${product.price}</strong></div>
    <img src=${qrCode}>`,
    // attachments: [
    //   {
    //     content: attachment,
    //     filename: "attachment.png",
    //     type: "application/png",
    //     disposition: "attachment",
    //   },
    // ],
  };
  await sgMail.send(msg);
};
