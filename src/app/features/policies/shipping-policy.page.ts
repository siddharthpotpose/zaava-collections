import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shipping-policy-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shipping-policy.page.html',
  styleUrl: './policy-pages.css'
})
export class ShippingPolicyPage {}
