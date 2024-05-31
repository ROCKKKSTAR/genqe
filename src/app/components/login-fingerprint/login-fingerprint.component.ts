import { Component, OnInit } from '@angular/core';
import { FingerprintService } from 'src/app/services/fingerprint.service';

@Component({
  selector: 'app-login-fingerprint',
  templateUrl: './login-fingerprint.component.html',
  styleUrls: ['./login-fingerprint.component.css']
})
export class LoginFingerprintComponent implements OnInit {

  constructor(private fingerprintService: FingerprintService) { }

  async register() {
    // await this.fingerprintService.registerFingerprint();
    // Optionally, navigate the user to another page or show a success message
  }

  async authenticate() {
    await this.fingerprintService.authenticateFingerprint();
    // Optionally, navigate the user to another page or show a success message
  }

  ngOnInit(): void {
  }

}
