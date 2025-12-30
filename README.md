# STT Gateway (Speech-to-Text MQTT Gateway)

A lightweight Express-based gateway service that bridges audio file uploads with Whisper speech recognition and MQTT message publishing. Perfect for integrating voice assistants with home automation systems like ioBroker.

## Features

- 🎤 **Audio Upload Endpoint**: Accepts audio files via HTTP POST
- 🧠 **Whisper Integration**: Transcribes audio using OpenAI Whisper or compatible APIs
- 📡 **MQTT Publishing**: Publishes transcription results to MQTT broker
- 📊 **State Tracking**: Optional state publishing (idle/processing/error)
- 🔄 **Auto Cleanup**: Automatically removes temporary audio files
- ⚡ **Health Check**: Built-in health check endpoint

## Architecture

```
Audio Upload → STT Gateway → Whisper API → Transcription → MQTT Broker
                    ↓
               State Updates (optional)
```

## Installation

```bash
npm install
```

## Configuration

1. Copy the sample configuration:
   ```bash
   cp app.cfg.sample app.cfg
   ```

2. Edit `app.cfg` with your settings:

```ini
# Server Port
APP_PORT=3333

# MQTT Configuration
MQTT_URL=mqtt://192.168.1.100:1883
MQTT_USERNAME=mqtt                        # Optional
MQTT_PASSWORD=password                     # Optional
MQTT_TOPIC=voice/text                      # Topic for transcription results
MQTT_STATE_TOPIC=voice/state               # Topic for state updates

# Whisper Configuration
WHISPER_URL=http://localhost:9000/asr
WHISPER_AUDIO_FIELD=audio_file
WHISPER_LANGUAGE=en                        # Language code (en, uk, de, etc.)
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PORT` | `3333` | HTTP server port |
| `MQTT_URL` | `mqtt://localhost:1883` | MQTT broker URL |
| `MQTT_USERNAME` | - | MQTT authentication username (optional) |
| `MQTT_PASSWORD` | - | MQTT authentication password (optional) |
| `MQTT_TOPIC` | `voice/text` | Topic for publishing transcriptions |
| `MQTT_STATE_TOPIC` | `voice/state` | Topic for publishing state updates |
| `WHISPER_URL` | `http://localhost:9000/asr` | Whisper API endpoint |
| `WHISPER_AUDIO_FIELD` | `audio_file` | Form field name for audio file |
| `WHISPER_LANGUAGE` | `en` | Language code for transcription |
| `PUBLISH_STATE` | `true` | Enable/disable state publishing (env var) |
| `TMP_DIR` | `./tmp` | Temporary directory for uploads (env var) |

## Usage

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## API Endpoints

### POST /upload

Upload an audio file for transcription.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `audio`

**Response:**
```json
{
  "ok": true,
  "text": "transcribed text here"
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "error message"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:3333/upload \
  -F "audio=@recording.wav"
```

**Example with JavaScript:**
```javascript
const formData = new FormData();
formData.append('audio', audioBlob, 'recording.wav');

const response = await fetch('http://localhost:3333/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.text);
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "ok": true
}
```

## MQTT Topics

### Transcription Topic (default: `voice/text`)
Published when transcription is successful. Contains the transcribed text.

### State Topic (default: `voice/state`)
Published during processing lifecycle:
- `processing` - Audio is being transcribed
- `idle` - Transcription completed successfully
- `error` - An error occurred

## Whisper API Compatibility

This gateway is compatible with:
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Faster Whisper Server](https://github.com/fedirz/faster-whisper-server)
- [whisper.cpp HTTP server](https://github.com/ggerganov/whisper.cpp)
- Any Whisper-compatible API that accepts multipart form data

## Use Cases

- **Voice Assistants**: Integrate with Alexa, Google Home alternatives
- **Home Automation**: Voice control for ioBroker, Home Assistant, Node-RED
- **Transcription Services**: Audio file transcription with MQTT notifications
- **IoT Devices**: Connect microcontroller-based voice devices (ESP32, M5Stack)

## Project Structure

```
stt-gateway/
├── app/
│   ├── app.ts          # Main application
│   └── config.ts       # Configuration helper
├── build/              # Compiled JavaScript
├── tmp/                # Temporary upload directory
├── app.cfg             # Configuration file (gitignored)
├── app.cfg.sample      # Sample configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Requirements

- Node.js 16+
- MQTT Broker (Mosquitto, HiveMQ, etc.)
- Whisper API endpoint

## Troubleshooting

### MQTT Connection Issues
- Verify MQTT broker is running and accessible
- Check MQTT_URL, username, and password
- Monitor logs for `[mqtt] connected` message

### Whisper Errors
- Ensure Whisper API is running and accessible
- Verify WHISPER_URL is correct
- Check audio format compatibility
- Review Whisper logs for transcription errors

### File Upload Issues
- Ensure `tmp/` directory exists and is writable
- Check disk space
- Verify audio file format is supported

## License

MIT License

Copyright (c) 2025 Serhiy Krasovskyy xhunter74@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

