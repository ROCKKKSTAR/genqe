import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-execution',
  templateUrl: './test-execution.component.html',
  styleUrls: ['./test-execution.component.css'],
})
export class TestExecutionComponent implements OnInit {
  public isSidebarOpen = true;
  public loadershow = false;
  public showData: boolean;
loaderMessage: any;

  constructor() {}

  ngOnInit(): void {}

  showQueryForm() {
    if (!this.showData) {
      this.showData = true;
    } else {
      this.showData = false;
    }
  }
}
