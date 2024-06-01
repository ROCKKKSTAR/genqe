import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-train-model',
  templateUrl: './train-model.component.html',
  styleUrls: ['./train-model.component.css'],
})
export class TrainModelComponent implements OnInit {
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
