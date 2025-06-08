import { NextResponse } from "next/server";
import { transferToken } from "../tokenTransfer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caip2Id, recipient, token, amount, sessionConfig, feePayerAddress } = body;

    // Validate payload
    if (!caip2Id || !recipient || amount == null || !sessionConfig) {
      return NextResponse.json({ error: "Missing required fields: caip2Id, recipient, amount, or sessionConfig" }, { status: 400 });
    }
    if (!sessionConfig.userSWA || !sessionConfig.sessionPrivKey || !sessionConfig.sessionPubKey) {
      return NextResponse.json({ error: "Invalid session configuration: missing userSWA, sessionPrivKey, or sessionPubKey" }, { status: 400 });
    }

    // Call transferToken
    const result = await transferToken(
      { caip2Id, recipient, token, amount },
      sessionConfig,
      feePayerAddress
    );

    return NextResponse.json({
      status: "success",
      jobId: result.jobId,
      txn_details: result.txn_details,
      message: `Transfer submitted! Job ID: ${result.jobId}`,
    });
  } catch (err: any) {
    console.error("Token transfer API error:", err);
    return NextResponse.json(
      { error: err.message || "Token transfer failed", details: err?.response?.data || err.stack },
      { status: 500 }
    );
  }
}