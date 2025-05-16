import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from '../service/loader/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent {
  isLoading: Observable<boolean>;

  constructor(private loaderService: LoaderService) {
    this.isLoading = this.loaderService.loading$;
  }
}
