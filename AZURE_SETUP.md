# Azure App Service Configuration for Standalone Build

After deploying the application with the standalone build, you need to configure the Azure App Service startup command.

## Configuration Steps

1. **Navigate to Azure Portal**
   - Go to [Azure Portal](https://portal.azure.com)
   - Select your App Service: `apostatus`

2. **Update Startup Command**
   - Go to **Configuration** → **General Settings**
   - Set **Startup Command** to:
     ```bash
     node server.js
     ```
   - Click **Save**

3. **Verify Configuration**
   - Go to **Overview** → **Restart** the App Service
   - Wait for the application to start
   - Test the application URL: `https://apostatus-a7bsbyggbcbzhvb5.germanywestcentral-01.azurewebsites.net`

## Testing Checklist

After configuration, verify:

- [ ] Application starts successfully
- [ ] Homepage loads correctly
- [ ] Images load correctly (e.g., `/ApoStatus_Logo.png`)
- [ ] Dashboard is accessible
- [ ] All routes work as expected
- [ ] Database connections are working
- [ ] Authentication works (if configured)

## Troubleshooting

If the application doesn't start:

1. **Check Application Logs**
   - Go to **Monitoring** → **Log stream**
   - Look for startup errors

2. **Verify Environment Variables**
   - Check that `DATABASE_URL` is properly set
   - Check that `PORT` environment variable is set (usually `8080` or `80`)

3. **Check Deployment Package**
   - Ensure the deployment package includes:
     - `server.js` file
     - `.next/static/` directory
     - `public/` directory

## Benefits of Standalone Build

✅ **Deployment Size**: Reduced from ~600MB to ~150MB (80-90% reduction)
✅ **Deployment Speed**: Faster uploads, downloads, and extraction
✅ **Cold Start**: Faster application startup
✅ **Cost**: Lower bandwidth and storage costs
✅ **Reliability**: Only includes necessary runtime dependencies

## Rollback Instructions

If you need to rollback to the previous deployment method:

1. Revert the changes in `next.config.ts` and `.github/workflows/main_apostatus.yml`
2. Push the changes to trigger a new deployment
3. Remove the custom startup command in Azure App Service (leave it empty)

## Authentication (Microsoft Entra ID)

Auth.js uses an Entra ID app registration for login.

1. **Register the app**
   - Entra ID → App registrations → New registration.
   - Supported account types: single tenant (this organization only).
2. **Add redirect URIs** (platform: Web):
   - `http://localhost:3000/api/auth/callback/microsoft-entra-id` (local dev)
   - `https://<prod-host>/api/auth/callback/microsoft-entra-id` (production)
3. **Create a client secret**
   - Certificates & secrets → New client secret → copy the value immediately.
4. **Collect values into env**
   - `AUTH_MICROSOFT_ENTRA_ID_ID` = Application (client) ID
   - `AUTH_MICROSOFT_ENTRA_ID_SECRET` = the secret value
   - `AUTH_MICROSOFT_ENTRA_ID_ISSUER` = `https://login.microsoftonline.com/<Directory (tenant) ID>/v2.0`
   - `AUTH_SECRET` = output of `npx auth secret` (or `openssl rand -base64 33`)
5. **Set the same values in Azure App Service**
   - Configuration → Application settings → add all four `AUTH_*` keys → Save.
   - `auth.ts` sets `trustHost: true` so Auth.js trusts the App Service reverse
     proxy's Host header. If you prefer config over code, set
     `AUTH_TRUST_HOST=true` (or `AUTH_URL=https://<prod-host>`) as an App Setting
     instead — without one of these, production sign-in fails with `UntrustedHost`.
