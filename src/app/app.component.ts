import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { ModalService } from './services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Observable, of } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy, OnInit {
  title = 'shopping-cart';
  private subscription: Subscription;

  constructor(private ms: ModalService, private titleService: Title, private route: Router) {
    this.subscription = this.ms.getMessage().subscribe(response => {
      console.log('::: response ::: ', response);
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public showCart(): void {
    this.route.navigate(['/checkout']);
  }
}
