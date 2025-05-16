const puppeteer = require('puppeteer');
const { Storage } = require('@google-cloud/storage');
const nodemailer = require('nodemailer');

const storage = new Storage();
const bucketName = 'YOUR_BUCKET_NAME'; // Replace with your bucket

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_TO = process.env.EMAIL_TO;
const EMAIL_FROM = process.env.EMAIL_FROM;

async function sendEmail(subject, text) {
  const transporter = nodemailer.createTransport({
    host: 'mail.smtp2go.com',
    port: 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  await transporter.sendMail({ from: EMAIL_FROM, to: EMAIL_TO, subject, text });
}

exports.scheduledReport = async (req, res) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `asrarabukhair-${timestamp}.pdf`;

  try {
    await sendEmail('📢 PDF Generation Started', 'The PDF capture process has started.');

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://asrarabukhair.com', { waitUntil: 'networkidle2' });

    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);
    await file.save(pdfBuffer, { contentType: 'application/pdf' });

    const fileUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`;
    await sendEmail('✅ PDF Ready', `Your PDF has been uploaded: ${fileUrl}`);

    res.status(200).send(`✅ PDF uploaded as ${fileName}`);
  } catch (error) {
    await sendEmail('❌ PDF Generation Failed', `An error occurred: ${error.message}`);
    res.status(500).send('Error generating PDF');
  }
};
