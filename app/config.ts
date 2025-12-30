import * as dotenv from 'dotenv';
import * as fs from 'fs';

export class ConfigHelper {
    private readonly envConfig: { [key: string]: string };

    constructor() {
        let filePath = 'app.cfg';
        fs.statSync(filePath);
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    get(key: string): string {
        return this.envConfig[key];
    }

    get MqttUserName(): string {
        return this.envConfig.MQTT_USERNAME;
    }

    get MqttPassword(): string {
        return this.envConfig.MQTT_PASSWORD;
    }

    get MqttUrl(): string {
        return this.envConfig.MQTT_URL || 'mqtt://localhost:1883';
    }

    get MqttTopic(): string {
        return this.envConfig.MQTT_TOPIC || 'voice/text';
    }

    get MqttStateTopic(): string {
        return this.envConfig.MQTT_STATE_TOPIC || 'voice/state';
    }

    get WhisperUrl(): string {
        return this.envConfig.WHISPER_URL || 'http://localhost:9000/asr';
    }

    get WhisperAudioField(): string {
        return this.envConfig.WHISPER_AUDIO_FIELD || 'audio_file';
    }

    get WhisperLanguage(): string {
        return this.envConfig.WHISPER_LANGUAGE || 'en';
    }

    get AppPort(): number {
        return Number(this.envConfig.APP_PORT || '3333');
    }
}