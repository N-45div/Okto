import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const OktoAuthToken = process.env.OKTO_AUTH_TOKEN || "";

/**
 * Retrieves all the enabled networks from the Okto Client Dashboard
 * 
 * This function makes an API call to Okto's sandbox API to fetch all supported networks that have been enabled for the client application.
 * 
 * @param OktoAuthToken - Authentication token (optional, defaults to environment variable)
 * @returns Object containing details of all supported blockchain networks available to the client application.
 * 
 * @throws Error if the API request fails.
 */
export async function getChains(OktoAuthToken: string) {
  try {
    console.log("Fetching chains with token:", OktoAuthToken.slice(0, 10) + "..."); // Log partial token for security
    const response = await axios.get(
      "https://sandbox-api.okto.tech/api/oc/v1/supported/networks",
      {
        headers: {
          Authorization: `Bearer ${OktoAuthToken}`,
        },
      }
    );
    console.log("Chains response:", response.data.data.network);
    return response.data.data.network || [];
  } catch (error: any) {
    console.error("Error fetching supported networks:", {
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
    throw new Error("Failed to fetch supported networks: " + (error.response?.data?.message || error.message));
  }
}