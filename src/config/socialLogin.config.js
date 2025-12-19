import { OAuth2Client } from 'google-auth-library';


const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error(`Google token verification failed: ${error.message}`);
  }
};

export {
  googleClient,
  verifyGoogleToken,
};
