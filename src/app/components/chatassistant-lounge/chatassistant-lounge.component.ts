import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IResponse } from 'src/app/models/server-data-source.model';
import { GeolocationService } from 'src/app/services/geoloaction.service';
import { WebService } from 'src/app/services/web.service';

@Component({
  selector: 'app-chatassistant-lounge',
  templateUrl: './chatassistant-lounge.component.html',
  styleUrls: ['./chatassistant-lounge.component.css']
})
export class ChatassistantLoungeComponent implements OnInit {
  @ViewChild('msgInput') msgInput: ElementRef;

  userQuestion = '';
  botResponse = '';
  public isSidebarOpen = true;
  messages: Message[] = [];
  userMessage: string = '';
  public loader = false;
  latitude;
  longitude;
  mylatitude;
  mylongitude;
  destination;
  origin;
  dir=undefined;

  constructor(
    private WS: WebService,
    private geolocationService: GeolocationService
  ) { }

  ngOnInit(): void {   
    this.getLocation();

  }

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("position", position)
          this.mylatitude = position.coords.latitude;
          this.mylongitude = position.coords.longitude;
          console.log(`Latitude: ${this.mylatitude}, Longitude: ${this.mylongitude}`);
        },
        (error) => {
          console.error(`Geolocation error: ${error.message}`);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

 
  public sendQuestion(): void {
    this.messages.push({
      user: 'user',
      text: this.userMessage,
      documentUrl: '1',
    });
    this.WS.post('api/chatbox/conversation/questions', {
      prompt: this.userMessage,
    }, 'CHATBOX').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.botResponse = res.result.response;
      //   this.userMessages.push(this.userQuestion);
      // this.botMessages.push(this.botResponse);
      this.messages.push({
        user: 'bot',
        text: this.botResponse
      })

      this.userMessage=''
      }else if(res.status===2){
        this.longitude=res.result.loungeFind[0].pointLocation.coordinates[0]
        this.latitude=res.result.loungeFind[0].pointLocation.coordinates[1]
        this.dir = {
          origin: { lat:this.mylatitude, lng:this.mylongitude },
          destination: { lat: res.result.loungeFind[0].pointLocation.coordinates[1], lng: res.result.loungeFind[0].pointLocation.coordinates[0] }
        }
  

        // this.origin = { latitude: res.result.latitude, longitude: res.result.longitude };
        // this.destination = { latitude: res.result.latitude, longitude: res.result.longitude };
      
        this.messages.push({
          user: 'maps',
          text:''
        })
        this.userMessage=''
      }
    });
  }

  clearChat() {
    this.messages = [];
    this.msgInput.nativeElement.focus();
  }

}


interface Message {
  user: 'user' | 'bot' | 'maps';
  text: string;
  documentUrl?: string;
  fileName?: string;
  textToCopy?: string;
  conversationID?: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
}
