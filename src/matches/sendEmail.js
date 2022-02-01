import sgMail from "@sendgrid/mail";
import QRCode from "qrcode";
import fs from "fs-extra";
// import fs from "fs";
import { dirname } from "path";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (product, receiverEmail, source) => {
  try {
    let pathToAttachment = `${source}`;
    console.log(`Path to pdf: ${pathToAttachment}`);
    let attachment2 = await fs.readFile(pathToAttachment);
    let attachment = attachment2.toString("base64");

    const msg = {
      to: receiverEmail,
      from: "btrearty@gmail.com",
      subject: `Here is your ticket to the ${product.description}`,
      text: `${product.description}`,
      html: `<div><h2>Game on!</h2>
    <h4>You've booked your spot to the  ${product.description}</h4>
    <h4>This game will take place on the ${product.displayDate} at ${product.time}</h4>
    <h4> Please find attached your ticket for the upcoming game. </h4>
    <h4> More details can be found on the O'Deals <a href="https://clubstub-fe.vercel.app/home" alt="">site</a>. </h4>`,

      attachments: [
        {
          content: attachment,
          filename: "ticket.pdf",
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };
    await sgMail.send(msg);
  } catch (error) {
    console.log(error);
  }
};
