import { AfterContentInit, Component, ContentChildren, EventEmitter, Input, Output, QueryList, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { Column } from '../../../core/models/column.model';
import { AppTemplateDirective } from '../directive/template.directive';


@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [CommonModule, TableModule],
    templateUrl: './datatable.component.html'
})
export class DataTableComponent implements AfterContentInit {
    @Input() columns: Column[] = [];
    @Input() data: any[] = [];
    @Input() loading: boolean = false;
    @Input() title: string = '';
    @Input() showGlobalFilter: boolean = true;
    @Input() globalFilterFields: string[] = [];

    @ContentChildren(AppTemplateDirective) templates!: QueryList<AppTemplateDirective>;
    bodyTemplates: { [key: string]: TemplateRef<any> } = {};
    actionsTemplate!: TemplateRef<any>;

    ngAfterContentInit() {
        this.templates.forEach((item) => {
            const templateName = item.name;
            if (templateName.startsWith('body-')) {
                this.bodyTemplates[templateName.substring(5)] = item.template;
            } else if (templateName === 'actions') {
                this.actionsTemplate = item.template;
            }
        });
    }

    applyGlobalFilter(table: Table, event: Event) {
        const inputElement = event.target as HTMLInputElement;
        table.filterGlobal(inputElement.value, 'contains');
    }

    clearFilter(table: Table) {
        table.clear();
    }
}
