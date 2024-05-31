// recording.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];

  constructor() {
    this.mediaRecorder = null; 
   }

  startRecording(stream: MediaStream): void {
    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);
    
    this.mediaRecorder.ondataavailable = (event) => {
      this.recordedChunks.push(event.data);
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
      this.saveRecording(blob);
    };

    this.mediaRecorder.start();
  }

  stopRecording(): void {
    this.mediaRecorder!.stop();
  }

  private saveRecording(blob: Blob): void {
    // Handle saving or processing the recorded audio
    console.log("Recording saved:", blob);
  }
}
