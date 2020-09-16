import { Component, OnInit } from '@angular/core';
import { ModalService } from '../services/modal.service';
import { ApiService } from '../services/api.service';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-device-list',
  templateUrl: './device-list.component.html',
  styleUrls: ['./device-list.component.scss']
})
export class DeviceListComponent implements OnInit {
  public devicelist;

  constructor(
    private ms: ModalService,
    private titleService: Title,
    private route: Router,
    private http: HttpClient,
    private apiService: ApiService,
    private snackBar: MatSnackBar) {
    this.titleService.setTitle('Welcome to Shop Online - Device List');
  }

  public deviceInfo(skuId: string): void {
    this.route.navigate(['/device-details'], { queryParams: { skuid: skuId } });
  }

  ngOnInit(): void {
    this.ms.setMessage('passing data');
    this.apiService.getApi('api/devices').subscribe(response => {
      this.devicelist = response;
    },
    error => {
      this.snackBar.open('Oops..API Error', 'Retry', {
        duration: 2000,
      });
    });
  }

}
