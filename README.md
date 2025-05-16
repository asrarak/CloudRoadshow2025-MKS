# CloudRoadshow2025-MKS

Capture a webpage (asrarabukhair.com) as PDF

Store the PDF in Google Cloud Storage

Be triggered by Cloud Scheduler

1. Create gcs Bucket
gsutil mb -p YOUR_PROJECT_ID -l us-central1 gs://your-bucket-name/

2. Deploy cloud function
gcloud functions deploy scheduledReport \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --entry-point=scheduledReport \
  --trigger-http \
  --allow-unauthenticated \
  --memory=512MB \
  --timeout=60s \
  --set-env-vars="SMTP_USER=your_smtp2go_user,SMTP_PASS=your_smtp2go_pass,EMAIL_TO=to@example.com,EMAIL_FROM=from@example.com"

3. Cloud Scheduler
gcloud scheduler jobs create http daily-pdf-job \
  --schedule="0 7 * * *" \
  --http-method=GET \
  --uri="https://REGION-PROJECT.cloudfunctions.net/scheduledReport" \
  --timezone="Asia/Makassar" \
  --oidc-service-account-email="YOUR_SA@YOUR_PROJECT.iam.gserviceaccount.com"


