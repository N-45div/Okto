/*
 * This script explains how to perform token transfer intent with a static auth token
 */

import {
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  toHex,
  type Hex,
} from "viem";
import { v4 as uuidv4 } from "uuid";
import { INTENT_ABI } from "../helper/abi.js";
import { Constants } from "../helper/constants";
import { paymasterData } from "../utils/generatePaymasterData.js";
import { nonceToBigInt } from "../helper/nonceToBigInt.js";
import {
  signUserOp,
  executeUserOp,
  type SessionConfig,
  getUserOperationGasPrice,
} from "../utils/invokeExecuteUserOp.js";
import { getChains } from "../explorer/getChains.js";

import dotenv from "dotenv";
import type { Address } from "../helper/types.js";
import { getOrderHistory } from "../utils/getOrderHistory.js";

dotenv.config();
const clientSWA = process.env.NEXT_PUBLIC_OKTO_CLIENT_SWA as Hex;
const OKTO_AUTH_TOKEN = process.env.OKTO_AUTH_TOKEN || "";

interface Data {
  caip2Id: string;
  recipient: string;
  token: string;
  amount: number;
}

/**
 * Creates and executes a user operation for token transfer.
 *
 * @param data - The parameters for transferring the token (caip2Id, recipientWalletAddress, tokenAddress, amount)
 * @param sessionConfig - The sessionConfig object containing user SWA and session keys
 * @param feePayerAddress - Optional fee payer address for sponsored transactions
 * @returns The job ID and transaction details for the token transfer
 */
export async function transferToken(
  data: Data,
  sessionConfig: SessionConfig,
  feePayerAddress?: Address
) {
  try {
    // Validate OKTO_AUTH_TOKEN
    if (!OKTO_AUTH_TOKEN) {
      throw new Error("OKTO_AUTH_TOKEN is not set in environment variables");
    }

    // Validate sessionConfig
    if (!sessionConfig.userSWA || !sessionConfig.sessionPrivKey || !sessionConfig.sessionPubkey) {
      throw new Error("Invalid session configuration: missing userSWA, sessionPrivKey, or sessionPubKey");
    }

    // Generate a unique UUID based nonce
    const nonce = uuidv4();
    console.log("Generated nonce:", nonce);

    // Get the Chain CAIP2ID required for payload construction
    let chains;
    try {
      chains = await getChains(OKTO_AUTH_TOKEN);
      console.log("Chains:", JSON.stringify(chains, null, 2));
    } catch (error: any) {
      throw new Error(`Failed to fetch chains: ${error.message}`);
    }

    if (!chains || chains.length === 0) {
      throw new Error("No chains retrieved from Okto API");
    }

    const currentChain = chains.find(
      (chain: any) => chain.caip_id.toLowerCase() === data.caip2Id.toLowerCase()
    );

    if (!currentChain) {
      throw new Error(`Chain Not Supported: ${data.caip2Id}`);
    }

    // Set default feePayerAddress if not provided
    if (!feePayerAddress) {
      feePayerAddress = Constants.FEE_PAYER_ADDRESS;
    }

    console.log("feePayerAddress:", feePayerAddress);
    console.log("current chain:", currentChain);

    // Create the UserOp Call data for token transfer intent
    const jobParametersAbiType =
      "(string caip2Id, string recipientWalletAddress, string tokenAddress, uint amount)";
    const gsnDataAbiType = `(bool isRequired, string[] requiredNetworks, ${jobParametersAbiType}[] tokens)`;

    const calldata = encodeAbiParameters(
      parseAbiParameters("bytes4, address,uint256, bytes"),
      [
        Constants.EXECUTE_USEROP_FUNCTION_SELECTOR,
        Constants.ENV_CONFIG.SANDBOX.JOB_MANAGER_ADDRESS,
        Constants.USEROP_VALUE,
        encodeFunctionData({
          abi: INTENT_ABI,
          functionName: Constants.FUNCTION_NAME,
          args: [
            toHex(nonceToBigInt(nonce), { size: 32 }),
            clientSWA,
            sessionConfig.userSWA,
            feePayerAddress,
            encodeAbiParameters(
              parseAbiParameters("(bool gsnEnabled, bool sponsorshipEnabled)"),
              [
                {
                  gsnEnabled: currentChain.gsn_enabled ?? false,
                  sponsorshipEnabled: currentChain.sponsorship_enabled ?? false,
                },
              ]
            ),
            encodeAbiParameters(parseAbiParameters(gsnDataAbiType), [
              {
                isRequired: false,
                requiredNetworks: [],
                tokens: [],
              },
            ]),
            encodeAbiParameters(parseAbiParameters(jobParametersAbiType), [
              {
                amount: BigInt(data.amount),
                caip2Id: data.caip2Id,
                recipientWalletAddress: data.recipient,
                tokenAddress: data.token,
              },
            ]),
            Constants.INTENT_TYPE.TOKEN_TRANSFER,
          ],
        }),
      ]
    );
    console.log("calldata:", calldata);

    // Fetch gas price
    let gasPrice;
    try {
      gasPrice = await getUserOperationGasPrice(OKTO_AUTH_TOKEN);
      console.log("Gas price:", gasPrice);
    } catch (error: any) {
      throw new Error(`Failed to fetch gas price: ${error.message}`);
    }

    // Construct the UserOp
    const userOp = {
      sender: sessionConfig.userSWA,
      nonce: toHex(nonceToBigInt(nonce), { size: 32 }),
      paymaster: Constants.ENV_CONFIG.SANDBOX.PAYMASTER_ADDRESS,
      callGasLimit: toHex(Constants.GAS_LIMITS.CALL_GAS_LIMIT),
      verificationGasLimit: toHex(Constants.GAS_LIMITS.VERIFICATION_GAS_LIMIT),
      preVerificationGas: toHex(Constants.GAS_LIMITS.PRE_VERIFICATION_GAS),
      maxFeePerGas: gasPrice.maxFeePerGas,
      maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
      paymasterPostOpGasLimit: toHex(
        Constants.GAS_LIMITS.PAYMASTER_POST_OP_GAS_LIMIT
      ),
      paymasterVerificationGasLimit: toHex(
        Constants.GAS_LIMITS.PAYMASTER_VERIFICATION_GAS_LIMIT
      ),
      callData: calldata,
      paymasterData: await paymasterData({
        nonce,
        validUntil: new Date(Date.now() + 6 * Constants.HOURS_IN_MS),
      }),
    };
    console.log("Unsigned UserOp:", userOp);

    // Sign the userOp
    let signedUserOp;
    try {
      signedUserOp = await signUserOp(userOp, sessionConfig);
      console.log("Signed UserOp:", signedUserOp);
    } catch (error: any) {
      throw new Error(`Failed to sign userOp: ${error.message}`);
    }

    // Execute the userOp
    let jobId;
    try {
      jobId = await executeUserOp(signedUserOp, OKTO_AUTH_TOKEN);
      console.log("Job ID:", jobId);
    } catch (error: any) {
      throw new Error(`Failed to execute userOp: ${error.message}`);
    }

    // Check the status of the jobId and get the transaction details
    let txn_details;
    try {
      txn_details = await getOrderHistory(OKTO_AUTH_TOKEN, jobId, "TOKEN_TRANSFER");
      console.log("Order Details:", JSON.stringify(txn_details, null, 2));
    } catch (error: any) {
      throw new Error(`Failed to fetch order history: ${error.message}`);
    }

    return { jobId, txn_details };
  } catch (error: any) {
    console.error("Token transfer error:", error);
    throw new Error(`Token transfer failed: ${error.message}`);
  }
}