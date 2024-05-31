import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test-case-management',
  templateUrl: './test-case-management.component.html',
  styleUrls: ['./test-case-management.component.css'],
})
export class TestCaseManagementComponent implements OnInit {
  public isSidebarOpen = true;
  public loadershow = false;
  public showData: boolean;

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
