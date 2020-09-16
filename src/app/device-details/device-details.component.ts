import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, Observable, of } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-device-details',
  templateUrl: './device-details.component.html',
  styleUrls: ['./device-details.component.scss']
})
export class DeviceDetailsComponent implements OnInit {
  _value: number = 1;
  _step: number = 1;
  _min: number = 1;
  _max: number = 3;
  _wrap: boolean = false;
  color: string = 'default';
  public deviceDetails$: Observable<any>;
  public isLoad = false;
  public qty = 1;
  public buttonDisable = false;
  @ViewChild('qty') input;

  constructor(
    private titleService: Title,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private route: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar
    ) {
  }

  ngOnInit(): any {
    this.activatedRoute.queryParams.subscribe(res => {
      this.deviceDetails$ = this.apiService.getApi('api/device-details/' + res.skuid).pipe(
        map((response) => {
            return response;
          }
        )
      );
    });
    this.deviceDetails$.subscribe(response => {
      if (response) {
        this.isLoad = true;
        this.titleService.setTitle(response.devicename);
      } else {
        this.route.navigate(['/devices']);
      }
    },
    error => {
      this.snackBar.open('Oops..API Error', 'Retry', {
        duration: 2000,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'center', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['red-snackbar'],
      });
      this.route.navigate(['/devices']);
    });
  }

  public addToCart(deviceDetail): void {
    this.buttonDisable = true;
    deviceDetail.qty = Number(this.input.nativeElement.value);
    deviceDetail.deviceofferprice = Number(deviceDetail.deviceofferprice);
    deviceDetail.deviceprice = Number(deviceDetail.deviceprice);
    this.apiService.postApi('api/device-details', deviceDetail).subscribe((res) => {
      this.route.navigate(['/checkout']);
    },
    error => {
      this.snackBar.open('Oops..API Error', 'Retry', {
        duration: 2000,
      });
      this.route.navigate(['/devices']);
    });
  }

  private parseNumber(num: any): number {
    return +num;
  }

  private parseBoolean(bool: any): boolean {
    return !!bool;
  }

  setColor(color: string): void {
    this.color = color;
  }

  getColor(): string {
    return this.color;
  }

  incrementValue(step: number = 1): void {
    let inputValue = this._value + step;
    if (this._wrap) {
      inputValue = this.wrappedValue(inputValue);
    }
    this._value = inputValue;
  }

  private wrappedValue(inputValue): number {
    if (inputValue > this._max) {
      return this._min + inputValue - this._max;
    }
    if (inputValue < this._min) {
      if (this._max === Infinity) {
        return 0;
      }
      return this._max + inputValue;
    }
    return inputValue;
  }

  shouldDisableDecrement(inputValue: number): boolean {
    return !this._wrap && inputValue <= this._min;
  }

  shouldDisableIncrement(inputValue: number): boolean {
    return !this._wrap && inputValue >= this._max;
  }

}
