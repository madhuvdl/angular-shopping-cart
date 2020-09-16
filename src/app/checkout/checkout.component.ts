import { Component, OnInit, Inject } from '@angular/core';
import {FormGroup, FormBuilder, FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalService } from '../services/modal.service';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit {

  userAddressForm: FormGroup;
  public hidden = 'hidden';
  public carts;
  public deviceList;
  public states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Virginia', 'Washington'];
  public buttonDisable = false;
  private devicelist;
  public totalprice = 0;
  public currency = '';
  // public orderId = '12345';

  constructor(
    private ms: ModalService,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private titleService: Title,
    public dialog: MatDialog,
    private route: Router,
    private apiService: ApiService,
    private snackBar: MatSnackBar) {
    this.getDevices();
  }

  ngOnInit() {
    this.titleService.setTitle('Checkout');
    const emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.userAddressForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern('[^ ][a-zA-Z ]+[^ ]')]],
      lastName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern('[^ ][a-zA-Z ]+[^ ]')]],
      address: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50), Validators.pattern('[^ ][A-Za-z 0-9_@./#:&+-,\-]+[^ ]')]],
      city: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern('[^ ][a-zA-Z ]+[^ ]')]],
      state: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20), Validators.pattern('[^ ][a-zA-Z ]+[^ ]')]],
      zipcode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('[0-9]+')]],
      email: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern(emailPattern)]],
      mobile: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('[0-9]+')]]
    });
  }

  private getDevices() {
    this.apiService.getApi('api/carts').subscribe(response => {
      this.carts = response;
      this.hidden = '';
      this.carts.forEach((cart) => {
        cart.price = cart.deviceofferprice > 0 ? cart.deviceofferprice * cart.qty : cart.deviceprice * cart.qty;
        this.totalprice += cart.price;
        this.currency = cart.currency;
      });
    },
    error => {
      this.hidden = 'hidden';
      this.snackBar.open('Your cart is empty.', 'Sorry!', {
        duration: 2000,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'center', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['red-snackbar'],
      });
    });
  }

  public onSubmit() {
    if (this.userAddressForm.valid) {
      this.buttonDisable = true;
      this.apiService.postApi('api/checkout', this.userAddressForm.value).subscribe(response => {
        this.openDialog(response);
      },
      error => {
        this.snackBar.open('Oops! Error.', 'Retry!', {
          duration: 2000,
          verticalPosition: 'top', // 'top' | 'bottom'
          horizontalPosition: 'center', //'start' | 'center' | 'end' | 'left' | 'right'
          panelClass: ['red-snackbar'],
        });
      });
    }
  }

  public deleteItem(skuid) {
    this.apiService.deleteApi('api/carts/' + skuid).subscribe(response => {
      this.totalprice = 0;
      this.getDevices();
    },
    error => {
      this.hidden = 'hidden';
      this.snackBar.open('Your cart is empty.', 'Sorry!', {
        duration: 2000,
        verticalPosition: 'top', // 'top' | 'bottom'
        horizontalPosition: 'center', //'start' | 'center' | 'end' | 'left' | 'right'
        panelClass: ['red-snackbar'],
      });
    });
  }

  openDialog(response) {
    this.ms.setMessage(response);
    const dialogRef = this.dialog.open(DialogContentForConfirmation, {
      data: {orderId: response.orderId}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      this.route.navigate(['/devices']);
    });
  }

}

@Component({
  selector: 'dialog-content-for-confirmation',
  templateUrl: 'dialog-content-for-confirmation.html',
})
export class DialogContentForConfirmation implements OnInit {

  public orderId = '';
  constructor(
    private ms: ModalService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.orderId = this.data.orderId;
  }

}
