const SMS_PROVIDER = String(process.env.OTP_SMS_PROVIDER ?? '').trim().toLowerCase();
const DEFAULT_COUNTRY_CODE = String(process.env.OTP_DEFAULT_COUNTRY_CODE ?? '+91').trim();
const TWILIO_ACCOUNT_SID = String(process.env.TWILIO_ACCOUNT_SID ?? '').trim();
const TWILIO_AUTH_TOKEN = String(process.env.TWILIO_AUTH_TOKEN ?? '').trim();
const TWILIO_FROM_NUMBER = String(process.env.TWILIO_FROM_NUMBER ?? '').trim();

const normalizeDigits = (value) => String(value ?? '').replace(/\D/g, '');

const getCountryCodeDigits = () => normalizeDigits(DEFAULT_COUNTRY_CODE) || '91';

const toE164 = (mobile) => {
  const digits = normalizeDigits(mobile);
  if (!digits) return '';
  if (digits.length >= 11) return `+${digits}`;
  if (digits.length === 10) return `+${getCountryCodeDigits()}${digits}`;
  return '';
};

const isSmsEnabled = () => SMS_PROVIDER === 'twilio';

const assertTwilioConfig = () => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    throw new Error(
      'Twilio credentials are missing. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN and TWILIO_FROM_NUMBER.',
    );
  }
};

const sendTwilioSms = async ({ mobileE164, message }) => {
  assertTwilioConfig();

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const body = new URLSearchParams({
    To: mobileE164,
    From: TWILIO_FROM_NUMBER,
    Body: message,
  });

  const basicAuthToken = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuthToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const raw = await response.text();
    throw new Error(`Twilio SMS failed (${response.status}): ${raw}`);
  }

  return response.json();
};

const sendOtpSms = async ({ mobile, otp, purpose }) => {
  const mobileE164 = toE164(mobile);
  if (!mobileE164) {
    throw new Error('Mobile number is invalid for SMS delivery');
  }

  if (!isSmsEnabled()) {
    return {
      delivered: false,
      provider: 'none',
      mobileE164,
    };
  }

  const purposeLabel = purpose === 'register' ? 'registration' : 'login';
  const message = `Your SYSC ${purposeLabel} OTP is ${otp}. It will expire in 5 minutes.`;
  await sendTwilioSms({ mobileE164, message });

  return {
    delivered: true,
    provider: 'twilio',
    mobileE164,
  };
};

export { isSmsEnabled, sendOtpSms, toE164 };
