import axios from "axios";
import { generateClientSignature } from "../utils/generateClientSignature";
import type { Hex } from "viem";
import dotenv from "dotenv";

dotenv.config();

const client_swa = process.env.NEXT_PUBLIC_OKTO_CLIENT_SWA as Hex;


// ... other imports

async function postSignedRequest(endpoint: string, fullPayload: any) {
  const payloadWithTimestamp = { ...fullPayload, timestamp: Date.now() - 1000 };
  const signature = await generateClientSignature(payloadWithTimestamp);
  const requestBody = { data: payloadWithTimestamp, client_signature: signature, type: "ethsign" };
  console.log("Request Body:", requestBody);
  try {
    const response = await axios.post(endpoint, requestBody, { headers: { "Content-Type": "application/json" } });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error (postSignedRequest):", error.response?.data);
      throw new Error(JSON.stringify(error.response?.data)); // propagate the real error
    } else {
      console.error("Unexpected error:", error);
      throw error;
    }
  }
}

export { postSignedRequest }; 