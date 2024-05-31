import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-train-new-model',
  templateUrl: './train-new-model.component.html',
  styleUrls: ['./train-new-model.component.css'],
})
export class TrainNewModelComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoplayer: ElementRef;
  @ViewChild('myVideo') videoPlayer: ElementRef;
  isPlay: boolean = false;
  public isSidebarOpen = true;
  public loadershow = false;
  public showData: boolean;
  currentScreen = 'selectProcessType';

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  showQueryForm() {
    if (!this.showData) {
      this.showData = true;
    } else {
      this.showData = false;
    }
  }
  public switchScreen(screen): void {
    this.currentScreen = screen;
  }
  toggleVideo(event: any) {
    this.videoplayer.nativeElement.play();
  }
  playVideo() {
    var myVideo: any = document.getElementById('my_video_1');
    myVideo.play();
  }
  pauseVideo() {
    var myVideo: any = document.getElementById('my_video_1');
    myVideo.pause();
  }
  stopVideo() {
    var myVideo: any = document.getElementById('my_video_1');
    myVideo.currentTime = 0;
    myVideo.pause();
  }

  skip(value) {
    let video: any = document.getElementById('my_video_1');
    video.currentTime += value;
  }

  restart() {
    let video: any = document.getElementById('my_video_1');
    video.currentTime = 0;
  }
  requestFullScreen() {
    const elem = this.elementRef.nativeElement.querySelector('#my_video_1');

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      /* IE11 */
      elem.msRequestFullscreen();
    }
  }
}
