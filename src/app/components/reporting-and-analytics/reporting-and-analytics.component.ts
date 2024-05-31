import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reporting-and-analytics',
  templateUrl: './reporting-and-analytics.component.html',
  styleUrls: ['./reporting-and-analytics.component.css'],
})
export class ReportingAndAnalyticsComponent implements OnInit {
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
