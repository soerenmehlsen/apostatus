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
