import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { WebService } from 'src/app/services/web.service';
import { IResponse } from 'src/app/models/server-data-source.model';
import { AuthenticationService } from 'src/app/services/auth.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';

interface DocumentItem {
  signedURL: string;
  fileName: string;
}

interface Message {
  user: 'user' | 'bot';
  text: string;
  documents?:  DocumentItem[];
  documentUrl?: string;
  fileName?: string;
  textToCopy?: string;
  conversationID?: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
}

@Component({
  selector: 'app-chatbox-loungeCheckin-assistant',
  templateUrl: './chatbox-loungeCheckin-assistant.component.html',
  styleUrls: ['./chatbox-loungeCheckin-assistant.component.css']
})
export class ChatboxLoungeCheckinAssistantComponent implements OnInit {

  @ViewChild('msgInput') msgInput: ElementRef;
  public dropdownSettingsFileType: IDropdownSettings = {};
  public regenerateOption: boolean = false;
  public stopGenerationOption: boolean = false;
  formattedResponse;
  public isSidebarOpen = true;
  public loader = false;
  messages: Message[] = [];
  userMessage: string = '';
  public FileTypes = ['AI Docs', 'Card'];
  public FileTypesName: any;
  fileTypeData = [];
  automaticScroll: ElementRef;
  // isClicked: boolean = false;
  // isClickedDown: boolean = false;
  contentHeight;
  newMessageAdded: boolean = false;
  constructor(
    private WS: WebService,
    private auth: AuthenticationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // this.msgInput.nativeElement.focus();
    this.dropdownSettingsFileType = {
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      idField: 'id',
      textField: 'text',
      allowSearchFilter: true,
    };
    this.FileTypesName = [
      'Partner Admission Instructions',
      'LMS Admission Instructions',
    ];
    this.chatboxFileTypes();
    console.log(this.FileTypesName);
  }

  ngAfterViewChecked() {
    if (this.newMessageAdded) {
      if (
        this.contentHeight != this.automaticScroll.nativeElement.scrollHeight &&
        this.automaticScroll.nativeElement.scrollHeight !=
          this.automaticScroll.nativeElement.scrollTop +
            this.automaticScroll.nativeElement.offsetHeight
      ) {
        this.automaticScroll.nativeElement.scrollTo(
          0,
          this.automaticScroll.nativeElement.scrollHeight
        );
      }
      this.newMessageAdded = false;
    }
  }

  clearChat() {
    this.messages = [];
    this.msgInput.nativeElement.focus();
  }
  public chatboxFileTypes(): void {
    this.WS.post('api/chatbox/v1/fetchDocs', {}, 'CHATBOX').subscribe(
      (res: IResponse) => {
        if (res.status === 1) {
          if (res.result.length) {
            this.FileTypes = res.result;
            console.log(this.FileTypes);
          }
        }
      }
    );
  }

  sendMessage() {
    this.regenerateOption = false;
    this.stopGenerationOption = true;
    this.newMessageAdded = true;
    if (this.userMessage.trim() !== '') {
      this.loader = true;
      this.messages.push({
        user: 'user',
        text: this.userMessage,
        documentUrl: '1',
      });
      this.WS.post(
        'api/chatbox/v1/query/search',
        {
          query: this.userMessage,
          docType: this.FileTypesName,
        },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          console.log(this.FileTypesName);
          this.stopGenerationOption = false;
          this.regenerateOption = true;
          // console.log('hi', res.result.stuffResult.text);
          this.formattedResponse = res.result.htmlContent;
          // Simulate bot reply
          console.log("documents: ", res.result.documents)
          this.messages.push({
            user: 'bot',
            text: this.formattedResponse,
            documents: res.result.documents.map((doc: any) => ({
              signedURL: doc.signedUrl,
              fileName: doc.fileName
            })),
            // documents: res.result.documents,
            // text: this.getBotReply(res.result.htmlContent),
            // documentUrl: res.result.signedUrl,
            // fileName: res.result.fileName,
            textToCopy: res.result.stuffResult.text,
            conversationID: res.result.conversationID,
            isUpvoted: false,
            isDownvoted: false,
          });
          
          this.newMessageAdded = true;
          console.log(this.messages);
          this.loader = false;
        } else {
          this.toastr.info(res.description);
        }
      });
      this.userMessage = '';
    }
  }

  predefinedQuestions(event: any) {
    // Get the text content of the clicked div
    this.userMessage = event.target.textContent || event.srcElement.textContent;

    // Call the sendMessage function
    this.sendMessage();
  }
  // export class ThumbsUpComponent {
  // isClicked: boolean = false;

  toggleThumbsUp(message: Message) {
    this.WS.post(
      'api/chatbox/conversation/upvote',
      {
        voteID: message.conversationID,
        upvote: true,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        if (message.isDownvoted === true) {
          message.isUpvoted = !message.isUpvoted;
          message.isDownvoted = !message.isDownvoted;
        } else {
          message.isUpvoted = !message.isUpvoted;
        }
      }
    });
  }

  toggleThumbsDown(message: Message) {
    this.WS.post(
      'api/chatbox/conversation/upvote',
      {
        voteID: message.conversationID,
        upvote: false,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        if (message.isUpvoted === true) {
          message.isUpvoted = !message.isUpvoted;
          message.isDownvoted = !message.isDownvoted;
        } else {
          message.isDownvoted = !message.isDownvoted;
        }
      }
    });
  }

  copyTextToClipboard(event: any, text: string) {
    const icon = event.target;

    if ('clipboard' in navigator) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log('Text copied to clipboard');
          // You can optionally provide a success message or perform additional actions
          icon.classList.add('fa-check'); // Add the tick icon to the clicked icon
          setTimeout(() => {
            icon.classList.remove('fa-check'); // Remove the tick icon after a short delay
          }, 2000); // Adjust the delay duration as needed (1000 milliseconds = 1 second)
        })
        .catch((err) => {
          console.error('Could not copy text: ', err);
          // You can handle the error or provide a fallback method here
        });
    } else {
      console.error('Clipboard API not supported');
      // Provide a fallback method for unsupported browsers
      // For example, you could prompt the user to copy the text manually.
    }
  }

  // copyTextToClipboard(text: string) {
  //   const icon = document.querySelector('.fa.fa-clipboard-list') as HTMLElement;
  //   if ('clipboard' in navigator) {
  //     navigator.clipboard
  //       .writeText(text)
  //       .then(() => {
  //         console.log('Text copied to clipboard');
  //         // You can optionally provide a success message or perform additional actions
  //         icon.classList.add('fa-check'); // Add the tick icon
  //         setTimeout(() => {
  //           icon.classList.remove('fa-check'); // Remove the tick icon after a short delay
  //         }, 2000); // Adjust the delay duration as needed (1000 milliseconds = 1 second)
  //       })
  //       .catch((err) => {
  //         console.error('Could not copy text: ', err);
  //         // You can handle the error or provide a fallback method here
  //       });
  //   } else {
  //     console.error('Clipboard API not supported');
  //     // Provide a fallback method for unsupported browsers
  //     // For example, you could prompt the user to copy the text manually.
  //   }
  // }

  getBotReply(userMessage: string): string {
    // You can implement your logic to generate bot replies here
    // For simplicity, I'll provide a static reply
    // return 'Hello! You said: ' + userMessage;
    return userMessage;
  }
}
