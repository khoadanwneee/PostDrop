import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { OAuth2Client } from 'google-auth-library';

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;
const port = Number(process.env.GMAIL_OAUTH_PORT || 53682);

if (!clientId || !clientSecret) {
  throw new Error(
    'Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in backend/.env first',
  );
}
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('GMAIL_OAUTH_PORT must be an integer from 1024 to 65535');
}

const redirectUri = `http://127.0.0.1:${port}/oauth2/callback`;
const oauth = new OAuth2Client(clientId, clientSecret, redirectUri);
const state = randomBytes(24).toString('base64url');
const authorizationUrl = oauth.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'openid',
    'email',
    'https://www.googleapis.com/auth/gmail.send',
  ],
  state,
});

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', redirectUri);
    if (url.pathname !== '/oauth2/callback') {
      response.writeHead(404).end('Not found');
      return;
    }
    if (url.searchParams.get('state') !== state) {
      response.writeHead(400).end('OAuth state mismatch');
      return;
    }
    const code = url.searchParams.get('code');
    if (!code) {
      response
        .writeHead(400)
        .end(`Google authorization failed: ${url.searchParams.get('error') || 'missing code'}`);
      return;
    }

    const { tokens } = await oauth.getToken(code);
    response
      .writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      .end('PostDrop Gmail authorization succeeded. Return to the terminal.');

    if (!tokens.refresh_token) {
      throw new Error(
        'Google did not return a refresh token; revoke the app grant and retry',
      );
    }
    console.log('\nAdd this secret to backend/.env and do not share it:\n');
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);
    server.close();
  } catch (error) {
    response.writeHead(500).end('OAuth token exchange failed');
    console.error(
      error instanceof Error ? error.message : 'OAuth token exchange failed',
    );
    server.close();
    process.exitCode = 1;
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`\nOpen this URL and authorize your FIT Google account:\n`);
  console.log(`${authorizationUrl}\n`);
  console.log(`Waiting for Google to redirect to ${redirectUri} ...`);
});
