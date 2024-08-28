import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-proctor',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './proctor.component.html',
  styleUrls: ['./proctor.component.scss']
})
export class ProctorComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef;
  mediaRecorder: any;
  recordedChunks: any[] = [];
  mediaStream: MediaStream | null = null;
  visibilityChangeListener: (() => void) | null = null;
  isRecording: boolean = false;

  ngOnInit() {
    this.applyBlurEffect(); // Apply blur when the page loads
    this.startMonitoringTabSwitch();
  }

  startVideoSession() {
    this.isRecording = true;
    this.removeBlurEffect(); // Remove blur when starting the recording

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        this.mediaStream = stream;
        this.videoElement.nativeElement.srcObject = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event: any) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        this.mediaRecorder.start();
      })
      .catch(error => {
        this.showWarning('Camera or microphone not accessible.');
        this.isRecording = false;
      });

    this.checkMediaDevices();
  }

  checkMediaDevices() {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoInput = devices.find(device => device.kind === 'videoinput');
        const audioInput = devices.find(device => device.kind === 'audioinput');

        if (!videoInput) {
          this.showWarning('No video input device found.');
        }

        if (!audioInput) {
          this.showWarning('No audio input device found.');
        }
      })
      .catch(error => {
        this.showWarning('Error accessing media devices.');
      });
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'recorded-session.webm';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        // Stop all tracks in the media stream
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(track => track.stop());
        }

        // Clear warnings and stop monitoring tab switches
        this.clearWarnings();
        this.stopMonitoringTabSwitch();

        this.applyBlurEffect(); // Apply blur when recording is stopped
        this.isRecording = false;
      };
    }
  }

  applyBlurEffect() {
    document.body.classList.add('blur-background');
  }

  removeBlurEffect() {
    document.body.classList.remove('blur-background');
  }

  startMonitoringTabSwitch() {
    this.visibilityChangeListener = () => {
      if (document.hidden) {
        this.showWarning('Tab switch detected.');
      }
    };
    document.addEventListener('visibilitychange', this.visibilityChangeListener);
  }

  stopMonitoringTabSwitch() {
    if (this.visibilityChangeListener) {
      document.removeEventListener('visibilitychange', this.visibilityChangeListener);
      this.visibilityChangeListener = null;
    }
  }

  showWarning(message: string) {
    const warningDiv = document.getElementById('warnings');
    if (warningDiv) {
      const warningMessage = document.createElement('div');
      warningMessage.className = 'alert alert-warning';
      warningMessage.innerText = message;
      warningDiv.appendChild(warningMessage);
    }
  }

  clearWarnings() {
    const warningDiv = document.getElementById('warnings');
    if (warningDiv) {
      warningDiv.innerHTML = '';
    }
  }
}
