import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';

export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
    selector: 'app-tag',
    standalone: true,
    imports: [CommonModule, TagModule],
    templateUrl: './tag.component.html',
})
export class TagComponent {

    @Input() label: string = '';
    @Input() severity: TagSeverity = 'info';
    @Input() icon?: string;
    @Input() rounded: boolean = false;

}