import {
  Component,
  HostListener,
  OnInit,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
//import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-screen-recording',
  templateUrl: './screen-recording.component.html',
  styleUrls: ['./screen-recording.component.css'],
})
export class ScreenRecordingComponent implements OnInit {
  screenStream: MediaStream | null = null;
  isScreenSharing = false;
  isPaused: boolean = false;
  isRecording = false;
  mediaRecorder: any | null = null; // Change MediaRecorder type to 'any' temporarily
  recordedChunks: Blob[] = [];
  pauseButtonText: string = 'Pause';
  recordingDuration: number = 0;
  timer: any;
  @Input() fileName: any;
  showScreenRecord: any=false;

  constructor(private cdr: ChangeDetectorRef,private toastr: ToastrService,) {}

  ngOnInit(): void {
    this.startSharingScreen();
  }

  recordingStartedAudio: HTMLAudioElement = new Audio(
    'assets/recording_inprogress.mp3'
  );
  recordingStoppedAudio: HTMLAudioElement = new Audio(
    'assets/recording_stopped.mp3'
  );
  recordingPauseddAudio: HTMLAudioElement = new Audio(
    'assets/recording_paused.mp3'
  );
  recordingResumedAudio: HTMLAudioElement = new Audio(
    'assets/resume_Recording.mp3'
  );

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.isScreenSharing) {
      if (event.altKey && event.key === 'r') {
        this.startRecording();
      } else if (this.isRecording) {
        if (event.altKey && event.key === 'p') {
          this.pauseRecording();
        } else if (event.altKey && event.key === 's') {
          this.stopRecording();
        }
      }
    }
  }

  async startSharingScreen() {
    try {
      const mediaDevices = navigator.mediaDevices as any;
      if (this.screenStream) {
        // Stop the previous screen sharing
        this.stopSharingScreen();
      }

      this.screenStream = await mediaDevices?.getDisplayMedia({ video: true });
      if(this.screenStream){
        this.isScreenSharing = true;
        this.showScreenRecord=true
      }
      else{
        this.toastr.info("Unable to share Screen")
        this.showScreenRecord=false
      }
    } catch (error) {
      console.log('Error sharing screen:', error);
      this.toastr.info(error)
    }
  }

  stopSharingScreen() {
    if (this.screenStream) {
      // Stop the screen sharing
      const tracks = this.screenStream.getTracks();
      tracks.forEach((track) => track.stop());
      this.screenStream = null;
      this.isScreenSharing = false;
    }
  }

  async startRecording() {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (!audioStream) throw new Error('Permission denied for microphone');
      this.isRecording = true;
      this.recordingStartedAudio.play();
      this.timer = setInterval(() => {
        this.recordingDuration++;
      }, 1000);
      if (!this.screenStream) throw new Error('Screen stream not available');
      if (this.screenStream.active) {
        const combinedStream = new MediaStream();
        audioStream
          .getAudioTracks()
          .forEach((track) => combinedStream.addTrack(track));
        const audioTracksFromScreen = this.screenStream.getAudioTracks();
        if (audioTracksFromScreen.length > 0) {
          audioTracksFromScreen.forEach((track) =>
            combinedStream.addTrack(track)
          );
        }
        const videoTracks = this.screenStream.getVideoTracks();
        if (videoTracks.length > 0) {
          combinedStream.addTrack(videoTracks[0]);
        } else {
          console.error('Video track not found in screen stream');
          return;
        }
        const mimeType = 'video/mp4';
        this.mediaRecorder = this.createRecorder(combinedStream, mimeType);
      } else {
        console.error('Screen sharing stopped. Recording will not start.');
        this.stopRecording();
        this.stopSharingScreen();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }

  createRecorder(stream: MediaStream, mimeType: string): any {
    // Change MediaRecorder type to 'any' temporarily
    const mediaRecorder = new (window as any).MediaRecorder(stream); // Add 'window as any' to access MediaRecorder
    const recordedChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e: any) => {
      // Change 'e' type to 'any'
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = async () => {
      await this.saveAndSendRecording(recordedChunks);
    };

    mediaRecorder.start(200);
    return mediaRecorder;
  }

  async saveAndSendRecording(recordedChunks: Blob[]) {
    try {
      const blob = new Blob(recordedChunks, { type: 'video/mp4' });
      const filename = this.fileName;
      if (filename.trim() !== '') {
        this.saveFile(blob, filename);
        // Reset recordedChunks
        recordedChunks = [];
        // Show "Share Screen" button and hide other buttons
        this.isScreenSharing = false;
        this.isRecording = false;
        this.isPaused = false;
      } else {
        const confirmation = confirm(
          'Are you sure you want to discard the recording?'
        );
        if (!confirmation) {
          return;
        }
      }

      // Refresh the component
      this.refreshComponent();
    } catch (error) {
      console.error('Error saving and sending recording:', error);
    }
  }

  refreshComponent() {
    // Manually trigger change detection to refresh the component
    this.cdr.detectChanges();
  }

  saveFile(blob: Blob, filename: string) {
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `${filename}.mp4`;
    downloadLink.click();
    URL.revokeObjectURL(URL.createObjectURL(blob)); // Clear from memory
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      clearInterval(this.timer);
      this.recordingDuration = 0;
      this.recordingStoppedAudio.play();
      this.stopSharingScreen();
    }
  }

  pauseRecording() {
    if (this.mediaRecorder) {
      if (!this.isPaused) {
        this.mediaRecorder.pause();
        clearInterval(this.timer);
        this.isPaused = true;
        this.pauseButtonText = 'Resume';
        this.recordingPauseddAudio.play();
      } else {
        this.mediaRecorder.resume();
        this.timer = setInterval(() => {
          this.recordingDuration++;
        }, 1000);
        this.isPaused = false;
        this.pauseButtonText = 'Pause';
        this.recordingResumedAudio.play();
      }
    }
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
