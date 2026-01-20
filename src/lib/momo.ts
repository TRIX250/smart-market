
export async function getMoMoToken() {
    const userId = process.env.MOMO_API_USER;
    const apiKey = process.env.MOMO_API_KEY;
    const subscriptionKey = process.env.MOMO_PRIMARY_KEY;
    const env = process.env.MOMO_TARGET_ENV || 'sandbox';

    if (!userId || !apiKey || !subscriptionKey) {
        throw new Error("Missing MoMo Credentials");
    }

    // 1. Create Basic Auth Header
    const basicAuth = Buffer.from(`${userId}:${apiKey}`).toString('base64');

    // 2. Request Token
    const url = `https://${env}.momodeveloper.mtn.com/collection/token/`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("MoMo Token Error:", res.status, errorText);
            throw new Error(`Failed to get token: ${res.statusText}`);
        }

        const data = await res.json();
        return data.access_token;
    } catch (error) {
        console.error("MoMo Token Exception:", error);
        // Fallback for demo if API fails (Optional, but good for stability during dev)
        // throw error; 
        return null;
    }
}

export async function requestToPay(amount: number, phoneNumber: string) {
    const token = await getMoMoToken();
    if (!token) throw new Error("Could not retrieve MoMo Token");

    const subscriptionKey = process.env.MOMO_PRIMARY_KEY;
    const env = process.env.MOMO_TARGET_ENV || 'sandbox';
    const url = `https://${env}.momodeveloper.mtn.com/collection/v1_0/requesttopay`;
    const uuid = crypto.randomUUID();

    // Sandbox environment often requires EUR currency
    const currency = env === 'sandbox' ? 'EUR' : 'RWF';

    const body = {
        amount: amount.toString(),
        currency: currency,
        externalId: uuid,
        payer: {
            partyIdType: "MSISDN",
            partyId: phoneNumber
        },
        payerMessage: "Payment for SmartMarket",
        payeeNote: "Subscription"
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-Reference-Id': uuid,
            'X-Target-Environment': env,
            'Ocp-Apim-Subscription-Key': subscriptionKey!,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("RequestToPay Error:", res.status, errorText);
        return { success: false, error: errorText };
    }

    // 202 Accepted means it's processing
    return { success: true, referenceId: uuid };
}
