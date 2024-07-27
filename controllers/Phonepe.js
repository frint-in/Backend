import mongoose from 'mongoose'
import Internship from "../models/Internship.js";
import dotenv from "dotenv";
import axios from 'axios'
import Users from "../models/Users.js";
import crypto from 'crypto';
import axios from 'axios';
import uniqid from 'uniqid'





dotenv.config();

let merchantTransactionId = uniqid();
const MERCHANT_ID = "PGTESTPAYUAT86"
const SALT_KEY = '96434309-7796-489d-8924-ab56988a6076'
const keyIndex = 1;


export const payAndGetRedirectUrl =async (req, res) => {
  try {
    const { name, number, amount, userId } = req.body;


    console.log(' the random merchantTransactionId I generate>>',merchantTransactionId );

    
    const data = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: 'MUID9EFW8E9F89EWF8C',
      name: name,
      amount: amount * 100,
      redirectUrl: `${process.env.API_URL}/api/phonepe/status?id=${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const string = payloadMain + "/pg/v1/pay" + SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = `${sha256}###${keyIndex}`;

    const URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const PROD_URL= 'https://api.phonepe.com/apis/hermes/pg/v1/pay'

    const options = {
      method: "POST",
      url: URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    const response = await axios.request(options);
    console.log("response after making the api call to phone pay, must return redirect url>>>>>>>>>>>", response.data);

    const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;


    console.log('the redirectUrl>>>>', redirectUrl);

    return res.status(200).json(redirectUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "Something went wrong. Please try again later"});
  }
}


export const getStatusAfterPayment = async (req, res) => {
    try {
        const merchantTransactionId = req.query.id
        console.log('merchantTransactionId>>>>>', merchantTransactionId);
        const merchantId = MERCHANT_ID
        console.log('merchantId>>>>>', merchantId);
        const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}${SALT_KEY}`;
        const sha256 = crypto.createHash("sha256").update(string).digest("hex");
        const checksum = `${sha256}###${keyIndex}`;
    
        const URL = `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`;
    
        const options = {
          method: "GET",
          url: URL,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "X-VERIFY": checksum,
            "X-MERCHANT-ID": `${merchantId}`,
          },
        };
    
        const response = await axios.request(options);
        console.log("response in /status>>>>>>>>>>>>",response.data);
        if (response.data.success === true) {
          const url = 'http://localhost:5173/success'
          return res.redirect(url)
        }else {
          const url = 'http://localhost:5173/failure'
          return res.redirect(url)
        }
        // return res.status(200).json(response.data);
      } catch (error) {
        console.error(" error in payment status>>>>>>>>>>>>", error);
        return res.status(500).send("Internal Server Error");
      }
}

