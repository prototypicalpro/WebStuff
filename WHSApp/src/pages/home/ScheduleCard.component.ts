/*
 * Component to simplify the creation of cards in the way I like them
 */
import { Component, Input } from '@angular/core';

@Component({
  selector: 'schedule-card',
  templateUrl: 'ScheduleCard.component.html',
  styleUrls: ['ScheduleCard.component.css']
})
export class ScheduleCard {
    @Input() periodNum: number;
    @Input() periodTime: String;
}