import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-defects',
  templateUrl: './defects.component.html',
  styleUrls: ['./defects.component.css'],
})
export class DefectsComponent implements OnInit {
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
