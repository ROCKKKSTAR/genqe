import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-intake-and-assignments',
  templateUrl: './intake-and-assignments.component.html',
  styleUrls: ['./intake-and-assignments.component.css'],
})
export class IntakeAndAssignmentsComponent implements OnInit {
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
