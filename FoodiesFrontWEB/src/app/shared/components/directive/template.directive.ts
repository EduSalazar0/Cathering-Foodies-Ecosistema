import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
    selector: '[appTemplate]',
    standalone: true,
})
export class AppTemplateDirective {
    @Input('appTemplate') name!: string;

    constructor(public template: TemplateRef<any>) { }
}