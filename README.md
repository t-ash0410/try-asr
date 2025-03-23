# try-asr

A demo project to try out Google Speech to Text API for speech recognition.

## Setup

### Prerequisites

- Go 1.21 or higher
- Bun
- Google Cloud Platform account
- gcloud CLI

### Google Cloud Platform Setup

1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Speech to Text API
4. Run `gcloud auth application-default login`

## Running the Application

To start the development environment, run the following command:

```bash
make dev
```

This command will start the following services:

- Backend server (Go)
- Frontend development server (Bun)

To stop the services, press `Ctrl+C`.
