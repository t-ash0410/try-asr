# try-asr

A demo project to try out Google Speech to Text API for speech recognition.

## Project Structure

```txt
.
├── go/                 # Backend server (Go)
│   └── app/           # Application code
├── ts/                # Frontend application
│   └── frontend/      # React application
└── .certs/            # SSL certificates and credentials
```

## Setup

### Prerequisites

- Go 1.21 or higher
- Bun
- Google Cloud Platform account
- gcloud CLI

### Development Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/try-asr.git
   cd try-asr
   ```

2. Install dependencies:

   ```bash
   # Install Go dependencies
   cd go
   go mod download
   cd ..

   # Install frontend dependencies
   cd ts/frontend
   bun install
   cd ../..
   ```

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

## Troubleshooting

### Common Issues

1. **Speech to Text API not working**
   - Ensure you have enabled the Speech to Text API in your GCP project
   - Check if you have sufficient quota and billing enabled
   - Verify your gcloud authentication is active

2. **Frontend not connecting to backend**
   - Check if both servers are running
   - Verify the backend URL in the frontend configuration
   - Check browser console for any CORS errors
