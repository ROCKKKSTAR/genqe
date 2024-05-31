import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { MatTableDataSource } from '@angular/material/table';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';
import { IResponse } from 'src/app/models/server-data-source.model';
import { ToastrService } from 'ngx-toastr';
import { HttpParams } from '@angular/common/http';
import {
  IApplication,
  IprojectContact,
  IprojectDetails,
  IprojectDocuments,
  IprojectTask,
  ILinkedActs,
  ITestProjects,
} from 'src/app/models/project.interface';
interface Message {
  user: 'user' | 'bot';
  text: string;
  documents?: DocumentItem[];
  documentUrl?: string;
  fileName?: string;
  textToCopy?: string;
  conversationID?: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
}

interface DocumentItem {
  signedURL: string;
  fileName: string;
}

@Component({
  selector: 'app-project-assistant',
  templateUrl: './project-assistant.component.html',
  styleUrls: ['./project-assistant.component.css'],
  queries: {
    automaticScroll: new ViewChild('automaticScroll'),
  },
})
export class ProjectAssistantComponent implements OnInit {
  @ViewChild('msgInput') msgInput: ElementRef;
  public isSidebarOpen = true;
  public dropdownSettingsFileType: IDropdownSettings = {};
  public caseNumberList = [];
  public projectList = [];
  // public caseNumber: any;
  public loadershow = false;
  public loader = false;
  public userMessage: string = '';
  automaticScroll: ElementRef;
  newMessageAdded: boolean = false;
  selectedCaseNumber: string = '';
  public regenerateOption: boolean = false;
  public stopGenerationOption: boolean = false;

  messages: Message[] = [];
  contentHeight: any;
  caseData: any;
  dataSourceBookings: MatTableDataSource<unknown>;
  caseDescription: any;
  caseStatus: any;
  query: any;
  answer: any;
  formattedResponse: string;
  selectedFile: any;
  selectedCaseDetails: any;
  newCaseFile: string;
  public projectData: IprojectDetails[] = [];
  selectedProjectName: any;
  projectDescription: any;
  projectCategory: any;
  selectedProjectDetails: any;
  selectedProject: IprojectDetails;

  constructor(
    private WS: WebService,
    private toastr: ToastrService,
    private cs: CommonServiceService // private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.dropdownSettingsFileType = {
      singleSelection: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      idField: 'id',
      textField: 'text',
      allowSearchFilter: true,
    };
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

  // sendMessage() {}
  onFileChange(data) {
    console.log(data);
    this.selectedFile = data.target.files[0];
  }

  UploadCaseDocuments() {
    this.loadershow=true
    if (this.selectedCaseNumber === '') {
      this.toastr.info("Please select a case")
    } else {
      // this.loaderMessage="Uploading Document"
      // const fileTypeValue = this.filleTypes.filter(item => {
      //   if (item.keyCode == this.selectedFileType) {
      //     return item.key1
      //   }
      // })
      const formData: FormData = new FormData();
      formData.append('file', this.selectedFile);
      // console.log("file details: ", this.selectedFile)

      const caseDetailDTO = {
        caseID: this.selectedCaseDetails._id,
        fileId: this.selectedCaseDetails.fileId,
        filingNumber: this.selectedCaseDetails.filingNumber,
        caseNumber: this.selectedCaseDetails.caseNumber,
        caseName: this.selectedCaseDetails.caseName,
        cnrNumber: this.selectedCaseDetails.cnrNumber, //"66778",
        subject: this.selectedCaseDetails.subject, //"XYZ",
        stage: this.selectedCaseDetails.stage,//"ABC",
        jurisdictionDistrict: this.selectedCaseDetails.jurisdictionDistrict,
        jurisdictionState: this.selectedCaseDetails.jurisdictionState,
        labels: this.selectedCaseDetails.labels,
        billingCurrency: this.selectedCaseDetails.billingCurrency,
        court: this.selectedCaseDetails.court,
        nextHearing: this.selectedCaseDetails.nextHearing,
        disposalDate: this.selectedCaseDetails.disposalDate,
        lastUpdatedOn: this.selectedCaseDetails.lastUpdatedOn, //this.lastUpdatedOn,
        createdOn: this.selectedCaseDetails.createdOn, //this.createdOn,
        bench: this.selectedCaseDetails.bench,
        createdBy: this.selectedCaseDetails.createdBy.name, //this.createdBy,
        caseDescription: this.selectedCaseDetails.caseDescription,
        plaintiff: this.selectedCaseDetails.plaintiff,
        defendant: this.selectedCaseDetails.defendant,
        docType: 1,
        docTypeVal: 1,
        fileType: 1,
        fileTypeVal: 1
      };

      // const caseDetailDTO = this.caseInputFields

      // console.log('Input: ', caseDetailDTO);
      formData.append('caseDetailDTO', JSON.stringify(caseDetailDTO));

      const httpParams = new HttpParams().set(
        'data',
        JSON.stringify(caseDetailDTO)
      );
      const prevBaseUrl = this.WS.BASE_URL;
      this.WS.BASE_URL = '';
      this.WS.post('http://3.108.242.79:8081/api/case/docs/upload', formData, {
        params: httpParams,
        responseType: 'text',
        reportProgress: true,
        observe: 'events',
      } as any).subscribe(
        (response: any) => {
          console.log('Upload event:', response);
          this.WS.BASE_URL = prevBaseUrl; //'http://localhost:3000/'

          if (response.status === 1) {
            if (response.data.status == 'Completed') {
              this.loadershow=false
              // this.newResearchDocument = false;
              // this.fetchCaseDocuments()
              console.log(response.data.docId);
              this.toastr.info("Document Upload complete")
              // console.log(this.caseID);
              this.WS.BASE_URL = prevBaseUrl; //'http://localhost:3000/'
              this.newCaseFile = response.data.docId;
              // this.WS.post(
              //   'v1/chatbox/summaryAssistant',
              //   {
              //     caseID: this.caseID,
              //     docId: response.data.docId,
              //     requiredOutput: this.caseInputFields.requiredOutput,
              //     caseDescription: this.caseInputFields.caseDescription,
              //   },
              //   'CHATBOX'
              // ).subscribe((res: IResponse) => {
              //   if (res.status === 1) {
              //     this.loadershow=false
              //     this.loadDocumentData(res.result.caseDocumentUpdate1)
              //     this.toastr.success(res.description);
              //     this.fetchCaseDocuments();
              //     // this.fetchSubmittedCaseDocuments();
              //     this.newResearchDocument = false;
              //   } else if (res.status === 2) {
              //     this.toastr.info(res.description);
              //     this.loadershow=false
              //   } else {
              //     this.toastr.error(res.description);
              //     this.loadershow=false
              //   }
              //   this.loadershow = false;
              // });
            } else {
              this.toastr.info('File upload is in progress');
              this.loadershow=false
              // this.newResearchDocument = false;
              // this.fetchCaseDocuments()
            }
            // call the legalAI

          } else if (response.status === 0) {
            this.loadershow=false
            // this.fetchCaseDocuments()
            // this.newResearchDocument=false
            this.toastr.info(response.message);
          }
        },
        (error) => {
          console.error('Error uploading document:', error);
          this.loadershow=false
          // Handle any errors
        }
      );
      
      this.WS.BASE_URL = prevBaseUrl; //'http://localhost:3000/';
      console.log(this.WS.BASE_URL);
    }
  }

  clearChat() {
    // console.log("on clearing chat: ", this.messages)
    this.caseDescription = '';
    this.caseStatus = '';
    this.selectedCaseNumber = '';
    this.messages = [];
    this.msgInput.nativeElement.focus();
  }

  public fetchCases(keyword: any) {
    // this.loadershow = true;
    // this.showCases = true;
    // this.advanceSearch = false;
    // this.loaderMessage = 'Loading Cases...';
    if (keyword.length > 2) {
      this.WS.post(
        'v1/chatbox/project-data/fetchprojects',
        { keyword },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          // this.simpleSearch = '';
          this.projectData = res.result as IprojectDetails[];
          // console.log("project list: ", this.projectData)
          // this.caseData = res.result;
          // this.caseNumberList = this.caseData.map(
          //   (caseItem) => caseItem.caseNumber
          // );
          this.projectList = this.projectData
          .filter(projectItem => projectItem.projectName.toLowerCase().includes(keyword.toLowerCase()))
          .map(projectItem => projectItem.projectName);
          
          console.log('case number: ', this.projectList);
          // this.packageProductData = res.result;
          // this.mapGlobalSettingsOnData();
          // this.loadershow = false;
          // this.updateLocalisation();
          // console.log('requiredOutput: ', this.requiredOutput);
          this.toastr.success(res.description);
          this.dataSourceBookings = new MatTableDataSource(this.projectList);
          console.log('Table data: ', this.dataSourceBookings.filteredData);
          // this.linkCaseList = this.dataSourceBookings.filteredData.map(
          //   (item) => ({ caseName: item.caseName, id: item._id })
          // );
          // console.log('the cases list: ', this.linkCaseList);
        } else if (res.status === 2) {
          // this.loadershow = false;
          this.toastr.info(res.description);
        } else {
          // this.loadershow = false;
          this.toastr.error(res.description);
        }
      });
    } else {
      this.projectList = [];
    }
  }

  selectProject(selectedProjectName: any) {
    // Find the corresponding object in caseData array
    console.log(this.projectData);
    this.selectedProjectName = selectedProjectName;
    this.selectedProject = this.projectData.find(
      (projectItem) => projectItem.projectName == selectedProjectName
    );
    console.log("selected project: ", this.selectedProject)
    // this.selectedProjectDetails = selectedProject[0]
    // console.log(2, this.selectedProjectDetails)
    // Autofill the other fields
    if (this.selectedProject) {
      // Assign other fields to corresponding variables
      // For example:
      this.projectDescription = this.selectedProject.description;
      this.projectCategory = this.selectedProject.category;
      console.log('selected case: ', this.projectDescription, this.projectCategory);
      this.projectList = [];
    }
  }

  public assistantCalling() {
    // this.loadershow = true;
    // this.showCases = true;
    // this.advanceSearch = false;
    // this.loaderMessage = 'Loading Cases...';
    this.WS.post(
      'v1/chatbox/legalAssistant',
      {
        caseNumber: this.selectedCaseNumber,
        query: this.query,
      },
      'CHATBOX'
    ).subscribe((res: IResponse) => {
      if (res.status === 1) {
        // this.simpleSearch = '';

        this.answer = res.result.answer;
      } else if (res.status === 2) {
        // this.loadershow = false;
        this.toastr.info(res.description);
      } else {
        // this.loadershow = false;
        this.toastr.error(res.description);
      }
    });
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
      console.log('In send Message: ', this.selectedProjectName);
      this.WS.post(
        // 'api/chatbox/v1/query/search',
        'v1/chatbox/projectAssistant/chat',
        {
          // newDocSolarID: this.newCaseFile || '',
          projectID: this.selectedProject._id, //22878,
          query: this.userMessage,
          // docType: this.FileTypesName,
        },
        'CHATBOX'
      ).subscribe((res: IResponse) => {
        if (res.status === 1) {
          // console.log(this.FileTypesName);
          this.stopGenerationOption = false;
          this.regenerateOption = true;
          // console.log('hi', res.result.stuffResult.text);

          // this.formattedResponse = res.result.htmlContent;
          this.formattedResponse = res.result.htmlContent;
          // Simulate bot reply
          // console.log("documents: ", res.result.documents)
          this.messages.push({
            user: 'bot',
            text: this.formattedResponse,
            // documents: res.result.documents.map((doc: any) => ({
            //   signedURL: doc.signedUrl,
            //   fileName: doc.fileName
            // })),
            // documents: res.result.documents,
            // text: this.getBotReply(res.result.htmlContent),
            // documentUrl: res.result.signedUrl,
            // fileName: res.result.fileName,
            textToCopy: res.result.answer,
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

  tokenCaseNumberSuggestionIndex = -1;

  toggleThumbsUp(message: Message) {
    this.WS.post(
      'api/chatbox/legalAssistant/conversation/upvote',
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
      'api/chatbox/legalAssistant/conversation/upvote',
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

  onTokenCaseNumberInputKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
        this.tokenCaseNumberSuggestionIndex = Math.max(
          this.tokenCaseNumberSuggestionIndex - 1,
          -1
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        this.tokenCaseNumberSuggestionIndex = Math.min(
          this.tokenCaseNumberSuggestionIndex + 1,
          this.caseNumberList.length - 1
        );
        event.preventDefault();
        break;
      case 'Enter':
        if (this.tokenCaseNumberSuggestionIndex >= 0) {
          this.selectProject(
            this.caseNumberList[this.tokenCaseNumberSuggestionIndex]
          );
          (event.currentTarget as HTMLElement).blur();
        }
        break;
    }
  }

}
