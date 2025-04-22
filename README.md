## VIX Index Tracker (AWS Amplify React+Vite Application)

This repository contains a VIX index (volatility index) tracking application built with React+Vite and AWS Amplify, providing real-time monitoring and notification capabilities.

## Overview

This application extends a foundational React application integrated with AWS Amplify to implement VIX index monitoring and notification features. It leverages AWS services like Cognito, AppSync, and DynamoDB to deliver a scalable and responsive user experience for tracking market volatility.

## Features

- **Authentication**: Secure user authentication powered by Amazon Cognito
- **API**: Backend processing utilizing AWS AppSync and Lambda functions
- **Database**: User settings storage with Amazon DynamoDB
- **VIX Chart Display**: Interactive chart showing VIX index trends over the past 3 months
- **Email Notifications**:
  - One-click VIX index email delivery
  - Customizable notification preferences
- **User Settings**:
  - Daily scheduled notifications at specified times
  - Threshold-based alerts when VIX exceeds configured levels

## Deploying to AWS

For detailed instructions on deploying your application, refer to the [deployment section](https://docs.amplify.aws/react/start/quickstart/#deploy-a-fullstack-app-to-aws) of the Amplify documentation.

```bash
# Deploy backend resources
amplify push

# Deploy the entire application including frontend
amplify publish
```
