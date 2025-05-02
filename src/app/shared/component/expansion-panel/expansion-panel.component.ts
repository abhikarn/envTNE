import { Component, Input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-expansion-panel',
  imports: [
    MatExpansionModule
  ],
  templateUrl: './expansion-panel.component.html',
  styleUrl: './expansion-panel.component.scss'
})
export class ExpansionPanelComponent {
  @Input() title: string = '';
  @Input() expanded: boolean = false;
}
