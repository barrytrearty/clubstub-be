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
      subject: `GAA Tickets - ${product.description}`,
      text: `${product.description}`,
      html: `<div><h2>Congratulations</h2>
    <h4>You will be attending the ${product.description}</h4>
    <h4>Game to take place on the </h4>
    <strong>${product.entryFee}</strong></div>
    <h4> Link to your <a href="link.com">code</a> </h4>`,

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
