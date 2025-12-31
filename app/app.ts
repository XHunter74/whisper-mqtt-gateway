import express, { Request, Response } from "express";
import multer from "multer";
import fs from "fs";
import FormData from "form-data";
import fetch, { Response as FetchResponse } from "node-fetch";
import mqtt, { IClientOptions, MqttClient } from "mqtt";
import { ConfigHelper } from "./config";

type WhisperJson = {
    text?: string;
    [k: string]: unknown;
};

const app = express();
const config = new ConfigHelper();

// Whisper
const WHISPER_TASK = "transcribe";

// Optional: publish state
const PUBLISH_STATE = (process.env.PUBLISH_STATE || "true").toLowerCase() === "true";

// ---------- Multer ----------
const upload = multer({ dest: process.env.TMP_DIR || "./tmp" });

// ---------- MQTT ----------
const mqttOptions: IClientOptions = {};
if (config.MqttUserName) mqttOptions.username = config.MqttUserName;
if (config.MqttPassword) mqttOptions.password = config.MqttPassword;

let mqttClient: MqttClient = mqtt.connect(config.MqttUrl, mqttOptions);

mqttClient.on("connect", () => console.log("[mqtt] connected"));
mqttClient.on("reconnect", () => console.log("[mqtt] reconnecting..."));
mqttClient.on("error", (err) => console.error("[mqtt] error:", err.message));

function publishState(state: string) {
    if (!PUBLISH_STATE) return;
    mqttClient.publish(config.MqttStateTopic, state, { qos: 0, retain: false });
}

// ---------- Helpers ----------
async function safeJson(r: FetchResponse): Promise<WhisperJson> {
    const txt = await r.text();
    try {
        return JSON.parse(txt) as WhisperJson;
    } catch {
        return { text: txt.trim() };
    }
}

// ---------- Route ----------
app.post("/upload", upload.single("audio"), async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ ok: false, error: "No file field 'audio' provided" });
    }

    const filePath = file.path;

    publishState("processing");

    try {
        // 1) Prepare multipart form for Whisper
        const form = new FormData();

        // audio file
        form.append(
            config.WhisperAudioField,
            fs.createReadStream(filePath),
            {
                filename: file.originalname || "audio.wav",
                contentType: file.mimetype || "audio/wav",
            }
        );

        // 2) Send to Whisper
        const actionUrl =`${config.WhisperUrl}?task=${WHISPER_TASK}&language=${config.WhisperLanguage}&output=json`;
        const whisperResp = await fetch(actionUrl, {
            method: "POST",
            body: form as any,
            headers: form.getHeaders() as any,
        });

        if (!whisperResp.ok) {
            const body = await whisperResp.text();
            throw new Error(`Whisper error ${whisperResp.status}: ${body}`);
        }

        const data = await safeJson(whisperResp);
        const text = (data.text ?? "").toString().trim();

        // 3) Publish to MQTT
        if (text.length > 0) {
            mqttClient.publish(config.MqttTopic, text, { qos: 0, retain: false });
        }

        publishState("idle");

        return res.json({ ok: true, text });
    } catch (e) {
        publishState("error");
        console.error("[gateway] error:", e);
        return res.status(500).json({ ok: false, error: String(e) });
    } finally {
        // cleanup temp file
        if(!config.DeleteTempFiles) return;

        try {
            fs.unlinkSync(filePath);
        }
        catch {
            /* ignore */
        }
    }
});

app.get("/health", (_req: any, res: any) => res.json({ ok: true }));

app.listen(config.AppPort, () => {
    console.log(`[gateway] listening on :${config.AppPort}`);
    console.log(`[gateway] whisper: ${config.WhisperUrl}`);
    console.log(`[gateway] mqtt: ${config.MqttUrl}, topic: ${config.MqttTopic}`);
});
