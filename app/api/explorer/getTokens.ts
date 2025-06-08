import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves information about the supported tokens
 * 
 * This function makes an API call to Okto's sandbox API to fetch information about the supported tokens.
 * 
 * @param OktoAuthToken - Authentication token (optional, defaults to environment variable)
 * @returns Object containing details of the supported tokens available to the client application.
 * 
 * @throws Error if the API request fails.
 */
export async function getTokens(OktoAuthToken: string) {
  try {
    console.log("Fetching tokens with token:", OktoAuthToken.slice(0, 10) + "..."); // Log partial token for security
    const response = await axios.get(
      "https://sandbox-api.okto.tech/api/oc/v1/supported/tokens",
      {
        headers: {
          Authorization: `Bearer ${OktoAuthToken}`,
        },
      }
    );
    console.log("Tokens response:", response.data.data.tokens);
    return response.data.data.tokens || [];
  } catch (error: any) {
    console.error("Error fetching tokens:", {
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
    throw new Error("Failed to fetch tokens: " + (error.response?.data?.message || error.message));
  }
}