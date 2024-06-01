import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-planning',
  templateUrl: './test-planning.component.html',
  styleUrls: ['./test-planning.component.css'],
})
export class TestPlanningComponent implements OnInit {
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
