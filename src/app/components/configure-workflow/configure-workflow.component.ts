import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Konva from 'konva';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ILanguage } from 'src/app/models/language.interface';
import { IResponse } from 'src/app/models/server-data-source.model';
import { IUser } from 'src/app/models/user.interface';
import { AuthenticationService } from 'src/app/services/auth.service';
import { CommonServiceService } from 'src/app/services/common-service.service';
import { WebService } from 'src/app/services/web.service';

export interface IWorkflow {
  _id: string;
  name: string;
  description: string;
  type: Number;
  headParticipant: string;
  status: Number;
  aiPrompt: String;
  createdOn?: Date;
  createdBy?: IUser;
}

@Component({
  selector: 'app-configure-workflow',
  templateUrl: './configure-workflow.component.html',
  styleUrls: ['./configure-workflow.component.css']
})
export class ConfigureWorkflowComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() importClose = new EventEmitter<boolean>();
  @Input() workFlowDetalis: any
  public isSidebarOpen = true;
  public loadershow = false;
  public loaderMessage = "";
  public isAdvanceSearchForm = false;
  public isUpsertWorkflow = false;
  public searchText = ""
  public saveUpdateWorkflow: IWorkflow = {
    _id: "",
    name: "",
    description: "",
    type: 1,
    headParticipant: "1",
    aiPrompt: "",
    status: 1,
    createdBy: null
  }
  public dataSourceWorkflows: MatTableDataSource<IWorkflow>;
  public displayedColumns: string[] = [
    'name',
    'type',
    'headParticipant',
    'status',
    'lastModifiedOn',
    'lastModifiedBy'
  ];
  @ViewChild('exporter') exporter!: MatTableExporterDirective;
  public workflowTypes = [{ keyCode: 1, key1: "Type1" }, { keyCode: 2, key1: "Type2" }]
  public participants = [{ _id: "1", name: "Participant1" }, { _id: "2", name: "Participant2" }]
  public workflowStatus = [{ keyCode: 1, key1: "Status1" }, { keyCode: 2, key1: "Status2" }]
  private workflowModalRef: any = null;
  @ViewChild('workflowModal', { static: false }) public workflowModal: ElementRef;
  @ViewChild('docCanvas', { static: false }) container: ElementRef;
  private stage: Konva.Stage;
  private layerIndices = {
    steps: 0,
    connectors: 1,
    newStep: 2,
    tooltip: 3
  }
  public selectedShape: Konva.Group = null;
  public authenticatedUser: IUser = null
  private userSub: Subscription;
  languageSubscription: Subscription = null;
  public data: ILanguage;
  constructor(
    private modalService: NgbModal,
    private toastr: ToastrService,
    private WS: WebService,
    private cs: CommonServiceService,
    private auth: AuthenticationService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('workFlowDetalis',this.workFlowDetalis)
    this.userSub = this.auth.currentUser.subscribe((user) => {
      if (user) {
        this.authenticatedUser = user;
        this.fetchWorkflows()
      } this.loadershow = true;
      setTimeout(() => {
        this.languageSubscription = this.cs._language.subscribe((lang) => {
          this.changeLanguage(lang);
        });
      }, 100);
    });
    this.changeDetector.detectChanges()
    this.initialiseStage()
    this.createWorkflowWithAI(this.workFlowDetalis)
  }
  public changeLanguage(lang): void {
    this.data = this.cs.getLanguageData(lang);
  }
  ngAfterViewInit(): void {
    //temporarily
    // this.initialiseStage();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe()
  }

  public fetchWorkflows(keyword: string = ''): void {
    this.loaderMessage = "Fetching workflows"
    this.loadershow = true
    this.WS.post('api/master/workflow/fetch/simple', { keyword }, 'CHATBOX').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description)
        this.dataSourceWorkflows = new MatTableDataSource(res.result.workflows);
        // this.dataSourceWorkflows.sort = this.partnerSort;
        // this.dataSourceWorkflows.paginator = this.paginator;
      }
      else if (res.status === 2) {
        this.toastr.info(res.description)
      }
      else {
        this.toastr.error(res.description)
      }
      this.loadershow = false
    })
  }

  public getWorkflowById(_id: string): void {
    this.loaderMessage = "Fetching workflow"
    this.loadershow = true
    this.WS.post('api/master/workflow/fetch/id', { _id }, 'CHATBOX').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description)
        this.saveUpdateWorkflow = res.result.workflow
        this.isUpsertWorkflow = true;
        this.changeDetector.detectChanges()
        this.initialiseStage()
        for (let step of res.result.steps) {
          if (step.type === "Step") {
            switch (step.nodeType) {
              case "start":
                this.drawStart(step)
                break
              case "humanStep":
                this.drawHumanStep(step)
                break
              case "systemStep":
                this.drawSystemStep(step)
                break
              case "delay":
                this.drawDelay(step)
                break
              case "decision":
                this.drawDecision(step)
                break
              case "end":
                this.drawEnd(step)
                break
              default:
                console.log('Not able to identify step type')
                break
            }
          }
          else if (step.type === "Connector") {
            let matchFrom = this.stage.children[this.layerIndices.steps].findOne(`#${step.linkedShapes[0]}`)
            let matchTo = this.stage.children[this.layerIndices.steps].findOne(`#${step.linkedShapes[1]}`)
            if (matchFrom && matchTo) {
              this.linkShape(matchFrom, matchTo, step)
            }
          }
        }
      }
      else if (res.status === 2) {
        this.toastr.info(res.description)
      }
      else {
        this.toastr.error(res.description)
      }
      this.loadershow = false
    })
  }

  public closeNewWorkflow(): void {
    console.log('closing new workflow')
    this.isUpsertWorkflow = false
    this.fetchWorkflows()
  }

  public openWorkflowDetail(): void {
    this.workflowModalRef = this.modalService.open(this.workflowModal, {
      ariaLabelledBy: 'searchHeading', size: 'lg', backdrop: 'static'
    });
  }

  public initialiseStage(): void {
    const width = this.container.nativeElement.offsetWidth - 1;
    const height = this.container.nativeElement.offsetHeight - 1;
    this.stage = new Konva.Stage({
      container: this.container.nativeElement.id,
      width: width,
      height: height
    });
    const canvaslayer = new Konva.Layer();
    this.stage.add(canvaslayer);
    const connectorLayers = new Konva.Layer();
    this.stage.add(connectorLayers);
    const newStepLayer = new Konva.Layer();
    this.stage.add(newStepLayer);
    this.createNewStepTemplate();
    const tooltipLayer = new Konva.Layer();
    const tooltip = new Konva.Text({
      x: 50,
      y: 50,
      text: '',
      fontFamily: 'Calibri',
      fontSize: 12,
      padding: 5,
      textFill: 'white',
      fill: 'black',
      alpha: 0.75,
      visible: false
    });
    tooltipLayer.add(tooltip);
    this.stage.add(tooltipLayer);

    this.stage.children[this.layerIndices.steps].moveUp()
  }

  public createNewStepTemplate(): void {
    let group = new Konva.Group({
      draggable: false
    })
    let humanStep = new Konva.Rect({
      x: 0,
      y: 0,
      height: 12,
      width: 15,
      fill: 'gray',
      stroke: 'black',
      // strokeWidth: 1,
      shadowBlur: 10,
      opacity: 0.5
    })
    let systemStep = new Konva.Rect({
      x: 25,
      y: 0,
      height: 12,
      width: 15,
      fill: 'yellow',
      stroke: 'black',
      // strokeWidth: 1,
      shadowBlur: 10,
      opacity: 0.5
    })
    let delay = new Konva.Circle({
      x: 8,
      y: 25,
      radius: 6,
      fill: 'lightgreen',
      stroke: 'black',
      // strokeWidth: 1,
      shadowBlur: 10,
      opacity: 0.5
    })
    let end = new Konva.Circle({
      x: 26,
      y: 25,
      radius: 6,
      fill: 'red',
      stroke: 'black',
      // strokeWidth: 1,
      shadowBlur: 10,
      opacity: 0.5
    })
    group.add(humanStep)
    group.add(systemStep)
    group.add(delay)
    group.add(end)
    this.stage.children[this.layerIndices.newStep].add(group);
    this.stage.children[this.layerIndices.newStep].hide()
    this.stage.children[this.layerIndices.newStep].draw()

    humanStep.on('click', () => {
      if (this.selectedShape) {
        let initialStep = this.selectedShape
        let position = initialStep.position()
        let newStep = this.drawHumanStep({});
        this.linkShape(initialStep, newStep, {});
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    systemStep.on('click', () => {
      if (this.selectedShape) {
        let initialStep = this.selectedShape
        let position = initialStep.position()
        let newStep = this.drawSystemStep({});
        this.linkShape(initialStep, newStep, {});
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    delay.on('click', () => {
      if (this.selectedShape) {
        let initialStep = this.selectedShape
        let position = initialStep.position()
        let newStep = this.drawDelay({});
        this.linkShape(initialStep, newStep, {});
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    end.on('click', () => {
      if (this.selectedShape) {
        let initialStep = this.selectedShape
        let position = initialStep.position()
        let newStep = this.drawEnd({});
        this.linkShape(initialStep, newStep, {});
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
  }

  public closeworkflowModal(workflowFlag: boolean): void {
    this.workflowModalRef.close(workflowFlag);
  }

  public saveWorkflowDetails(): void {
    console.log('Saving workflow details', this.saveUpdateWorkflow);
  }

  public upsertWorkflow(): void {
    if (!this.stage.children[this.layerIndices.steps].children.length) {
      this.toastr.info('Could not find any workflow to save')
      return
    }
    if (this.saveUpdateWorkflow.name === "") {
      this.toastr.info('Enter name for workflow')
      // this.openWorkflowDetail()
      return
    }
    if (this.saveUpdateWorkflow.description === "") {
      this.toastr.info('Enter description for workflow')
      // this.openWorkflowDetail()
      return
    }

    // get all shapes on steps layer
    let workflowSteps = []
    let steps = this.stage.children[this.layerIndices.steps].children
    for (let step of steps) {
      workflowSteps.push({
        type: 'Step',
        x: step.getAttr('X'),
        y: step.getAttr('Y'),
        id: step.getAttr('id'),
        nodeType: step.getAttr('nodeType'),
        stepName: step.getAttr('stepName'),
        stepText: step.getAttr('stepText'),
        stepDescription: step.getAttr('stepDescription'),
        fromShapes: step.getAttr('fromShapes') ? JSON.parse(step.getAttr('fromShapes')) : [],
        toShapes: step.getAttr('toShapes') ? JSON.parse(step.getAttr('toShapes')) : [],
        connectors: step.getAttr('connectors') ? JSON.parse(step.getAttr('connectors')) : [],
        formFields: step.getAttr('formFields') ? JSON.parse(step.getAttr('formFields')) : []
      })
    }

    let connectors = this.stage.children[this.layerIndices.connectors].children
    for (let connector of connectors) {
      workflowSteps.push({
        type: 'Connector',
        stroke: connector.getAttr('stroke'),
        id: connector.getAttr('id'),
        // fill: connector.getAttr('fill'),
        nodeType: connector.getAttr('nodeType'),
        points: connector.getAttr('points'),
        linkedShapes: connector.getAttr('linkedShapes') ? JSON.parse(connector.getAttr('linkedShapes')) : [],
      })
    }
    this.WS.post('api/master/workflow/upsert', {
      workflow: this.saveUpdateWorkflow,
      steps: workflowSteps
    }, 'CHATBOX').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.saveUpdateWorkflow._id = res.result._id
        this.saveUpdateWorkflow.createdOn = res.result.createdOn
        this.saveUpdateWorkflow.createdBy = res.result.createdBy
        this.toastr.success(res.description)
      }
      else if (res.status === 2) {
        this.toastr.info(res.description)
      }
      else {
        this.toastr.error(res.description)
      }
    })
  }

  private getStepProp(props): void {
    let steps = this.stage.children[this.layerIndices.steps].children
    props.stepNumber = steps.length + 1
    props.isAllowed = true
    props.x = props.x ? props.x : (50 + steps.length * 200 + 42) // props.x ? props.x : 50
    props.y = props.y ? props.y : 50 // props.x ? props.y : 50

    if (steps.length) {
      for (const step of steps) {
        if (step.getAttr('nodeType') === "start" && props.nodeType === "start" || step.getAttr('nodeType') === "end" && props.nodeType === "end") {
          props.isAllowed = false
        }
        // if (["delay", "start"].includes(step.getAttr('nodeType'))) {
        //   if (step.getAttr('X') + 100 > props.x) {
        //     props.x = step.getAttr('X') + 125
        //     props.y = step.getAttr('Y') - 25
        //   }
        // }
        // else if (["humanStep", "systemStep"].includes(step.getAttr('nodeType'))) {
        //   if (step.getAttr('X') + 100 > props.x) {
        //     props.x = step.getAttr('X') + 170
        //     props.y = step.getAttr('Y')
        //   }
        // }
      }
      // props.x = steps.length * 200 + 42
      // if (["end", "delay"].includes(props.nodeType)) {
      //   props.x -= 42
      //   props.y -= 42
      // }
    }

    if (props.x + 180 > this.stage.getAttr('width')) {
      this.stage.setAttr('width', this.stage.getAttr('width') + 180)
    }
  }

  public drawStart(props): Konva.Group {
    props.nodeType = 'start'
    this.getStepProp(props)
    if (!props.isAllowed) {
      this.toastr.info('Cannot have more than one start')
      return;
    }
    let group = new Konva.Group({
      draggable: true,
      x: props.x,
      y: props.y,
      stroke: props.stroke ? props.stroke : 'black',
      strokeWidth: props.strokeWidth ? props.strokeWidth : 1,
      id: props.id ? props.id : `step-${props.stepNumber + 1}`,
      nodeType: props.nodeType,
      stepName: props.stepName ? props.stepName : 'Start',
      stepText: props.stepText ? props.stepText : 'Start',
      stepDescription: props.stepDescription ? props.stepDescription : '',
      formFields: props.formFields ? props.formFields : JSON.stringify([])
    })
    // let rect = new Konva.Rect({
    //   x: -42,
    //   y: -42,
    //   width: 130,
    //   height: 84,
    //   stroke: 'black',
    //   strokeWidth: 0,
    //   fill: 'transparent',
    // })
    let circle = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 42,
      fill: 'blue',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10
    })
    const stepName = new Konva.Text({
      x: -42,
      y: 50,
      text: group.getAttr('stepText'),
      fontSize: 15,
      width: 84,
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Montserrat'
    });
    // group.add(rect)
    group.add(circle)
    group.add(stepName)
    this.selectedShape = group
    this.stage.children[this.layerIndices.steps].add(group)
    this.stage.children[this.layerIndices.steps].draw()

    this.bindCommonEvents(group)
    group.on('click', () => {
      this.selectedShape = group
      if (this.stage.children[this.layerIndices.newStep].isVisible()) {
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
      else {
        let position = group.position()
        for (let shape of this.stage.children[this.layerIndices.newStep].children) {
          shape.setAttr('X', position.x + circle.getAttr('radius') + 15)
          shape.setAttr('Y', position.y + (circle.getAttr('radius') / 2) - 35)
        }
        this.stage.children[this.layerIndices.newStep].show()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    return group
  }

  public drawEnd(props): Konva.Group {
    props.nodeType = 'end'
    this.getStepProp(props)
    if (!props.isAllowed) {
      this.toastr.info('Cannot have more than one end')
      return;
    }
    let group = new Konva.Group({
      draggable: true,
      x: props.x,
      y: props.y,
      id: props.id ? props.id : `step-${props.stepNumber + 1}`,
      nodeType: props.nodeType,
      stepName: props.stepName ? props.stepName : 'End',
      stepText: props.stepText ? props.stepText : 'End',
      stepDescription: props.stepDescription ? props.stepDescription : '',
      formFields: props.formFields ? props.formFields : JSON.stringify([])
    })
    let circle = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 42,
      fill: 'red',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10
    })
    const stepName = new Konva.Text({
      x: -42,
      y: 50,
      text: group.getAttr('stepText'),
      fontSize: 15,
      width: 84,
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Montserrat'
    });
    group.add(circle)
    group.add(stepName)
    this.selectedShape = group
    this.stage.children[this.layerIndices.steps].add(group)
    this.stage.children[this.layerIndices.steps].draw()

    this.bindCommonEvents(group)
    group.on('click', () => {
      this.selectedShape = group
    })
    return group
  }

  public drawHumanStep(props): Konva.Group {
    props.nodeType = 'humanStep'
    this.getStepProp(props)
    let group = new Konva.Group({
      draggable: true,
      x: props.x,
      y: props.y,
      id: props.id ? props.id : `step-${props.stepNumber + 1}`,
      nodeType: props.nodeType,
      stepName: props.stepName ? props.stepName : `Step ${props.stepNumber + 1}`,
      stepText: props.stepText ? props.stepText : 'Human Step',
      stepDescription: props.stepDescription ? props.stepDescription : '',
      formFields: props.formFields ? props.formFields : JSON.stringify([])
    })
    let circle = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 42,
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10,
      visible: false
    })
    let rect = new Konva.Rect({
      x: -35,
      y: -25,
      height: 50,
      width: 70,
      fill: 'gray',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10
    })
    const stepName = new Konva.Text({
      x: -42,
      y: 50,
      text: group.getAttr('stepText'),
      fontSize: 15,
      width: 84,
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Montserrat'
    });
    group.add(rect)
    group.add(circle)
    group.add(stepName)
    this.selectedShape = group
    this.stage.children[this.layerIndices.steps].add(group)
    this.stage.children[this.layerIndices.steps].draw()
    this.bindCommonEvents(group)
    group.on('click', () => {
      this.selectedShape = group
      if (this.stage.children[this.layerIndices.newStep].isVisible()) {
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
      else {
        let position = group.position()
        for (let shape of this.stage.children[this.layerIndices.newStep].children) {
          shape.setAttr('X', position.x + circle.getAttr('radius') + 15)
          shape.setAttr('Y', position.y + (circle.getAttr('radius') / 2) - 35)
        }
        this.stage.children[this.layerIndices.newStep].show()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    return group;
  }

  public drawSystemStep(props): Konva.Group {
    props.nodeType = 'systemStep'
    this.getStepProp(props)
    let group = new Konva.Group({
      draggable: true,
      x: props.x,
      y: props.y,
      id: props.id ? props.id : `step-${props.stepNumber + 1}`,
      nodeType: props.nodeType,
      stepName: props.stepName ? props.stepName : `Step ${props.stepNumber + 1}`,
      stepText: props.stepText ? props.stepText : 'System Text',
      stepDescription: props.stepDescription ? props.stepDescription : '',
      formFields: props.formFields ? props.formFields : JSON.stringify([])
    })
    let circle = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 42,
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10,
      visible: false
    })
    let rect = new Konva.Rect({
      x: -35,
      y: -25,
      height: 50,
      width: 70,
      fill: 'yellow',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10
    })
    const stepName = new Konva.Text({
      x: -42,
      y: 50,
      text: group.getAttr('stepText'),
      fontSize: 15,
      width: 84,
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Montserrat'
    });
    group.add(rect)
    group.add(circle)
    group.add(stepName)
    this.selectedShape = group
    this.stage.children[this.layerIndices.steps].add(group)
    this.stage.children[this.layerIndices.steps].draw()
    this.bindCommonEvents(group)
    group.on('click', () => {
      this.selectedShape = group
      if (this.stage.children[this.layerIndices.newStep].isVisible()) {
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
      else {
        let position = group.position()
        for (let shape of this.stage.children[this.layerIndices.newStep].children) {
          shape.setAttr('X', position.x + circle.getAttr('radius') + 15)
          shape.setAttr('Y', position.y + (circle.getAttr('radius') / 2) - 35)
        }
        this.stage.children[this.layerIndices.newStep].show()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    return group;
  }

  public drawDelay(props): Konva.Group {
    props.nodeType = 'delay'
    this.getStepProp(props)
    let group = new Konva.Group({
      draggable: true,
      x: props.x,
      y: props.y,
      id: props.id ? props.id : `step-${props.stepNumber + 1}`,
      nodeType: props.nodeType,
      stepName: props.stepName ? props.stepName : `Step ${props.stepNumber + 1}`,
      stepText: props.stepText ? props.stepText : 'Delay',
      stepDescription: props.stepDescription ? props.stepDescription : '',
      formFields: props.formFields ? props.formFields : JSON.stringify([])
    })
    let circle = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 42,
      fill: 'lightgreen',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10
    })
    let hour = new Konva.Line({
      x: 0,
      y: 0,
      points: [0, 0, 25, 0],
      stroke: 'black',
      strokeWidth: 2,
    })
    let minute = new Konva.Line({
      x: 0,
      y: 0,
      points: [0, 0, 0, -35],
      stroke: 'black',
      strokeWidth: 2,
    })
    const stepName = new Konva.Text({
      x: -42,
      y: 50,
      text: group.getAttr('stepText'),
      fontSize: 15,
      width: 84,
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Montserrat'
    });
    group.add(circle)
    group.add(hour)
    group.add(minute)
    group.add(stepName)
    this.selectedShape = group
    this.stage.children[this.layerIndices.steps].add(group)
    this.stage.children[this.layerIndices.steps].draw()

    this.bindCommonEvents(group)
    group.on('click', () => {
      this.selectedShape = group
      if (this.stage.children[this.layerIndices.newStep].isVisible()) {
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
      else {
        let position = group.position()
        for (let shape of this.stage.children[this.layerIndices.newStep].children) {
          shape.setAttr('X', position.x + circle.getAttr('radius') + 15)
          shape.setAttr('Y', position.y + (circle.getAttr('radius') / 2) - 35)
        }
        this.stage.children[this.layerIndices.newStep].show()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    return group;
  }

  public drawDecision(props): Konva.Group {
    props.nodeType = 'decisioon'
    this.getStepProp(props)
    let group = new Konva.Group({
      draggable: true,
      x: props.x,
      y: props.y,
      id: props.id ? props.id : `step-${props.stepNumber + 1}`,
      nodeType: props.nodeType,
      stepName: props.stepName ? props.stepName : `Step ${props.stepNumber + 1}`,
      stepText: props.stepText ? props.stepText : 'Decision',
      stepDescription: props.stepDescription ? props.stepDescription : '',
      formFields: props.formFields ? props.formFields : JSON.stringify([])
    })
    let circle = new Konva.Circle({
      x: 0,
      y: 0,
      radius: 42,
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 1,
      shadowBlur: 10,
      visible: false
    })
    let rect = new Konva.Rect({
      x: 0,
      y: -35,
      height: 50,
      width: 50,
      fill: 'green',
      stroke: 'black',
      rotationDeg: 45,
      strokeWidth: 1,
      shadowBlur: 10
    })
    const stepName = new Konva.Text({
      x: -42,
      y: 50,
      text: group.getAttr('stepText'),
      fontSize: 15,
      width: 84,
      align: 'center',
      fontStyle: 'bold',
      fontFamily: 'Montserrat'
    });
    group.add(rect)
    group.add(circle)
    group.add(stepName)
    this.selectedShape = group
    this.stage.children[this.layerIndices.steps].add(group)
    this.stage.children[this.layerIndices.steps].draw()
    this.bindCommonEvents(group)
    group.on('click', () => {
      this.selectedShape = group
      if (this.stage.children[this.layerIndices.newStep].isVisible()) {
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
      else {
        let position = group.position()
        for (let shape of this.stage.children[this.layerIndices.newStep].children) {
          shape.setAttr('X', position.x + circle.getAttr('radius') + 15)
          shape.setAttr('Y', position.y + (circle.getAttr('radius') / 2) - 35)
        }
        this.stage.children[this.layerIndices.newStep].show()
        this.stage.children[this.layerIndices.newStep].draw()
      }
    })
    return group;
  }

  public bindCommonEvents(group: Konva.Group): void {
    group.on('dragstart', () => {
      this.selectedShape = group
      this.stage.children[this.layerIndices.newStep].hide()
      this.stage.children[this.layerIndices.newStep].draw()
    })
    group.on('dragmove', () => {
      // get all to shapes and drag them
      let toShapes = group.getAttr('toShapes')

      if (toShapes) {
        toShapes = JSON.parse(toShapes)
        for (let shape of toShapes) {
          let matchShape = this.stage.children[this.layerIndices.steps].findOne(`#${shape}`)
          if (matchShape) {
            let points = this.getConnectorPoints(group.position(), matchShape.position())
            let connector = this.stage.children[this.layerIndices.connectors].findOne(`#${group.getAttr('id')}-${matchShape.getAttr('id')}-connector`)
            if (connector) {
              connector.setAttr('points', points)
            }
          }
        }
      }

      // get all to shapes and drag them
      let fromShapes = group.getAttr('fromShapes')
      if (fromShapes) {
        fromShapes = JSON.parse(fromShapes)
        for (let shape of fromShapes) {
          let matchShape = this.stage.children[this.layerIndices.steps].findOne(`#${shape}`)
          if (matchShape) {
            let points = this.getConnectorPoints(matchShape.position(), group.position())
            let connector = this.stage.children[this.layerIndices.connectors].findOne(`#${matchShape.getAttr('id')}-${group.getAttr('id')}-connector`)
            if (connector) {
              connector.setAttr('points', points)
            }
          }
        }
      }

      if (fromShapes || toShapes) {
        this.stage.children[this.layerIndices.connectors].draw()
      }

      // let points = this.getConnectorPoints(this.stage.children[this.layerIndices.steps].children[this.layerIndices.steps].position(), this.stage.children[this.layerIndices.steps].children[this.layerIndices.connectors].position())
      // this.stage.children[this.layerIndices.connectors].children[this.layerIndices.steps].setAttr('points', points)
      // console.log(points)
      // this.stage.children[this.layerIndices.connectors].draw()
    })
  }

  public linkShape(shape1, shape2, props): void {
    let points = this.getConnectorPoints(shape1.position(), shape2.position())
    let connect = new Konva.Arrow({
      stroke: props.stroke ? props.stroke : 'black',
      id: props.id ? props.id : `${shape1.getAttr('id')}-${shape2.getAttr('id')}-connector`,
      fill: props.fill ? props.fill : 'black',
      nodeType: 'connect',
      points: props.points ? props.points : points,
      linkedShapes: JSON.stringify([shape1.getAttr('id'), shape2.getAttr('id')])
    })
    let shape1Connectors = shape1.getAttr('connectors')
    let toShapes = shape1.getAttr('toShapes')
    if (shape1Connectors) {
      shape1Connectors = JSON.parse(shape1Connectors)
    }
    else {
      shape1Connectors = []
    }
    if (toShapes) {
      toShapes = JSON.parse(toShapes)
    }
    else {
      toShapes = []
    }
    toShapes.push(shape2.getAttr('id'))
    shape1Connectors.push(connect.getAttr('id'))
    shape1.setAttr('connectors', JSON.stringify(shape1Connectors))
    shape1.setAttr('toShapes', JSON.stringify(toShapes))

    let shape2Connectors = shape2.getAttr('connectors')
    let fromShapes = shape2.getAttr('fromShapes')
    if (shape2Connectors) {
      shape2Connectors = JSON.parse(shape1Connectors)
    }
    else {
      shape2Connectors = []
    }
    if (fromShapes) {
      fromShapes = JSON.parse(fromShapes)
    }
    else {
      fromShapes = []
    }
    fromShapes.push(shape1.getAttr('id'))
    shape2Connectors.push(connect.getAttr('id'))
    shape2.setAttr('connectors', JSON.stringify(shape2Connectors))
    shape2.setAttr('fromShapes', JSON.stringify(fromShapes))

    this.stage.children[this.layerIndices.connectors].add(connect)
    this.stage.children[this.layerIndices.connectors].draw()
  }

  private getConnectorPoints(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    let angle = Math.atan2(-dy, dx);

    const radius = 42;

    return [
      from.x + -radius * Math.cos(angle + Math.PI),
      from.y + radius * Math.sin(angle + Math.PI),
      to.x + -radius * Math.cos(angle),
      to.y + radius * Math.sin(angle),
    ];
  }

  public setShapeAttribute(newValue, field): void {
    this.selectedShape.setAttr(field, newValue)
    if (field === 'stepText') {
      for (let child of this.selectedShape.children) {
        if (child.className === 'Text') {
          child.setAttr('text', newValue)
        }
      }
      this.stage.children[this.layerIndices.steps].draw()
    }
  }

  public reverseLink(): void {
    // swap the (x1, y1) and (x2, y2) 
  }

  public deleteShape(): void {
    // Add confirmation to delete step here

    if (this.selectedShape) {
      if (this.stage.children[this.layerIndices.newStep].isVisible()) {
        this.stage.children[this.layerIndices.newStep].hide()
        this.stage.children[this.layerIndices.newStep].draw()
      }
      let connectors = this.selectedShape.getAttr('connectors')
      if (connectors) {
        connectors = JSON.parse(connectors)
        for (let connector of connectors) {
          let matchConnector = this.stage.children[this.layerIndices.connectors].findOne(`#${connector}`)
          if (matchConnector) {
            // Delink this shape from connected shapes
            let connectedShapes = matchConnector.getAttr('linkedShapes')
            if (connectedShapes) {
              connectedShapes = JSON.parse(connectedShapes)
              connectedShapes = connectedShapes.filter(s => s !== this.selectedShape.getAttr('id'))
              for (let shape of connectedShapes) {
                let matchShape = this.stage.children[this.layerIndices.steps].findOne(`#${shape}`)
                if (matchShape) {
                  let matchShapeConnectors = matchShape.getAttr('connectors')
                  if (matchShapeConnectors) {
                    matchShapeConnectors = JSON.parse(matchShapeConnectors)
                    matchShapeConnectors = matchShapeConnectors.filter(s => s !== matchConnector.getAttr('id'))
                    matchShape.setAttr('connectors', JSON.stringify(matchShapeConnectors))
                  }
                  let toShapes = matchShape.getAttr('toShapes')
                  if (toShapes) {
                    toShapes = JSON.parse(toShapes)
                    toShapes = toShapes.filter(s => s !== this.selectedShape.getAttr('id'))
                    matchShape.setAttr('toShapes', JSON.stringify(toShapes))
                  }

                  let fromShapes = matchShape.getAttr('fromShapes')
                  if (fromShapes) {
                    fromShapes = JSON.parse(fromShapes)
                    fromShapes = fromShapes.filter(s => s !== this.selectedShape.getAttr('id'))
                    matchShape.setAttr('toShapes', JSON.stringify(fromShapes))
                  }
                }
              }
            }
            matchConnector.destroy()
          }
        }
        this.stage.children[this.layerIndices.connectors].draw()
      }
      this.selectedShape.destroy()
      this.stage.children[this.layerIndices.steps].draw()
      this.selectedShape = null;
    }
  }

  public validateWorkflow(): void { }

  public startNewWorkflow(): void {
    this.saveUpdateWorkflow = {
      _id: "",
      name: "",
      description: "",
      type: 1,
      headParticipant: "1",
      aiPrompt: "",
      status: 1
    }
    this.isUpsertWorkflow = true;
    this.changeDetector.detectChanges()
    this.initialiseStage()
  }

  onCloseWorkFlow(){
    this.importClose.emit(true);
  }

  public createWorkflowWithAI(flowData: any): void {
    // console.log('this.workFlowDetalis', this.workFlowDetalis)
    // check if there is already any workflow drawn on UI
    // let steps = this.stage.children[this.layerIndices.steps].children.length
    // if (steps) {
    //   this.toastr.info("Delete the existing workflow to start a new workflow")
    //   return
    // }
    // if (this.saveUpdateWorkflow.aiPrompt === "") {
    //   this.toastr.info("Enter a prompt to generate a new workflow")
    //   return
    // }

    this.WS.post('api/master/workflow/create/ai', {
          flowStepId: flowData._id,
        }, 'CHATBOX').subscribe((res: IResponse) => {
      if (res.status === 1) {
        this.toastr.success(res.description);
        for (let step of res.result.workflow) {
          let shape = null
          if (step.type === "START") {
            shape = this.drawStart({
              stepName: step.name,
              stepText: step.text,
              stepDescription: step.description,
              formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
            })
          }
          else if (step.type === "HUMAN STEP") {
            shape = this.drawHumanStep({
              stepName: step.name,
              stepText: step.text,
              stepDescription: step.description,
              formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
            })
          }
          else if (step.type === "SYSTEM STEP") {
            shape = this.drawSystemStep({
              stepName: step.name,
              stepText: step.text,
              stepDescription: step.description,
              formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
            })
          }
          else if (step.type === "DELAY") {
            shape = this.drawDelay({
              stepName: step.name,
              stepText: step.text,
              stepDescription: step.description,
              formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
            })
          }
          else if (step.type === "DECISION") {
            shape = this.drawDecision({
              stepName: step.name,
              stepText: step.text,
              stepDescription: step.description,
              formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
            })
          }
          else if (step.type === "END") {
            shape = this.drawEnd({
              stepName: step.name,
              stepText: step.text,
              stepDescription: step.description,
              formFields: step.formFields ? JSON.stringify(step.formFields) : JSON.stringify([])
            })
          }
          if (shape) {
            step.shapeID = shape.getAttr('id')
          }
        }
        for (let i = 0; i < res.result.workflow.length - 1; i++) {
          if (res.result.workflow[i + 1]) {
            let shape1 = this.stage.children[this.layerIndices.steps].findOne(`#${res.result.workflow[i].shapeID}`)
            let shape2 = this.stage.children[this.layerIndices.steps].findOne(`#${res.result.workflow[i + 1].shapeID}`)
            this.linkShape(shape1, shape2, {})
          }
        }
        this.selectedShape = null
      }
      else if (res.status === 2) {
        this.toastr.info(res.description)
      }
      else {
        this.toastr.error(res.description)
      }
    })
  }
}
