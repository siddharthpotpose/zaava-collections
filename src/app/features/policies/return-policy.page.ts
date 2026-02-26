import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-return-policy-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './return-policy.page.html',
  styleUrl: './policy-pages.css'
})
export class ReturnPolicyPage {}
