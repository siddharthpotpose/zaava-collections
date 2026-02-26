import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './terms-and-conditions.page.html',
  styleUrl: './policy-pages.css'
})
export class TermsAndConditionsPage {}
