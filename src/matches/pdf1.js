import { promisify } from "util";
import { pipeline } from "stream";
import PdfPrinter from "pdfmake";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import QRCode from "qrcode";
import imageConverter from "image-to-base64";

// import {logo} from ""

export const generatePDFAsync = async (matchObj) => {
  try {
    const asyncPipeline = promisify(pipeline);

    ///////LOGO///////////////////////////
    const pathToLogo = join(
      dirname(fileURLToPath(import.meta.url)),
      "ballOdeals.png"
    );
    //const logo = await imageConverter(pathToLogo);
    console.log("Path::" + pathToLogo);

    let logoRead = await fs.readFile(pathToLogo);
    // console.log(logoRead);

    // let logoWrite = fs.createWriteStream(pathToLogo);
    // await asyncPipeline(logoRead, logoWrite);

    let logo = logoRead.toString("base64");
    // console.log(logo);

    // console.log(`Dirrrr ${logo}`);

    //////////QRCODE//////////////////////

    const qrCodePromisified = promisify(QRCode.toDataURL);

    const qrCodeImg = await qrCodePromisified(matchObj._id);

    const fonts = {
      Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
      },
    };
    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        {
          image: `data:image/png;base64, ${logo}`,
          //   width: 100,
        },
        {
          text: `${matchObj.competition.description} ${matchObj.description}`,
          style: "header",
        },
        {
          text: `${matchObj.homeTeam.name} vs ${matchObj.awayTeam.name} at ${matchObj.venue}`,
          style: "subHeader",
        },
        { text: `Date: ${matchObj.displayDate}`, style: "subHeader" },
        { text: `Tyoe: General Admission`, style: "subHeader" },
        // { qr: `"${matchObj._id}"`, style: "qrcode" },
        { image: qrCodeImg, style: "qrcode" },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0],
          alignment: "right",
        },
        subHeader: {
          fontSize: 15,
          bold: true,
          margin: 10,
        },
        qrcode: {
          alignment: "right",
        },
      },
    };

    //   const options = {
    //     // ...
    //   };

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition);
    // pdfReadableStream.pipe(fs.createWriteStream("document.pdf")) // pipe is the old syntax for piping two streams together
    pdfReadableStream.end();

    const path = join(dirname(fileURLToPath(import.meta.url)), "ticket.pdf");

    await asyncPipeline(pdfReadableStream, fs.createWriteStream(path));
    console.log("path string" + path);
    return path;
  } catch (error) {
    console.log(error);
  }
};
